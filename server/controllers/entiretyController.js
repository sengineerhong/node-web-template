const entiretyModel = require('../models/entiretyModel');

exports.getAcctTest1Chart = async (req, res, next) => {
    let data = '';
    try {
        data = await entiretyModel.getAcctTest1Chart();
    } catch (error) {
        return next(error);
    }
    return res.json(data);
};

exports.getAcctTest1Grid_reqOnce = async (req, res, next) => {
    let data = '';
    try {
        data = await entiretyModel.getAcctTest1Grid_reqOnce();
    } catch (error) {
        return next(error);
    }
    return res.json({data : data});
};

exports.getAcctTest1Grid = async (req, res, next) => {
    let iTotalRecords, data = '';
    try {
        var totalCntRow = await entiretyModel.getAcctTest1GridTotal(req);
        iTotalRecords = totalCntRow[0].iTotalRecords
        data = await entiretyModel.getAcctTest1Grid(req);
    } catch (error) {
        return next(error);
    }
    return res.json({sEcho: req.body.sEcho, iTotalRecords: iTotalRecords, iDisplayLength: iTotalRecords, data : data});
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
        result["progress"] = "31/31";
    } catch (error) {
        return next(error);
    }
    return res.json(result);
};

exports.getAllDailySalesYoy = async (req, res, next) => {
    let result = '';
    try {
        result = await entiretyModel.getAllDailySalesYoy();
        result["progress"] = "31/31";
    } catch (error) {
        return next(error);
    }
    return res.json(result);
};



