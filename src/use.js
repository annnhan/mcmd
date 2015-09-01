/**
 * @file
 * Created by an.han on 15/9/1.
 */

var Promise = require('./promise');
var load = require('./load');

module.exports = function use(ids, callback) {

    if (!Array.isArray(ids)) {
        id = [ids]
    }

    Promise.all(ids.map(function (id) {
        return load(id);
    })).then(function (list) {
        callback.apply(window, list);
    }, function (err) {
        throw err;
    });
}