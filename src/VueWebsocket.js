import config from './config';
import core from './core';

export default class VueWebSocket {
    constructor(options) {
        if (!options.url) {
            throw new Error('[VueWebSocket] Cannot create VueWebSocket instance, without a wss URL!');
        }
        core.self = this;
        this.options = Object.assign(config, options);
        this.socket = null;
        this.connected = null;
        this.handlers = new Map();
        this.reconnectAttempts = 0;
        if (this.options.autoConnect) this.open();
    }

    open() {
        if (!this.connected) {
            let url = this._parseUrl(this.options.url, this.options.queryString);
            this.socket = new WebSocket(url);
            this._bind();
            if (this.options.debug) {
                console.log('[VueWebSocket] Websocket connecting to %s', url);
            }
        } else {
            this.close(3001, 'Connection Change');
            if (this.options.debug) {
                console.log('[VueWebSocket] Websocket instance already exists! Closing the current one, and opening a new one!');
            }
        }
    }

    close(code = null, reason = null) {
        if (this.socket) {
            this.socket.close(code, reason);
        } else {
            console.error('[VueWebSocket] Trying to close not initialized socket instance.');
        }
    }


    send(event, data) {
        if (!core.self.connected) {
            if (core.self.options.debug) {
                console.log('[VueWebSocket] Cannot send message while the WebSocket is not connected.')
            }
            return;
        }
        if (core.self.options.debug) {
            console.log('[VueWebSocket] ws-out >>> %s', event, data);
        }
        core.self.socket.send(
            JSON.stringify(
                {
                    event: event,
                    data: data
                }
            )
        )
    }

    setUrl(url, qs = undefined) {
        if (!url) {
            throw new Error('[VueWebSocket] URL Cannot be empty!');
        }
        if (qs !== undefined) {
            this.options.queryString = qs;
        }
        this.url = url;
    }

    _reopen() {
        if (this.options.reconnect) {
            this.reconnectAttempts += 1;
            setTimeout(this.open.bind(this), this.reconnectIn);
            console.log('[VueWebSocket] Reconnecting in %ds', this.reconnectIn / 1000);
        }
    }

    _bind() {
        this.socket.onopen = this._onOpen.bind(this);
        this.socket.onmessage = this._onData.bind(this);
        this.socket.onerror = this._onError.bind(this);
        this.socket.onclose = this._onClose;
    }

    _unbind() {
        this.socket.removeEventListener('open', this._onOpen);
        this.socket.removeEventListener('message', this._onData);
        this.socket.removeEventListener('error', this._onError);
        this.socket.removeEventListener('close', this._onClose);
    }

    _ping() {
        this.send('ping', Date.now());
        core.pongTimeout = setTimeout(() => {
            if (this.options.debug) {
                console.log('[VueWebSocket] WebSocket connection timed out!');
            }
            clearInterval(core.pingInterval);
            this._unbind();
            this.connected = null;
            this.socket.retired = true;
            this.close(3000, 'Forced Retiring!');
        }, this.monitorTimeout);
    }

    _pong() {
        clearTimeout(core.pongTimeout);
    }

    _onOpen(event) {
        if (this.options.debug) {
            console.log('[VueWebSocket] WebSocket connected to %s!', this.options.url);
        }
        this.connected = Date.now();
        this.reconnectAttempts = 0;
        if (this.options.monitor) core.pingInterval = setInterval(this._ping.bind(this), this.monitorInterval);
        this._trigger('open', event)
    }

    _onError(event) {
        if (this.options.debug) {
            console.error('[VueWebSocket] WebSocket Error!', event);
        }
        this._trigger('error', event)
    }

    _onData({ data }) {
        try {
            data = JSON.parse(data);
        }
        catch(error) {
            throw new Error('[VueWebSocket] Failed to parse data!');
        }
        if (this.options.debug) {
            console.log('[VueWebSocket] ws-in <<< %s', data.event, data.data);
        }
        this._pong();
        this._trigger(data.event, data.data)
    }

    _onClose(event) {
        if (!this.retired) {
            let self = core.self;
            if (event.code === 1006) {
                self._reopen();
            }
            if (self.connected) {
                self.connected = null;
                if (self.options.monitor) {
                    clearTimeout(core.pongTimeout);
                    clearInterval(core.pingInterval);
                }
                if (event.code === 3001) {
                    self.open();
                }
            }
            self._trigger('close', event)
        }
    }

    _parseUrl(url, qs = null) {
        let wsCheck = url.indexOf('ws://') === -1 && url.indexOf('wss://') === -1;
        if (wsCheck) { 
            let protocol = 'ws'
            if (window.location.protocol.indexOf('https') > -1) protocol = 'wss'
            url = [protocol, url].join('://');
        }
        if (qs) qs = new URLSearchParams(qs).toString();
        return qs ? [url, qs].join('?') : url;
    }

    _trigger(event, data) {
        if(this.handlers.has(event)) {
            for(var [uuid, cb] of this.handlers.get(event).entries()) {
                cb(data)
            }
        }
    }

    get monitorInterval() {
        return this.options.monitor.interval * 1000;
    }

    get monitorTimeout() {
        return this.options.monitor.timeout * 1000;
    }

    get reconnectIn() {
        let reconnect = this.options.reconnect;
        if (reconnect.interval) return reconnect.interval * 1000;
        return this.reconnectAttempts < reconnect.maxTimeout ? this.reconnectAttempts * 1000 : reconnect.maxTimeout;
    }

    get proto() {
        return {
            open: this.open,
            close: this.close,
            send: this.send,
            setUrl: this.setUrl
        }
    }
}
