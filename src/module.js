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
        (this.status === mcmd.MODULE_STATUS.COMPLETED && event === 'complete')
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
                this.fire('complete');
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