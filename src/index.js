import Core from './core';

let computeReconnectInterval = function(attempt, maxTimeout) {
    return (attempt + 1) * 1000 < maxTimeout ? (attempt + 1) * 1000 : maxTimeout * 1000;
};

let VueWebsocket = {
    install(Vue, options) {
        if (!options.url) {
            throw new Error('You must specify an URL to use VueWebSocket plugin!');
        }
        Object.assign(Core.config, options);
        let config = Core.config;
        if (config.autoConnect) Core.connect();
        Vue.prototype.$socket = Core;
        // Vue.prototype.$socket = socket;

        // let eventHandlers = new Map();
        // let defaultHandlers = ['connected', 'error', 'disconnected'];

        // if (!url) {
        //     throw new Error('You must specify an URL to use VueWebSocket plugin!');
        // }

        // socket = new WebSocket(['ws', url].join('://'));
        // Vue.prototype.$socket = socket;

        // socket.onopen = function() {
        //     if (eventHandlers.has('connected')) {
        //         eventHandlers.get('connected').call(this);
        //     }
        //     if (options.monitor) {
        //         setInterval(() => {
        //             this.send(packMessage('ping', Date.now()));
        //         }, options.monitor.interval * 1000);
        //     }
        // };

        // socket.onerror = function() {
        //     if (eventHandlers.has('error')) {
        //         eventHandlers.get('error').call(this);
        //     }
        // };

        // socket.onclose = function() {
        //     if (eventHandlers.has('disconnected')) {
        //         eventHandlers.get('disconnected').call(this);
        //     }
        // };

        // socket.onmessage = function({ data }) {
        //     data = JSON.parse(data);
        //     console.log('message received', data);
        //     if (eventHandlers.has(data.event)) {
        //         eventHandlers.get(data.event).call(this, data.data);
        //     }
        // };

        let bindHandlers = function() {
            let handlers = this.$options["websocket"];
            if (handlers) {
                Object.keys(handlers).forEach(event => Core.handlers[event] = handlers[event]);
            }
        };

        Vue.mixin({
            beforeCreate: bindHandlers
        });
    }
};

export default VueWebsocket;
