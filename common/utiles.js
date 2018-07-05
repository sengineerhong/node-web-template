// const debug = require('debug')('agents:middleware')
const _ = require('lodash');
module.exports = {
    getMaxNum: (obj, key) => {
        Math.max.apply(Math, obj.map(function (o) {
            return o.byteSum;
        }));
    },

    getMysqlRowToJson: (rows) => {
        var jArry = [];
        for (var i = 0; i < rows.length; i++) {
            jArry.push(JSON.parse(JSON.stringify(rows[i])));
        }
        return jArry;
    },

    genResObjFormat: (code, msg, resultObj) => {
        return {status: {code: code, msg: msg}, result: resultObj};
    }
};
