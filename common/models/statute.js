var modelStatusConfig = require('../../config/ModelStatus.json')
var visibilityTypeConfig = require('../../config/VisibilityType.json')

module.exports = function(statute) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

  var visibilityTypeList = []
  for (var key in visibilityTypeConfig) 
		visibilityTypeList.push(visibilityTypeConfig[key])

	statute.validatesInclusionOf('status', {in: statusList})
	statute.validatesInclusionOf('type', {in: visibilityTypeList})

}
