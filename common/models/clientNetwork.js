var countryListConfig = require('../../config/listOfCountries.json')
var provinceListConfig = require('../../config/listOfProvinces.json')
var verificationStatusConfig = require('../../config/VerificationStatus.json')

module.exports = function(clientNetwork) {

  var countryList = []
  for (var i = 0; i < countryListConfig.length; i++) {
		var model = countryListConfig[i]
		countryList.push(model.name)
	}

  var provinceList = []
  for (var i = 0; i < provinceListConfig.length; i++) {
		var model = provinceListConfig[i]
		provinceList.push(model.name)
	}

  var verificationStatusList = []
  for (var key in verificationStatusConfig) 
    verificationStatusList.push(verificationStatusConfig[key])

	clientNetwork.validatesInclusionOf('country', {in: countryList})
	clientNetwork.validatesInclusionOf('province', {in: provinceList})
	clientNetwork.validatesInclusionOf('status', {in: verificationStatusList})

}
