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
    return Promise(function (resolve, reject) {
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