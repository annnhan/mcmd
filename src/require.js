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
        throw 'can not get module by id:' + id;
    }
}

module.exports.async = function (ids, callback) {
    mcmd.use(ids, callback);
}