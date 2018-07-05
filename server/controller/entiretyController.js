const entiretyModel = require('../model/entiretyModel');
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
    let colDataCnt = [{idx: 0, name: 'empty', cnt: 0}];
    let colCnt = 1;
    try {
        const param = {
            strDate: req.body.strDate,
            strDateYMD: moment(req.body.strDate).format('YYYY-MM-DD HH:mm:ss').substr(0, 10),
            // strDate: '2018-04-06 13:35:00',
            // strDateYMD: '2018-04-02',
            dbName: req.body.dbName,
            tbName: req.body.tbName,
            interval: req.body.interval,
            profileId: req.body.profileId
        };
        // get iface out list
        let ifoListRows;
        // separate use profile or not
        if (parseInt(param.profileId) === -1) {
            ifoListRows = await entiretyModel.getAcctIfoListGrid(param);
        } else {
            ifoListRows = await entiretyModel.getAcctPIfoList(param);
        }
        // console.log('ifoListRows:' + JSON.stringify(ifoListRows));
        // rows to json
        let ifoListArry = utiles.getMysqlRowToJson(ifoListRows);
        // get grid data
        let data = await entiretyModel.getAcctTest2Grid_reqOnce(param);
        // rows to json
        gridArry = utiles.getMysqlRowToJson(data);
        // console.log('gridArry:' + JSON.stringify(gridArry));
        // console.log('ifoListArry:' + JSON.stringify(ifoListArry));

        // calculate column data count for keep the index(pieColor) the same
        // _.forEach(ifoListArry, function (ifo) {
        //     // check displayYn
        //     if (ifo.displayYn === 'Y') {
        //         colDataCnt.push({idx: colCnt, name: ifo.ifaceOutPeerIp, cnt: 0});
        //         colCnt++;
        //     }
        // });
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
                // if (k === ifaceOutAs) {
                if (v === ifaceOutPeerIp) {
                    // Gbps
                    // obj[k] = Number((byteSum / cnt / 125000000).toFixed(2));
                    obj[v] = Number((byteSum / 60 / 125000000).toFixed(3));
                    obj.bpsSum = Number(obj[v]);

                    // calculate column data count for keep the index(pieColor) the same
                    // for (var y = 0; y < colDataCnt.length; y++) {
                    //     if (colDataCnt[y].name === ifaceOutPeerIp) {
                    //         colDataCnt[y].cnt++;
                    //         break;
                    //     }
                    // }
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
    // return res.json(utiles.genResObjFormat(1, 'getAcctTest2Grid_reqOnce succeed!', {data: gridArry}));
    return res.json({data: gridArry});
};

exports.getAcctTest2Chart = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDate: req.body.strDate,
            dbName: req.body.dbName,
            tbName: req.body.tbName,
            interval: req.body.interval
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
            tbName: req.body.tbName,
            interval: req.body.interval
        };
        data = await entiretyModel.getAcctTest2Pie(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctTest2DstAs = async (req, res, next) => {
    try {
        const param = {
            dstAsNum: req.body.dstAsNum
        };
        // rObj.dstAsNum
        // rObj.dstAsEngName = '';
        // rObj.dstAsOrgName = '';
        // rObj.dstAsCntryCode = '';
        // rObj.rCode = -1;
        // 1. make sure db has already got dstAsNum (select count(as_dst) from acct_dstas_info where as_dst=?)
        const preDstAsRows = await entiretyModel.getAcctTest2DstAs(param);
        const preDstAsArry = utiles.getMysqlRowToJson(preDstAsRows);
        // console.log('preDstAsArry:' + preDstAsArry);
        // 2. if not exist => request whoisapi
        if (preDstAsArry.length === 0) {
        // if (preDstAsArry.length !== 0) {
            const rObj = await whoisapi(param);
            // 3. update(insert) acct_dstas_info
            if (rObj.rCode === 1) {
                await entiretyModel.setAcctTest2DstAs(rObj);
                // console.log('rObj_1:' + JSON.stringify(rObj));
                // 4. return acct_dstas_info result (rCode 1 / succ)
                return res.json(rObj);
            } else {
                // 4. return acct_dstas_info result (rCode -1 / fail)
                rObj.rCode = -1;
                return res.json(rObj);
            }
        } else {
            // 4. return acct_dstas_info result (rCode 1 / succ)
            preDstAsArry.rCode = 1;
            return res.json(preDstAsArry);
        }
    } catch (error) {
        return next(error);
    }
};

exports.getAcctTest2Profile = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyModel.getAcctTest2Profile(param);
    } catch (error) {
        return next(error);
    }
    return res.json({data: data});
};

exports.getAcctPIfoList = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.body.profileId
        };

        if (parseInt(param.profileId) === -1) {
            data = await entiretyModel.getAcctIfoListGrid(param);
        } else {
            data = await entiretyModel.getAcctPIfoList(param);
        }
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'getAcctPIfoList succeed!', {data: data}));
};

exports.getAcctIfoListGrid = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            strDateYMD: moment(req.body.strDateYMD).format('YYYY-MM-DD HH:mm:ss').substr(0, 10),
            // strDateYMD: '2018-04-02'
            displayYn: req.body.displayYn
        };
        // console.log(param);
        // TODO : displayYn flag에 따른 query 분기
        if (param.displayYn) {
            data = await entiretyModel.getAcctIfoListGridDispFlag(param);
        } else {
            data = await entiretyModel.getAcctIfoListGrid(param);
        }
    } catch (error) {
        return next(error);
    }
    return res.json({data: data});
};

exports.getAcctIfoListGridUpdate = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            ifaceOut: req.body.ifaceOut,
            ifaceOutAs: req.body.ifaceOutAs,
            // displayYn: req.body.displayYn,
            peerIpSrc: req.body.peerIpSrc,
            peerIpSrcAs: req.body.peerIpSrcAs
        };
        data = await entiretyModel.getAcctIfoListGridUpdate(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctProfileGrid = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyModel.getAcctProfileGrid(param);
    } catch (error) {
        return next(error);
    }
    return res.json({data: data});
};

exports.getAcctProfileDetail = async (req, res, next) => {
    const data = {};
    try {
        const param = {
            profileId: req.body.profileId
        };
        let pDetailRows = await entiretyModel.getAcctProfileDetail(param);
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
    return res.json(data);
};

exports.getAcctProfileIfaceout = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyModel.getAcctProfileIfaceout(param);
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctProfileUpdate = async (req, res, next) => {
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
        data = await entiretyModel.getAcctProfileUpdate(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'profile update succeed!', data));
};

exports.getAcctProfileCreate = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            pObj: req.body.profileObj
        };
        data = await entiretyModel.getAcctProfileCreate(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'profile create succeed!', data));
};

exports.checkProfileNameWhenUpd = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.body.updObj.profileId,
            profileName: req.body.updObj.profileName
        };
        data = await entiretyModel.checkProfileNameWhenUpd(param);

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

exports.checkProfileName = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileName: req.body.profileObj.profileName
        };
        data = await entiretyModel.checkProfileName(param);

        if (data[0].profileCnt === 0) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, '동일한 profile 이름을 사용할 수 없습니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.checkProfileTotalCnt = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyModel.checkProfileTotalCnt(param);
        if (data[0].profileTotalCnt < 10) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, 'profile 은 total 10개를 넘을 수 없습니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.checkProfileCnt = async (req, res, next) => {
    let data = '';
    try {
        const param = {};
        data = await entiretyModel.checkProfileCnt(param);

        if (data[0].profileCnt > 2) {
            next();
        } else {
            return res.json(utiles.genResObjFormat(-1, 'profile 은 한개 이상 존재해야합니다.', {}));
        }
    } catch (error) {
        return next(error);
    }
};

exports.getAcctProfileDelete = async (req, res, next) => {
    let data = '';
    try {
        const param = {
            profileId: req.body.profileId
        };
        data = await entiretyModel.getAcctProfileDelete(param);
    } catch (error) {
        return next(error);
    }
    return res.json(utiles.genResObjFormat(1, 'profile delete succeed!', data));
    // return res.json(data);
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
