const db = require('../config/mysql2');
const pool = db.connPool;
const transactionWrapper = require('./transactionWrapper');
const _ = require('lodash');
const query = require('../sql/entiretySql');

/**
 * @description (MODEL) check table name
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.checkTableExist = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.checkTableExist;
        pool.query(sql, [param.dbName, param.tbName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get traffic history data
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfHistory = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfHistory;
        pool.query(sql, [param.tbName, param.strDate, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get traffic bps usage data
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfBpsUsage = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfBpsUsage;
        pool.query(sql, [param.tbName, param.strDate, param.strDate, param.range], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get ifaceout list(max date)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfIfoList = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfIfoList;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get ifaceout list(profile id)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfPIfoList = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfPIfoList;

        pool.query(sql, [param.profileId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get traffic viewer data
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfViewer = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfViewer;

        pool.query(sql, [param.tbName, param.strDate, param.interval, param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get traffic profiles
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfProfiles = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfProfiles;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get traffic profile(profile id)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfProfile = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfProfile;

        pool.query(sql, [param.profileId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) check profile name(when update profile)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.checkTrfProfileNameUqWhenUpd = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.checkTrfProfileNameUqWhenUpd;
        pool.query(sql, [param.profileName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) update profile transaction(profile id)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.updateTrfProfile = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transUpdateTrfProfile;
                    const qArry = [p.updObj.profileName, p.updObj.profileCmmnt, p.updObj.profileFieldBpssum, p.updObj.profileFieldPeeripsrc, p.updObj.profileFieldDstas, p.updObj.profileFieldDstnetmask, p.updObj.profileId];

                    context.conn.query(sql, qArry, (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('update profile(transUpdateTrfProfile) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transDeleteTrfProfileDetailByProfileId;

                    context.conn.query(sql, [p.updObj.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows >= 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('update profile(transDeleteTrfProfileDetailByProfileId) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transInsertTrfProfileDetail;

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
                                context.error = new Error('update profile(transInsertTrfProfileDetail) error');
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

/**
 * @description (MODEL) check profile total count(when create profile/Max 10)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.checkTrfProfileTotalCnt = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.checkTrfProfileTotalCnt;
        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) create profile transaction
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.createTrfProfile = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transInsertTrfProfile;
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
                                context.error = new Error('create profile(transInsertTrfProfile) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transSelectTrfProfileByProfileId;

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
                    const sql = query.transInsertTrfProfileDetail;
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
                    // console.log(ifaceQArry);
                    context.conn.query(sql, [ifaceQArry], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === ifaceQArry.length) {
                                context.result = {profileId: profileId};
                                resolve(context);
                            } else {
                                context.error = new Error('create profile(transInsertTrfProfileDetail) error');
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

/**
 * @description (MODEL) check profile name(when create profile)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.checkTrfProfileNameUq = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.checkTrfProfileNameUq;
        pool.query(sql, [param.profileName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) delete profile transaction
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.deleteTrfProfile = (p) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transDeleteTrfProfileByProfileId;

                    context.conn.query(sql, [p.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 1) {
                                resolve(context);
                            } else {
                                context.error = new Error('delete profile(transDeleteTrfProfileByProfileId) error');
                                reject(context);
                            }
                        }
                    });
                });
            })
            .then((context) => {
                return new Promise((resolve, reject) => {
                    const sql = query.transDeleteTrfProfileDetailByProfileId;

                    context.conn.query(sql, [p.profileId], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows >= 1) {
                                context.result = {profileId: p.profileId};
                                resolve(context);
                            } else {
                                context.error = new Error('delete profile(transDeleteTrfProfileDetailByProfileId) error');
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

/**
 * @description (MODEL) get traffic dstAs(dstAsNum)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfDstAs = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfDstAs;

        pool.query(sql, [param.dstAsNum], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) insert/update traffic dstAs(dstAsNum)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.updateTrfDstAs = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.updateTrfDstAs;

        pool.query(sql, [param.dstAsNum, param.dstAsEngName, param.dstAsOrgName, param.dstAsCntryCode], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get ifaceout list(current date with rNum)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfCurrentIfo = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfCurrentIfo;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get ifaceout date(group by date_time)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfAvailableDateIfo = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfAvailableDateIfo;

        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) get ifaceout & peerIpSrc alias(strDate)
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.getTrfIfoAlias = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.getTrfIfoAlias;
        console.log(param.strDate);
        pool.query(sql, [param.strDate], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) update ifaceout & peerIpSrc alias
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.updateTrfIfoAlias = (param) => {
    return new Promise((resolve, reject) => {
        const sql = query.updateTrfIfoAlias;
        pool.query(sql, [param.ifaceOutAs, param.peerIpSrcAs, param.ifaceOut, param.peerIpSrc], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * @description (MODEL) update ifaceout & peerIpSrc alias
 * @param param {object}
 * @returns {Promise<T>}
 */
exports.updateTrfIfoAliasAll = (sql) => {
    return new Promise((resolve, reject) => {
        // const sql = query.updateTrfIfoAlias;
        pool.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};
