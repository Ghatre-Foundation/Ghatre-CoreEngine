var modelStatusConfig = require('../../config/ModelStatus.json')

module.exports = function(depositInstance) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	depositInstance.validatesInclusionOf('status', {in: statusList})

}
