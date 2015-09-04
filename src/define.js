/**
 * @file
 * Created by an.han on 15/9/1.
 */

var util = require('./util');
var Promise = require('./promise');
var Module = require('./module');

module.exports = function (factory) {
    var id = getCurrentScript().replace(location.origin, '');
    var mod = mcmd.modules[id];
    var dependences = mod.dependences = getDenpendence(factory.toString());
    mod.factory = factory;
    if (dependences) {
        Promise.all(dependences.map(function (id) {
            return new Promise(function (resolve, reject) {
                id = mcmd.config.root + id;
                var depMode = mcmd.modules[id] || Module.create(id);
                depMode.on('complete', resolve);
                depMode.on('error', reject);
            });
        })).then(function () {
            mod.setStatus(mcmd.MODULE_STATUS.COMPLETED);
        }, function (error) {
            mod.setStatus(mcmd.MODULE_STATUS.ERROR, error);
        });
    }
    else {
        mod.setStatus(mcmd.MODULE_STATUS.COMPLETED);
    }
}

// 获取当前执行的script节点
function getCurrentScript() {
    var doc = document;
    if(doc.currentScript) {
        return doc.currentScript.src;
    }
    var stack;
    try {
        a.b.c();
    } catch(e) {
        stack = e.stack;
        if(!stack && window.opera){
            stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
    }
    if(stack) {
        stack = stack.split( /[@ ]/g).pop();
        stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
        return stack.replace(/(:\d+)?:\d+$/i, "");
    }
    var nodes = head.getElementsByTagName("script");
    for(var i = 0, node; node = nodes[i++];) {
        if(node.readyState === "interactive") {
            return node.className = node.src;
        }
    }
}

// 解析依赖
function getDenpendence(factory) {
    var list = factory.match(/require\(.+?\)/g);
    if (list) {
        list = list.map(function (dep) {
            return dep.replace(/(^require\(['"])|(['"]\)$)/g, '');
        });
    }
    return list;
}

