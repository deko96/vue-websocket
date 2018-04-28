/*!
 * /**
 *  * vue-websocket v0.1.0
 *  * https://github.com/deko96/vue-websocket
 *  * Released under the MIT License.
 *  */
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VueWebSocket"] = factory();
	else
		root["VueWebSocket"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__VueWebsocket__ = __webpack_require__(1);


/* harmony default export */ __webpack_exports__["default"] = ({
    install(Vue, options) {
        let socket = new __WEBPACK_IMPORTED_MODULE_0__VueWebsocket__["a" /* default */](options);

        Vue.prototype.$socket = socket.proto;

        Vue.mixin({
            beforeCreate: function () {
                let handlers = this.$options["websocket"];
                if (handlers) {
                    Object.keys(handlers).forEach(event => socket.handlers[event] = handlers[event]);
                }
            }
        });
    }
});


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__EventEmmiter__ = __webpack_require__(4);




class VueWebSocket {
    constructor(options) {
        if (!options.url) {
            throw new Error('[VueWebSocket] Cannot create VueWebSocket instance, without a wss URL!');
        }
        __WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].self = this;
        this.options = Object.assign(__WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */], options);
        this.emitter = new __WEBPACK_IMPORTED_MODULE_2__EventEmmiter__["a" /* default */]();
        this.socket = null;
        this.connected = null;
        this.handlers = {};
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
        if (!this.connected) {
            if (this.options.debug) {
                console.log('[VueWebSocket] Cannot send message while the WebSocket is not connected.')
            }
            return;
        }
        if (this.options.debug) {
            console.log('[VueWebSocket] ws-out >>> %s', event, data);
        }
        this.socket.send(
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
        __WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pongTimeout = setTimeout(() => {
            if (this.options.debug) {
                console.log('[VueWebSocket] WebSocket connection timed out!');
            }
            clearInterval(__WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pingInterval);
            this._unbind();
            this.connected = null;
            this.socket.retired = true;
            this.close(3000, 'Forced Retiring!');
        }, this.monitorTimeout);
    }

    _pong() {
        clearTimeout(__WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pongTimeout);
    }

    _onOpen(event) {
        if (this.options.debug) {
            console.log('[VueWebSocket] WebSocket connected to %s!', this.options.url);
        }
        this.connected = Date.now();
        this.reconnectAttempts = 0;
        if (this.options.monitor) __WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pingInterval = setInterval(this._ping.bind(this), this.monitorInterval);
        this.emitter.emit('open', event);
        if (this.handlers['open']) this.handlers['open'](event);
    }

    _onError(event) {
        if (this.options.debug) {
            console.error('[VueWebSocket] WebSocket Error!', event);
        }
        this.emitter.emit('error', event);
        if (this.handlers['error']) this.handlers['error'](event);
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
        this.emitter.emit(data.event, data.data);
        if (this.handlers[data.event]) this.handlers[data.event](data.data);
    }

    _onClose(event) {
        if (!this.retired) {
            let self = __WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].self;
            if (event.code === 1006) {
                self._reopen();
            }
            if (self.connected) {
                self.connected = null;
                if (self.options.monitor) {
                    clearTimeout(__WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pongTimeout);
                    clearInterval(__WEBPACK_IMPORTED_MODULE_1__core__["a" /* default */].pingInterval);
                }
                if (event.code === 3001) {
                    self.open();
                }
            }
            self.emitter.emit('close', event);
            if (self.handlers['close']) self.handlers['close'](event);
        }
    }

    _parseUrl(url, qs = null) {
        let wsCheck = url.indexOf('ws://') === -1;
        if (wsCheck) url = ['ws', url].join('://');
        if (qs) qs = new URLSearchParams(qs).toString();
        return qs ? [url, qs].join('?') : url;
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
            on: this.emitter.on,
            once: this.emitter.once,
            setUrl: this.setUrl
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = VueWebSocket;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
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
});


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
    self: null,
    pingInterval: null,
    pongTimeout: null
});


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var EventEmitter = function () {
    this.events = {};
};

EventEmitter.prototype.on = function (event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }

    this.events[event].push(listener);
};

EventEmitter.prototype.removeListener = function (event, listener) {
    var idx;

    if (typeof this.events[event] === 'object') {
        idx = indexOf(this.events[event], listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

EventEmitter.prototype.emit = function (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

EventEmitter.prototype.once = function (event, listener) {
    this.on(event, function g () {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};

/* harmony default export */ __webpack_exports__["a"] = (EventEmitter);


/***/ })
/******/ ]);
});
//# sourceMappingURL=vue-websocket.js.map