var operationStatusConfig = require('../../config/OperationStatus.json')
var transactionTypeConfig = require('../../config/TransactionType.json')

module.exports = function(depositFinance) {

  var statusList = []
  for (var key in operationStatusConfig) 
    statusList.push(operationStatusConfig[key])

  var typeList = []
  for (var key in transactionTypeConfig) 
		typeList.push(transactionTypeConfig[key])

	depositFinance.validatesInclusionOf('status', {in: statusList})
	depositFinance.validatesInclusionOf('type', {in: typeList})

}
