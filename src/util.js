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