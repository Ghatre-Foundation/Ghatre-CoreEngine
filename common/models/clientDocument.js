var modelStatusConfig = require('../../config/ModelStatus.json')

module.exports = function(clientDocument) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	clientDocument.validatesInclusionOf('nationalCardStatus', {in: statusList})
	clientDocument.validatesInclusionOf('birthCertificateStatus', {in: statusList})

}