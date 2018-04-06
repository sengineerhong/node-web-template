const entiretyModel = require('../models/entiretyModel');
const nconf = require('nconf');
const moment = require('moment');
const _ = require('lodash');
const utiles = require('../../common/utiles');

exports.checkTableExist = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            dbName: nconf.get('db_maria:database'),
            tbName: 'acct_' + moment(req.body.strDate).format('YYYY-MM-DD HH:mm:ss').substr(0, 10).replace(/-/g, '')
        };
        data = await entiretyModel.checkTableExist(param);

        if (data[0].tbCnt === 1) {
            req.body.dbName  = param.dbName;
            req.body.tbName  = param.tbName;
            next();
        } else {
            if (_.includes(req.originalUrl, '/grid')) {
                return res.json({data: []});
            } else {
                return res.json([]);
            }
            // return res.status(999).send({ error: 'no data!' });
        }
    } catch (error) {
        return next(error);
    }
};

exports.getAcctTest1Grid_reqOnce = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.body.strDate,
            dbName: req.body.dbName,
            tbName: req.body.tbName
        };
        data = await entiretyModel.getAcctTest1Grid_reqOnce(param);
        // data = await entiretyModel.getAcctTest1Grid_reqOnce_alasql2(param);
    } catch (error) {
        return next(error);
    }
    return res.json({data: data});
};

exports.getAcctTest1Chart = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.body.strDate,
            range: parseInt(req.body.range) * 60,
            dbName: req.body.dbName,
            tbName: req.body.tbName
        };
        data = await entiretyModel.getAcctTest1Chart(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctTest2Grid_reqOnce = async (req, res, next) => {
    let gridArry = '';
    try {
        const param = {
            strDate: req.body.strDate,
            strDateYMD: moment(req.body.strDate).format('YYYY-MM-DD HH:mm:ss').substr(0, 10),
            // strDate: '2018-04-06 13:35:00',
            // strDateYMD: '2018-04-02',
            dbName: req.body.dbName,
            tbName: req.body.tbName
        };
        // get iface out list
        let ifoListRows = await entiretyModel.getAcctIfoListGrid(param);
        // console.log(ifoListRows);
        // rows to json
        let ifoListArry = utiles.getMysqlRowToJson(ifoListRows);
        // get grid data
        let data = await entiretyModel.getAcctTest2Grid_reqOnce(param);
        // rows to json
        gridArry = utiles.getMysqlRowToJson(data);
        // console.log(ifoListArry);
        // trans pivot
        _.forEach(gridArry, function (obj) {
            obj.bpsSum = 0;
            // console.log(ifoListArry);
            _.forEach(ifoListArry, function (ifo) {
                obj[ifo.ifaceOutAs] = '';
            });
            var ifaceOutAs = obj.ifaceOutAs;
            var byteSum = obj.byteSum;
            var seconds = obj.seconds;
            _.forEach(obj, function (k, v) {
                if (k === ifaceOutAs) {
                    // Gbps
                    obj[k] = Number((byteSum / seconds / 125000000).toFixed(2));
                    obj.bpsSum = Number(obj[k]);
                }
            });
        });
        // console.log(gridArry);
    } catch (error) {
        return next(error);
    }
    return res.json({data: gridArry});
};

exports.getAcctTest2Chart = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.body.strDate,
            dbName: req.body.dbName,
            tbName: req.body.tbName
        };
        data = await entiretyModel.getAcctTest2Chart(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctTest2Pie = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.body.strDate,
            dbName: req.body.dbName,
            tbName: req.body.tbName
        };
        data = await entiretyModel.getAcctTest2Pie(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctIfoListGrid = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDateYMD: moment(req.body.strDateYMD).format('YYYY-MM-DD HH:mm:ss').substr(0, 10)
            // strDateYMD: '2018-04-02'
        };
        data = await entiretyModel.getAcctIfoListGrid(param);
    } catch (error) {
        return next(error);
    }
    return res.json({data: data});
};

exports.getAcctIfoListGridUpdate = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            displayYn: req.body.displayYn,
            ifaceOut: req.body.ifaceOut,
            ifaceOutAs: req.body.ifaceOutAs
        };
        data = await entiretyModel.getAcctIfoListGridUpdate(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctTest1Grid = async (req, res, next) => {
    let iTotalRecords;
    let data = '';
    try {
        var totalCntRow = await entiretyModel.getAcctTest1GridTotal(req);
        iTotalRecords = totalCntRow[0].iTotalRecords
        data = await entiretyModel.getAcctTest1Grid(req);
    } catch (error) {
        return next(error);
    }
    return res.json({sEcho: req.body.sEcho, iTotalRecords: iTotalRecords, iDisplayLength: iTotalRecords, data: data});
};

exports.getAllLoginPath = async (req, res, next) => {
    let result = '';
    try {
        result = await entiretyModel.getAllLoginPath();
    } catch (error) {
        return next(error);
    }
    return res.json(result);
};

exports.getAllDailySalesGrid = async (req, res, next) => {
    let result = '';
    try {
        result = await entiretyModel.getAllDailySalesGrid();
        result['progress'] = '31/31';
    } catch (error) {
        return next(error);
    }
    return res.json(result);
};

exports.getAllDailySalesYoy = async (req, res, next) => {
    let result = '';
    try {
        result = await entiretyModel.getAllDailySalesYoy();
        result['progress'] = '31/31';
    } catch (error) {
        return next(error);
    }
    return res.json(result);
};
