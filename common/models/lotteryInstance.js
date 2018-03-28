var modelStatusConfig = require('../../config/ModelStatus.json')

module.exports = function(lotteryInstance) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	lotteryInstance.validatesInclusionOf('status', {in: statusList})

}
