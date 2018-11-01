import VueWebSocket from './VueWebsocket';

export default {
    install(Vue, options) {
        let socket = new VueWebSocket(options);

        Vue.prototype.$socket = socket.proto;

        Vue.mixin({
            beforeCreate: function () {
                let handlers = this.$options["websocket"];
                if (handlers) {
                    Object.keys(handlers).forEach(event => {
                        let handler = handlers[event].bind(this)
                        if (!socket.handlers.has(event)) socket.handlers.set(event, new Map())
                        socket.handlers.get(event).set(this._uid, handler)
                    });
                }
            },
            beforeDestroy: function() {
                let handlers = socket.handlers.entries();
                for (var [event, map] of handlers) {
                    map.delete(this._uid)
                }
            }
        });
    }
};