(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */

var util = require('./util');
var Promise = require('./promise');
var Module = require('./module');

module.exports = function (factory) {
    var id = getCurrentScript().replace(location.origin, '');
    var mod = mcmd.modules[id];
    var dependences = mod.dependences = getDenpendence(factory.toString());
    mod.factory = factory;
    if (dependences) {
        Promise.all(dependences.map(function (id) {
            return new Promise(function (resolve, reject) {
                id = mcmd.config.root + id;
                var depMode = mcmd.modules[id] || Module.create(id);
                depMode.on('complate', resolve);
                depMode.on('error', reject);
            });
        })).then(function () {
            mod.setStatus(mcmd.MODULE_STATUS.COMPLETED);
        }, function (error) {
            mod.setStatus(mcmd.MODULE_STATUS.ERROR, error);
        });
    }
    else {
        mod.setStatus(mcmd.MODULE_STATUS.COMPLETED);
    }
}

// 获取当前执行的script节点
function getCurrentScript() {
    var doc = document;
    if(doc.currentScript) {
        return doc.currentScript.src;
    }
    var stack;
    try {
        a.b.c();
    } catch(e) {
        stack = e.stack;
        if(!stack && window.opera){
            stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
    }
    if(stack) {
        stack = stack.split( /[@ ]/g).pop();
        stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
        return stack.replace(/(:\d+)?:\d+$/i, "");
    }
    var nodes = head.getElementsByTagName("script");
    for(var i = 0, node; node = nodes[i++];) {
        if(node.readyState === "interactive") {
            return node.className = node.src;
        }
    }
}

// 解析依赖
function getDenpendence(factory) {
    var list = factory.match(/require\(.+?\)/g);
    if (list) {
        list = list.map(function (dep) {
            return dep.replace(/(^require\(['"])|(['"]\)$)/g, '');
        });
    }
    return list;
}


},{"./module":4,"./promise":5,"./util":8}],2:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */

var Promise = require('./promise');
var Module = require('./module');
var util = require('./util');

module.exports = function (id, callback) {
    return new Promise(function (resolve, reject) {
        var mod =  mcmd.modules[id] || Module.create(id);
        mod.on('complate', function () {
            var exp = util.getModuleExports(mod);
            if (typeof callback === 'function') {
                callback(exp);
            }
            resolve(exp);
        });
        mod.on('error', reject);
    });
}
},{"./module":4,"./promise":5,"./util":8}],3:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */

var g = window;
g.define = require('./define');
g.mcmd = {
    use: require('./use'),
    require: require('./require'),
    modules: {},
    config: {
        root: '/'
    },
    setConfig: function (obj) {
        for (var key in obj) {
            this.config[key] = obj[key];
        }
    },
    MODULE_STATUS: {
        PENDDING: 0,
        LOADING: 1,
        COMPLETED: 2,
        ERROR: 3
    }
};


},{"./define":1,"./require":6,"./use":7}],4:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/2.
 */

function Module(id) {
    mcmd.modules[id] = this;
    this.id = id;
    this.status = mcmd.MODULE_STATUS.PENDDING;
    this.factory = null;
    this.dependences = null;
    this.callbacks = {};
    this.load();
}

Module.create = function (id) {
    return new Module(id);
}

Module.prototype.load = function () {
    var id = this.id;
    var script = document.createElement('script');
    script.src = id;
    script.onerror = function (event) {
        this.setStatus(mcmd.MODULE_STATUS.ERROR, {
            id: id,
            error: (this.error = new Error('module can not load.'))
        });
    }.bind(this);
    document.head.appendChild(script);
    this.setStatus(mcmd.MODULE_STATUS.LOADING);
}

Module.prototype.on = function (event, callback) {
    (this.callbacks[event] || (this.callbacks[event] = [])).push(callback);
    if (
        (this.status === mcmd.MODULE_STATUS.LOADING && event === 'load') ||
        (this.status === mcmd.MODULE_STATUS.COMPLETED && event === 'complate')
    ) {
        callback(this);
    }
    if (this.status === mcmd.MODULE_STATUS.ERROR && event === 'error') {
        callback(this, this.error);
    }
}

Module.prototype.fire = function (event, arg) {
    (this.callbacks[event] || []).forEach(function (callback) {
        callback(arg || this);
    }.bind(this));
}

Module.prototype.setStatus = function (status, info) {
    if (this.status !== status) {
        this.status = status;
        switch (status) {
            case mcmd.MODULE_STATUS.LOADING:
                this.fire('load');
                break;
            case mcmd.MODULE_STATUS.COMPLETED:
                this.fire('complate');
                break;
            case mcmd.MODULE_STATUS.ERROR:
                this.fire('error', info);
                break;
            default:
                break;
        }
    }
}

module.exports = Module;
},{}],5:[function(require,module,exports){
// status
var PENDING = 0,
    RESOLVED = 1,
    REJECTED = 2;

var Promise = function (fun) {

    if (typeof fun !== 'function') {
        throw 'Promise resolver is not a function';
        return;
    }

    var me = this,
        resolve = function (val) {
            me.resolve(val);
        },
        reject = function (val) {
            me.reject(val);
        }
    me._status = PENDING;
    me._onResolved = [];
    me._onRejected = [];

    fun(resolve, reject);
}

var fn = Promise.prototype;

fn.then = function (onResolved, onRejected) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var onResolvedWraper = function (val) {
            var ret = onResolved ? onResolved(val) : val;
            if (Promise.isPromise(ret)) {
                ret.then(function (val) {
                    resolve(val);
                });
            }
            else {
                resolve(ret);
            }
        };
        var onRejectedWraper = function (val) {
            var ret = onRejected ? onRejected(val) : val;
            reject(ret);
        };

        self._onResolved.push(onResolvedWraper);
        self._onRejected.push(onRejectedWraper);

        if (self._status === RESOLVED) {
            onResolvedWraper(self._value);
        }

        if (self._status === REJECTED) {
            onRejectedWraper(self._value);
        }
    });
}

fn.catch = function (onRejected) {
    return this.then(null, onRejected);
}

fn.resolve = function (val) {
    if (this._status === PENDING) {
        this._status = RESOLVED;
        this._value = val;
        for (var i = 0, len = this._onResolved.length; i < len; i++) {
            this._onResolved[i](val);
        }
    }
}

fn.reject = function (val) {
    if (this._status === PENDING) {
        this._status = REJECTED;
        this._value = val;
        for (var i = 0, len = this._onRejected.length; i < len; i++) {
            this._onRejected[i](val);
        }
    }
}

Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
        var len = arr.length,
            i = -1,
            count = 0,
            results = [];
        while (++i < len) {
            ~function (i) {
                arr[i].then(
                    function (val) {
                        results[i] = val;
                        if (++count === len) {
                            resolve(results);
                        }
                    },
                    function (val) {
                        reject(val);
                    }
                );
            }(i);
        }
    });
}

Promise.race = function (arr) {
    return new Promise(function (resolve, reject) {
        var len = arr.length,
            i = -1;
        while (++i < len) {
            arr[i].then(
                function (val) {
                    resolve(val);
                },
                function (val) {
                    reject(val);
                }
            );
        }
    });
}

Promise.resolve = function (obj) {
    if (Promise.isPromise(obj)) {
        return obj;
    }
    return new Promise(function (resolve) {
        resolve();
    });
}

Promise.reject = function (obj) {
    if (Promise.isPromise(obj)) {
        return obj;
    }
    return new Promise(function (resolve, reject) {
        reject();
    });
}

Promise.isPromise = function (obj) {
    return obj instanceof Promise;
}

module.exports = Promise;
},{}],6:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */
var util = require('./util');

module.exports = function (id) {
    id = mcmd.config.root + id;
    var mod = mcmd.modules[id];
    if (mod) {
        return util.getModuleExports(mod);
    }
    else {
        throw 'can not get module by from:' + id;
    }
}

module.exports.async = function (ids, callback) {
    mcmd.use(ids, callback);
}
},{"./util":8}],7:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */

var Promise = require('./promise');
var load = require('./load');

module.exports = function use(ids, callback) {

    if (!Array.isArray(ids)) {
        ids = [ids]
    }

    Promise.all(ids.map(function (id) {
        return load(mcmd.config.root + id);
    })).then(function (list) {
        if (typeof callback === 'function') {
            callback.apply(window, list);
        }
    }, function (errorInfo) {
        throw errorInfo;
    });
}
},{"./load":2,"./promise":5}],8:[function(require,module,exports){
/**
 * @file
 * Created by an.han on 15/9/1.
 */


module.exports = {
    getModuleExports: function (mod) {
        if (!mod.exports) {
            mod.exports = {};
            mod.factory(mcmd.require, mod.exports, mod);
        }
        return mod.exports;
    }
};
},{}]},{},[3]);
