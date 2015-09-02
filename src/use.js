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