var operationStatusConfig = require('../../config/OperationStatus.json')
var transactionTypeConfig = require('../../config/TransactionType.json')

module.exports = function(clientReceipt) {

  var statusList = []
  for (var key in operationStatusConfig) 
    statusList.push(operationStatusConfig[key])

  var typeList = []
  for (var key in transactionTypeConfig) 
		typeList.push(transactionTypeConfig[key])

	clientReceipt.validatesInclusionOf('status', {in: statusList})
	clientReceipt.validatesInclusionOf('type', {in: typeList})

}
