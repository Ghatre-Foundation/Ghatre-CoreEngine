var modelStatusConfig = require('../../config/ModelStatus.json')

module.exports = function(depositPresence) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	depositPresence.validatesInclusionOf('status', {in: statusList})

}
