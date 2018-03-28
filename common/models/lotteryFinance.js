var operationStatusConfig = require('../../config/OperationStatus.json')
var transactionTypeConfig = require('../../config/TransactionType.json')

module.exports = function(lotteryFinance) {

  var statusList = []
  for (var key in operationStatusConfig) 
    statusList.push(operationStatusConfig[key])

  var typeList = []
  for (var key in transactionTypeConfig) 
		typeList.push(transactionTypeConfig[key])

	lotteryFinance.validatesInclusionOf('status', {in: statusList})
	lotteryFinance.validatesInclusionOf('type', {in: typeList})

}
