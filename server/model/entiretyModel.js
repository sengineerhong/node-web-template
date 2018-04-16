const db = require('../config/mysql2');
const pool = db.connPool;
const fs = require('fs');
const path = require('path');
const query = require('../sql/entiretySql');
const fakeFilePath = path.resolve(__dirname, '../data');
const alasql = require('alasql');
const now = require('performance-now');
const tunnel = require('tunnel-ssh');

exports.checkTableExist = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.CommonTabledExist;

        pool.query(sql, [param.dbName, param.tbName], (err, rows) => {
            // console.log('=============================1' + param.dbName);
            // console.log('=============================1' + param.tbName);
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1Grid_reqOnce = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctTest1Grid_reqOnce;

        pool.query(sql, [param.tbName, param.strDate, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1Chart = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1Chart;

        pool.query(sql, [param.tbName, param.strDate, param.strDate, param.range], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest2Grid_reqOnce = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctTest2Grid_reqOnce;

        pool.query(sql, [param.tbName, param.strDate, param.interval, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest2Chart = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest2Chart;

        pool.query(sql, [param.tbName, param.strDate, param.interval, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest2Pie = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest2Pie;

        pool.query(sql, [param.tbName, param.strDate, param.interval, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctIfoListGrid = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctIfoListGrid;

        pool.query(sql, [param.strDateYMD], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctIfoListGridDispFlag = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctIfoListGridDispFlag;

        pool.query(sql, [param.displayYn, param.strDateYMD], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctIfoListGridUpdate = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctIfoListGridUpdate;
        pool.query(sql, [param.ifaceOutAs, param.displayYn, param.ifaceOut], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1GridTotal = () => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1GridTotal;

        pool.query(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1Grid = (req) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1Grid;

        pool.query(sql, [parseInt(req.body.iDisplayStart), parseInt(req.body.iDisplayLength)], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllLoginPath = () => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AllLoginPath;

        pool.query(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1Grid_reqOnce_alasql = (param) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(fakeFilePath, 'acct_sample_half.json'), 'utf8', function (err, data) {
            if (err) reject(err);
            else {
                var fReadEnd = now();

                var result = alasql(query.AcctTest1Grid_reqOnce_alasql, [JSON.parse(data)]);

                var pAlaSqlEnd = now();
                console.log('alasqlTime:' + (pAlaSqlEnd - fReadEnd).toFixed(3));
                resolve(result);
            }
        });
    });
};

exports.getAcctTest1Grid_reqOnce_alasql2 = (param) => {
    return new Promise((resolve, reject) => {
        var fReadEnd = now();

        alasql('select * from JSON("' + path.join(fakeFilePath, 'acct_sample_short.json') + '")', function (res) {
            var pAlaSqlEnd = now();
            console.log('result:' + JSON.stringify(res));
            console.log('alasqlTime:' + (pAlaSqlEnd - fReadEnd).toFixed(3));
            // resolve(result);
        });
    });
};

exports.getAllDailySalesGrid = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(fakeFilePath, 'dailysales.json'), 'utf8', function (err, data) {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
};

exports.getAllDailySalesYoy = () => {
    return new Promise((resolve, reject) => {

        fs.readFile(path.join(fakeFilePath, 'dailysalesyoy.json'), 'utf8', function (err, data) {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
};
