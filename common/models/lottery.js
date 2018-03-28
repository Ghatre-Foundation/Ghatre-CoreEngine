var modelStatusConfig = require('../../config/ModelStatus.json')
var startTypeConfig = require('../../config/StartType.json')
var drawTypeConfig = require('../../config/DrawType.json')
var capacityTypeConfig = require('../../config/CapacityType.json')
var guaranteeTypeConfig = require('../../config/GuaranteeType.json')

module.exports = function(lottery) {

  var statusList = []
  for (var key in modelStatusConfig) 
		statusList.push(modelStatusConfig[key])

  var startTypeList = []
  for (var key in startTypeConfig) 
		startTypeList.push(startTypeConfig[key])

  var drawTypeList = []
  for (var key in drawTypeConfig) 
		drawTypeList.push(drawTypeConfig[key])

  var capacityTypeList = []
  for (var key in capacityTypeConfig) 
		capacityTypeList.push(capacityTypeConfig[key])

  var guaranteeTypeList = []
  for (var key in guaranteeTypeConfig) 
		guaranteeTypeList.push(guaranteeTypeConfig[key])

	lottery.validatesInclusionOf('status', {in: statusList})
	lottery.validatesInclusionOf('startType', {in: startTypeList})
	lottery.validatesInclusionOf('drawType', {in: drawTypeList})
	lottery.validatesInclusionOf('capacityType', {in: capacityTypeList})
	lottery.validatesInclusionOf('guaranteeType', {in: guaranteeTypeList})

}
