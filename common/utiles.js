// const debug = require('debug')('agents:middleware')
const _ = require('lodash');
module.exports = {
    getMaxNum: (obj, key) => {
        Math.max.apply(Math, obj.map(function (o) {
            return o.byteSum;
        }));
    }
};
