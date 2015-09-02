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

