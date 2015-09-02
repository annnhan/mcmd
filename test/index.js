/**
 * @file
 * Created by an.han on 15/9/2.
 */
define(function (require, exports, module) {
    var log = require('log.js');
    var msg = require('msg.js');

    exports.log = function () {
        log(msg);
    }

});