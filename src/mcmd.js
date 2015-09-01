/**
 * @file
 * Created by an.han on 15/9/1.
 */

var g = window;
g.define = require('./define');
g.require = require('./require');
g.mcmd = {

    // 使用模块
    use: require('./use'),

    // 模块缓存
    modules: {},

    // 配置
    config: {
        root: '/'
    },

    // 模块状态信息
    MODULE_STATUS: {
        PENDDING: 0,
        LOADING: 1,
        COMPLETED: 2
    }
};

