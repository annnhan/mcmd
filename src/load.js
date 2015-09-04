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
        mod.on('complete', function () {
            var exp = util.getModuleExports(mod);
            if (typeof callback === 'function') {
                callback(exp);
            }
            resolve(exp);
        });
        mod.on('error', reject);
    });
}