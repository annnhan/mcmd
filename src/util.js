/**
 * @file
 * Created by an.han on 15/9/1.
 */


module.exports = {
    getModuleExports: function (mod) {
        var returns;
        if (!mod.exports) {
            mod.exports = {};
            returns = mod.factory(mcmd.require, mod.exports, mod);
        }
        //优先使用return传递的模块接口
        return returns || mod.exports;
    }
};
