var modelStatusConfig = require('../../config/ModelStatus.json')
var startTypeConfig = require('../../config/StartType.json')
var depositTypeConfig = require('../../config/DepositType.json')
var capacityTypeConfig = require('../../config/CapacityType.json')
var guaranteeTypeConfig = require('../../config/GuaranteeType.json')

module.exports = function(deposit) {

  var statusList = []
  for (var key in modelStatusConfig) 
		statusList.push(modelStatusConfig[key])

  var startTypeList = []
  for (var key in startTypeConfig) 
		startTypeList.push(startTypeConfig[key])

  var depositTypeList = []
  for (var key in depositTypeConfig) 
		depositTypeList.push(depositTypeConfig[key])

  var capacityTypeList = []
  for (var key in capacityTypeConfig) 
		capacityTypeList.push(capacityTypeConfig[key])

  var guaranteeTypeList = []
  for (var key in guaranteeTypeConfig) 
		guaranteeTypeList.push(guaranteeTypeConfig[key])

	deposit.validatesInclusionOf('status', {in: statusList})
	deposit.validatesInclusionOf('startType', {in: startTypeList})
	deposit.validatesInclusionOf('depositType', {in: depositTypeList})
	deposit.validatesInclusionOf('capacityType', {in: capacityTypeList})
	deposit.validatesInclusionOf('guaranteeType', {in: guaranteeTypeList})
	
}
