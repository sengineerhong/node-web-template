const db = require('../config/mysql2');
const pool = db.connPool;
const transactionWrapper = require('./transactionWrapper');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const query = require('../sql/entiretySql');
const fakeFilePath = path.resolve(__dirname, '../data');
const alasql = require('alasql');
const now = require('performance-now');
const tunnel = require('tunnel-ssh');

exports.checkTableExist = (param) => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.selectCommonTabledExist;

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
        const sql = query.selectAcctTest1Grid_reqOnce;

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
        const sql = query.selectAcctTest1Chart;

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
        const sql = query.selectAcctTest2Grid_reqOnce;

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
        const sql = query.selectAcctTest2Chart;

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
        const sql = query.selectAcctTest2Pie;

        pool.query(sql, [param.tbName, param.strDate, param.interval, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest2DstAs = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctTest2DstAs;

        pool.query(sql, [param.dstAsNum], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctTest2Profile = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctTest2Profile;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.setAcctTest2DstAs = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.updateAcctTest2DstAs;

        pool.query(sql, [param.dstAsNum, param.dstAsEngName, param.dstAsOrgName, param.dstAsCntryCode], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctPIfoList = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctPIfoList;

        pool.query(sql, [param.profileId], (err, rows) => {
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
        const sql = query.selectAcctIfoListGrid;

        pool.query(sql, (err, rows) => {
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
        const sql = query.selectAcctIfoListGridDispFlag;

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
        const sql = query.selectAcctIfoListGridUpdate;
        pool.query(sql, [param.ifaceOutAs, param.peerIpSrcAs, param.ifaceOut, param.peerIpSrc], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctProfileGrid = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctProfileGrid;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctProfileDetail = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctProfileDetail;

        pool.query(sql, [param.profileId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctProfileIfaceout = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectAcctProfileIfaceout;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctProfileUpdate = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `update pmacct.acct_profile
                        set profile_Name=?, profile_cmmnt=?, profile_field_bpssum=?, profile_field_peeripsrc=?, profile_field_dstas=?, reg_date=current_timestamp(), profile_field_dstnetmask=?
                        where profile_id=?`;
                    const qArry = [p.updObj.profileName, p.updObj.profileCmmnt, p.updObj.profileFieldBpssum, p.updObj.profileFieldPeeripsrc, p.updObj.profileFieldDstas, p.updObj.profileFieldDstnetmask, p.updObj.profileId];
                    context.conn.query(sql, qArry, (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('update profile(acct_profile) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `delete from pmacct.acct_profile_detail where profile_id = ?`;

                    context.conn.query(sql, [p.updObj.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows >= 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('update profile(delete/acct_profile_detail) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `insert into pmacct.acct_profile_detail (profile_id, iface_out, peer_ip_src, profile_field_ifaceout) values ?`;

                    // console.log(p.ifaceQArry);

                    context.conn.query(sql, [p.ifaceQArry], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === p.ifaceQArry.length) {
                                context.result = {profileId: p.updObj.profileId};
                                resolve(context);
                            } else {
                                context.error = new Error('update profile(insert/acct_profile_detail) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then(transactionWrapper.commitTransaction)
            .then((context) => {
                context.conn.release();
                resolve(context.result);
            })
            .catch((context) => {
                context.conn.rollback(() => {
                    context.conn.release();
                    reject(context.error);
                });
            });
    });
};

exports.getAcctProfileCreate = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `insert into pmacct.acct_profile
                        (profile_name, profile_cmmnt, profile_field_bpssum, profile_field_peeripsrc, profile_field_dstas, reg_date, profile_field_dstnetmask)
                        values (?, ?, ?, ?, ?, current_timestamp(), ?)`;
                    const qArry = [p.pObj.profileName, p.pObj.profileCmmnt, p.pObj.profileFieldBpssum, p.pObj.profileFieldPeeripsrc, p.pObj.profileFieldDstas, p.pObj.profileFieldDstnetmask];
                    context.conn.query(sql, qArry, (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 1) {
                                context.result = rows;
                                resolve(context);
                            } else {
                                context.error = new Error('create profile(insert/acct_profile) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `select profile_id as profileId 
                        from pmacct.acct_profile 
                        where profile_id = ?`;

                    context.conn.query(sql, [context.result.insertId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            // context.result = rows;
                            resolve(context);
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `insert into pmacct.acct_profile_detail (profile_id, iface_out, peer_ip_src, profile_field_ifaceout) values ?`;

                    const profileId = context.result.insertId;

                    let ifaceQArry = [];
                    _.forEach(p.pObj.ifaceArry, function (item, idx) {
                        let tempArry = [];
                        tempArry.push(profileId);
                        tempArry.push(item.ifaceOut);
                        tempArry.push(item.peerIpSrc);
                        tempArry.push(item.fieldIfaceOut);
                        ifaceQArry.push(tempArry);
                    });
                    console.log(ifaceQArry);
                    context.conn.query(sql, [ifaceQArry], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === ifaceQArry.length) {
                                context.result = {profileId: profileId};
                                resolve(context);
                            } else {
                                context.error = new Error('create profile(insert/acct_profile_detail) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then(transactionWrapper.commitTransaction)
            .then((context) => {
                context.conn.release();
                resolve(context.result);
            })
            .catch((context) => {
                console.log(context);
                context.conn.rollback(() => {
                    context.conn.release();
                    reject(context.error);
                });
            });
    });
};

exports.checkProfileNameWhenUpd = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectProfileNameWhenUpd;
        pool.query(sql, [param.profileName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.checkProfileName = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectProfileName;
        pool.query(sql, [param.profileName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.checkProfileTotalCnt = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectProfileTotalCnt;
        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.checkProfileCnt = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.selectProfileCnt;
        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAcctProfileDelete = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `delete from pmacct.acct_profile where profile_id = ?`;

                    context.conn.query(sql, [p.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('delete profile(delete/acct_profile) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql =
                        `delete from pmacct.acct_profile_detail where profile_id = ?`;

                    context.conn.query(sql, [p.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows >= 1) {
                                context.result = {profileId: p.profileId};
                                resolve(context);
                            } else {
                                context.error = new Error('delete profile(delete/acct_profile_detail) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then(transactionWrapper.commitTransaction)
            .then((context) => {
                context.conn.release();
                resolve(context.result);
            })
            .catch((context) => {
                context.conn.rollback(() => {
                    context.conn.release();
                    reject(context.error);
                });
            });
    });
};

exports.getAcctTest1GridTotal = () => {
    return new Promise((resolve, reject) => {
        // const sql = `SELECT * FROM board`;
        const sql = query.selectAcctTest1GridTotal;

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
        const sql = query.selectAcctTest1Grid;

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
        const sql = query.selectAllLoginPath;

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
