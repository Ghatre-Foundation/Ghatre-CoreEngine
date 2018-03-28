var modelStatusConfig = require('../../config/ModelStatus.json')
var visibilityTypeConfig = require('../../config/VisibilityType.json')

module.exports = function(agreement) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

  var visibilityTypeList = []
  for (var key in visibilityTypeConfig) 
		visibilityTypeList.push(visibilityTypeConfig[key])

	agreement.validatesInclusionOf('status', {in: statusList})
	agreement.validatesInclusionOf('type', {in: visibilityTypeList})

}
