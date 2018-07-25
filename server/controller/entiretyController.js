const entiretyM = require('../model/entiretyModel');
const nconf = require('nconf');
const moment = require('moment');
const _ = require('lodash');
const utiles = require('../../common/utiles');
const whoisapi = require('../../common/whoisapi');

exports.checkTableExist = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            dbName: nconf.get('db_maria:database'),
            tbName: 'acct_' + moment(req.query.strDate).format('YYYY-MM-DD HH:mm:ss').substr(0, 10).replace(/-/g, '')
        };
        data = await entiretyM.checkTableExist(param);

        if (data[0].tbCnt === 1) {
            req.query.dbName  = param.dbName;
            req.query.tbName  = param.tbName;
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, '해당 날짜의 데이터가 존재하지 않습니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.getTrfHistory = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.query.strDate,
            dbName: req.query.dbName,
            tbName: req.query.tbName
        };
        data = await entiretyM.getTrfHistory(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfHistory succeed!', {data: data}));
};

exports.getTrfBpsUsage = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.query.strDate,
            range: parseInt(req.query.range) * 60,
            dbName: req.query.dbName,
            tbName: req.query.tbName
        };
        data = await entiretyM.getTrfBpsUsage(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfBpsUsage succeed!', {data: data}));
    // return res.json(data);
};

exports.getTrfIfoList = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.query.profileId
        };

        if (parseInt(param.profileId) === -1) {
            data = await entiretyM.getTrfIfoList(param);
        } else {
            data = await entiretyM.getTrfPIfoList(param);
        }
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getAcctPIfoList succeed!', {data: data}));
};

exports.getTrfViewer = async (req, res, next) => {
    let gridArry = '';
    try {
        const param = {
            strDate: req.query.strDate,
            strDateYMD: moment(req.query.strDate).format('YYYY-MM-DD HH:mm:ss').substr(0, 10),
            // strDate: '2018-04-06 13:35:00',
            // strDateYMD: '2018-04-02',
            dbName: req.query.dbName,
            tbName: req.query.tbName,
            interval: req.query.interval,
            profileId: req.query.profileId
        };
        // get iface out list
        let ifoListRows;
        // separate use profile or not
        if (parseInt(param.profileId) === -1) {
            ifoListRows = await entiretyM.getTrfIfoList(param);
        } else {
            ifoListRows = await entiretyM.getTrfPIfoList(param);
        }
        // console.log('ifoListRows:' + JSON.stringify(ifoListRows));
        // rows to json
        let ifoListArry = utiles.getMysqlRowToJson(ifoListRows);
        // get grid data
        let data = await entiretyM.getTrfViewer(param);
        // rows to json
        gridArry = utiles.getMysqlRowToJson(data);
        // console.log('gridArry:' + JSON.stringify(gridArry));
        // console.log('ifoListArry:' + JSON.stringify(ifoListArry));

        // trans pivot
        _.forEach(gridArry, function (obj) {
            obj.bpsSum = 0;
            obj.peerIpSrcAndAs = '';
            // console.log(ifoListArry);
            _.forEach(ifoListArry, function (ifo) {
                // check displayYn
                // if (ifo.displayYn === 'Y') {
                // obj[ifo.ifaceOutAs] = '';
                obj[ifo.ifaceOutPeerIp] = '';
                // }
            });
            // var ifaceOutAs = obj.ifaceOutAs;
            var ifaceOutPeerIp = obj.ifaceOutPeerIp;
            var byteSum = obj.byteSum;

            // var cnt = obj.cnt;
            // console.log('obj:' + JSON.stringify(obj));
            _.forEach(obj, function (v, k) {
                // console.log('v:' + v + '|k:' + k);
                // if (k === ifaceOutAs) {
                if (k === ifaceOutPeerIp) {
                    // Gbps
                    // obj[k] = Number((byteSum / cnt / 125000000).toFixed(2));
                    obj[k] = Number((byteSum / 60 / 125000000).toFixed(3));
                    obj.bpsSum = Number(obj[k]);
                }
                obj.peerIpSrcAndAs = obj.peerIpSrcAs + '[' + obj.peerIpSrc  + ']';
            });
        });
        // TODO : 임시 로직 정합성 확인필요
        for (var i = gridArry.length - 1; i >= 0; --i) {
            // for update dstAs from client-side
            if (gridArry[i].dstAs === null) {
                gridArry[i].dstAs = 'reqwhois_' + gridArry[i].dstAsNum;
                // console.log('gridArry[i]:' + JSON.stringify(gridArry[i]));
            }
            // remove bpsSum == 0
            if (gridArry[i].bpsSum === 0) {
                gridArry.splice(i, 1); // Remove even numbers
            }
        }
        // console.log(gridArry);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfViewer succeed!', {data: gridArry}));
};

// get profiles
exports.getTrfProfiles = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyM.getTrfProfiles(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfProfiles succeed!', {data: data}));
};

// get profile detail
exports.getTrfProfile = async (req, res, next) => {
    const data = {};
    try {
        const param = {
            profileId: req.params.profileId
        };
        let pDetailRows = await entiretyM.getTrfProfile(param);
        // rows to json
        let pDetailArry = utiles.getMysqlRowToJson(pDetailRows);
        let ifaceArry = [];
        let rNum = 1;
        _.forEach(pDetailArry, function (detail, idx) {
            const ifaceObj = {};
            _.forEach(detail, function (v, k) {
                var isProfileObj = k.startsWith('profile');
                if (!isProfileObj) {
                    ifaceObj[k] = v;
                    ifaceObj.rNum = rNum;
                } else {
                    if (idx === 0) {
                        data[k] = v;
                    }
                }
            });
            rNum++;
            ifaceArry.push(ifaceObj);
        });
        data.ifaceArry = ifaceArry;
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfProfile succeed!', {data: data}));
    // return res.json(data);
};

exports.checkTrfProfileNameUqWhenUpd = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.params.profileId,
            profileName: req.body.updObj.profileName
        };
        data = await entiretyM.checkTrfProfileNameUqWhenUpd(param);

        if (data.length > 1) {
            return res.json(utiles.genResObjFormat(-1, '동일한 profile 이름을 사용할 수 없습니다.', {}));
        } else if (data.length === 1) {
            if (data[0].profileId === parseInt(param.profileId)) {
                next();
            } else {
                return res.json(utiles.genResObjFormat(-1, '동일한 profile 이름을 사용할 수 없습니다.', {}));
            }
        } else {
            next();
        }
    } catch (error) {
        return next(error);
    }
};

exports.updateTrfProfile = async (req, res, next) => {
    let data = '';
    try {
        // console.log(req.body.updObj);
        var profileId = req.body.updObj.profileId;
        let ifaceQArry = [];
        _.forEach(req.body.updObj.ifaceArry, function (item, idx) {
            let tempArry = [];
            tempArry.push(profileId);
            tempArry.push(item.ifaceOut);
            tempArry.push(item.peerIpSrc);
            tempArry.push(item.fieldIfaceOut);
            ifaceQArry.push(tempArry);
        });
        const param = {
            updObj: req.body.updObj,
            ifaceQArry: ifaceQArry
        };
        data = await entiretyM.updateTrfProfile(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'profile update succeed!', data));
};

exports.checkTrfProfileMaxCnt = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyM.checkTrfProfileTotalCnt(param);
        if (data[0].profileTotalCnt < 10) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, 'profile 은 total 10개를 넘을 수 없습니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.checkTrfProfileNameUq = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileName: req.body.profileObj.profileName
        };
        data = await entiretyM.checkTrfProfileNameUq(param);

        if (data[0].profileCnt === 0) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, '동일한 profile 이름을 사용할 수 없습니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.createTrfProfile = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            pObj: req.body.profileObj
        };
        data = await entiretyM.createTrfProfile(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'createTrfProfile succeed!', data));
};

exports.checkTrfProfileMinCnt = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyM.checkTrfProfileTotalCnt(param);

        if (data[0].profileTotalCnt > 2) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, 'profile 은 한개 이상 존재해야합니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.deleteTrfProfile = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.params.profileId
        };
        data = await entiretyM.deleteTrfProfile(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'deleteTrfProfile succeed!', data));
    // return res.json(data);
};

exports.getTrfDstAs = async (req, res, next) => {
    try {
        const param = {
            dstAsNum: req.params.dstAsNum
        };
        // rObj.dstAsEngName = '';
        // rObj.dstAsOrgName = '';
        // rObj.dstAsCntryCode = '';
        // rObj.rCode = -1;
        // 1. make sure db has already got dstAsNum (select count(as_dst) from acct_dstas_info where as_dst=?)
        const preDstAsRows = await entiretyM.getTrfDstAs(param);
        const preDstAsArry = utiles.getMysqlRowToJson(preDstAsRows);
        let rObj = {};
        // console.log('preDstAsArry:' + preDstAsArry);
        // 2. if not exist => request whoisapi
        if (!preDstAsArry.length) {
            // if (preDstAsArry.length !== 0) {
            rObj = await whoisapi(param);
            // 3. update(insert) acct_dstas_info
            if (rObj.rCode === 1) {
                await entiretyM.updateTrfDstAs(rObj);
                // console.log('rObj_1:' + JSON.stringify(rObj));
                // 4. return acct_dstas_info result (rCode 1 / succ)
                return res.json(utiles.genResObjFormat(1, 'getTrfDstAs succeed!', rObj));
                // return res.json(rObj);
            } else {
                // 4. return acct_dstas_info result (rCode -1 / fail)
                rObj.rCode = -1;
                return res.json(utiles.genResObjFormat(-1, 'getTrfDstAs failure!', rObj));
                // return res.json(rObj);
            }
        } else {
            // 4. return acct_dstas_info result (rCode 1 / succ)
            rObj = preDstAsArry[0];
            rObj.rCode = 1;
            return res.json(utiles.genResObjFormat(1, 'getTrfDstAs succeed!', rObj));
            // return res.json(preDstAsArry);
        }
    } catch (error) {
        return next(error);
    }
};

exports.getTrfCurrentIfo = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyM.getTrfCurrentIfo(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfCurrentIfo succeed!', {data: data}));
};

exports.getTrfAvailableDateIfo = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyM.getTrfAvailableDateIfo(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfAvailableDateIfo succeed!', {data: data}));
};

exports.getTrfIfoAlias = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: moment(req.query.strDate).format('YYYY-MM-DD').toString()
        };
        data = await entiretyM.getTrfIfoAlias(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getTrfIfoAlias succeed!', {data: data}));
};

exports.updateTrfIfoAlias = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            ifaceOut: req.params.ifaceOut,
            ifaceOutAs: req.body.ifaceOutAs,
            // displayYn: req.body.displayYn,
            peerIpSrc: req.body.peerIpSrc,
            peerIpSrcAs: req.body.peerIpSrcAs
        };
        data = await entiretyM.updateTrfIfoAlias(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};
