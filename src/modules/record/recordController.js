// record.controller.js
const recordService = require("./recordService");

exports.createRecord = async (req, res, next) => {
  try {
    const result = await recordService.createRecord(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const result = await recordService.updateRecord(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const result = await recordService.deleteRecord(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
