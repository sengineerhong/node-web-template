const pool = require('../config/mysql').pool;
const fs = require('fs');
const path = require('path');
const query = require('../sql/entiretySql');
const fakeFilePath = path.resolve(__dirname, '../data');

exports.getAcctTest1Chart = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1Chart;

        pool.query(sql, [param.strDate, param.strDate, param.range], (err, rows) => {
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

        pool.query(sql, [param.strDate, param.strDate], (err, rows) => {
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

exports.getAcctTest2Grid_reqOnce = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.AcctTest2Grid_reqOnce;

        pool.query(sql, [param.strDate, param.strDate], (err, rows) => {
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

        pool.query(sql, [param.strDate, param.strDate], (err, rows) => {
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

        pool.query(sql, [param.strDate, param.strDate], (err, rows) => {
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
