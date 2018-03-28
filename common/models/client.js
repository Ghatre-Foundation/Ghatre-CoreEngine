var availabilityStatusConfig = require('../../config/AvailabilityStatus.json')
var genderConfig = require('../../config/ClientGender.json')

module.exports = function(client) {

  var availabilityList = []
  for (var key in availabilityStatusConfig) 
		availabilityList.push(availabilityStatusConfig[key])

  var genderList = []
  for (var key in genderConfig) 
		genderList.push(genderConfig[key])

	client.validatesInclusionOf('status', {in: availabilityList})
	client.validatesInclusionOf('gender', {in: genderList})

}
