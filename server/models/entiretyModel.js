const pool = require('../config/mysql').pool;
const fs = require('fs');
const path = require('path');
const query = require('../sql/entiretySql');
const fakeFilePath = path.resolve(__dirname, "../data");

exports.getAcctTest1Chart = () => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1Chart;

        pool.query(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest1Grid_reqOnce = () => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.AcctTest1Grid_reqOnce;

        pool.query(sql, [], (err, rows) => {
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

exports.getAllDailySalesGrid = () => {
    return new Promise((resolve, reject) => {

        fs.readFile(path.join(fakeFilePath, "dailysales.json"), 'utf8', function (err, data) {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });

    });
};

exports.getAllDailySalesYoy = () => {
    return new Promise((resolve, reject) => {

        fs.readFile(path.join(fakeFilePath, "dailysalesyoy.json"), 'utf8', function (err, data) {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });

    });
};


