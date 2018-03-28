var modelStatusConfig = require('../../config/ModelStatus.json')

module.exports = function(lotteryPresence) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	lotteryPresence.validatesInclusionOf('status', {in: statusList})

}
