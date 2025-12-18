const soilService = require('../services/soilService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class SoilController {
  getSoil(req, res) {
    try {
      const result = soilService.getSoil();
      successResponse(res, result, 'Soil retrieved');
    } catch (err) {
      errorResponse(res, err.message);
    }
  }

  setSoil(req, res) {
    try {
      const { hp } = req.body;
      const result = soilService.setSoil(hp);
      successResponse(res, result, 'Soil updated');
    } catch (err) {
      errorResponse(res, err.message);
    }
  }

  checkAcidity(req, res) {
    try {
      const { acidity } = req.query;
      const result = soilService.checkAcidity(acidity);
      successResponse(res, result, result.match ? 'Crop matches soil' : 'Crop does not match soil');
    } catch (err) {
      errorResponse(res, err.message);
    }
  }
}

module.exports = new SoilController();
