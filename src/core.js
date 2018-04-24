let pongTimeout = null;
let pingInterval = null;

let self = null;

let computeReconnect = function(attempts, interval, maxTimeout) {
    if (interval) {
        return interval * 1000;
    }
    let value = ++attempts * 1000;
    return value < maxTimeout ? value : maxTimeout;
}


export default {
    config: {
        url: null,
        queryString: null,
        autoConnect: true,
        reconnect: {
            interval: null,
            maxTimeout: 15
        },
        monitor: {
            interval: 5,
            timeout: 3
        },
        debug: false
    },
    socket: null,
    connected: null,
    handlers: {},
    defaultHandlers: ['connected', 'error', 'disconnected'],
    reconnectionAttempts: 0,
    connect: function() {
        self = this;
        if (!this.connected) {
            let url = this.parseConnectUrl(this.config.url, this.config.queryString);
            this.socket = new WebSocket(url);
            this.bind();
            if (this.config.debug) {
                console.log('Websocket connecting to %s', url);
            }
        } else {
            this.socket.close(3001, 'Connection Change');
            if (this.config.debug) {
                console.log('Websocket instance already exists! Closing the current one, and opening a new one!');
            }
        }
        return this.socket;
    },
    close: function(code = null, reason = null) {
        this.socket.close(code, reason);
        return this;
    },
    send: function(event, data) {
        if (!this.connected) {
            if (this.config.debug) {
                console.log('Tried to send message to server while WebSocket is disconnected from the server!');
            }
            return;
        }
        if (this.config.debug) {
            console.log('ws-out >>> %s', event);
        }
        this.socket.send(
            JSON.stringify(
                {
                    event: event,
                    data: data
                }
            )
        )
        return this;
    },
    onOpen: function(event) {
        if (this.config.debug) {
            console.log('WebSocket connected!');
        }
        this.connected = Date.now();
        this.reconnectionAttempts = 0;
        if (this.config.monitor) pingInterval = setInterval(this.ping.bind(this), this.config.monitor.interval * 1000);
    },
    onError: function(event) {
        if (this.config.debug) {
            console.error('WebSocket error!', event);
        }

    },
    onData: function({data}) {
        try {
            data = JSON.parse(data);
        }
        catch(error) {
            throw new Error('Failed to parse WebSocket message!');
        }
        if (this.config.debug) {
            console.log('ws-in <<< ', data);
        }
        this.pong();

    },
    onClose: function(event) {
        if (this.retired) {
            //.. This socket connection was retired
        } else {
            if (event.code === 1006) {
                setTimeout(() => {
                    self.connect();
                }, computeReconnect(self.reconnectionAttempts, self.config.reconnect.interval, self.config.reconnect.maxTimeout));
            }
            if (self.connected) {
                self.connected = null;
                if (self.config.monitor) {
                    clearTimeout(pongTimeout);
                    clearInterval(pingInterval);
                }
                if (event.code === 3001) {
                    self.connect();
                }
            }
        }

    },
    ping: function() {
        this.send('ping', Date.now());
        pongTimeout = setTimeout(function() {
            if (this.config.debug) {
                console.log('Connection timed out!');
            }
            clearInterval(pingInterval);
            this.unbind();
            this.connected = null;
            this.socket.retired = true;
            this.close(3000, 'Forced Retiring');
        }.bind(this), this.config.monitor.timeout * 1000);
    },
    pong: function() {
        clearTimeout(pongTimeout);
    },
    bind: function() {
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onData.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose;
    },
    unbind: function() {
        this.socket.removeEventListener('open', this.onOpen);
        this.socket.removeEventListener('message', this.onData);
        this.socket.removeEventListener('error', this.onError);
        this.socket.removeEventListener('close', this.onClose);
    },
    setUrl: function(url, qs = null) {
        if (!url) {
            throw new Error('Cannot set empty URL!');
        }
        if (qs) {
            this.queryString = qs;
        }
        this.url = ['ws', url].join('://');
        return this;
    },
    parseConnectUrl: function(url, qs = null) {
        let wsCheck = url.indexOf('ws://') === -1;
        if (wsCheck) {
            url = ['ws', url].join('://');
        }

        if (qs) {
            this.config.queryString = qs;
            qs = new URLSearchParams(qs).toString();
        }
        return qs ? [url, qs].join('?') : url;
    }
}
