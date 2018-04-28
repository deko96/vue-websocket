import VueWebSocket from './VueWebsocket';

export default {
    install(Vue, options) {
        let socket = new VueWebSocket(options);

        Vue.mixin({
            beforeCreate: function () {
                let handlers = this.$options["websocket"];
                if (handlers) {
                    Object.keys(handlers).forEach(event => socket.handlers[event] = handlers[event]);
                }
            }
        });
    }
};
