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
                        if (socket.handlers.has(event)) {
                            socket.handlers.get(event).push(handler)
                        } else {
                            socket.handlers.set(event, [ handler ])
                        }
                    });
                }
            }
        });
    }
};
