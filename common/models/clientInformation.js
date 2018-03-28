var countryListConfig = require('../../config/listOfCountries.json')
var provinceListConfig = require('../../config/listOfProvinces.json')
var cityListConfig = require('../../config/listOfCities.json')

module.exports = function(clientInformation) {

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

  var cityList = []
  for (var i = 0; i < cityListConfig.length; i++) {
		var model = cityListConfig[i]
		cityList.push(model.name)
	}

	clientInformation.validatesInclusionOf('country', {in: countryList})
	clientInformation.validatesInclusionOf('province', {in: provinceList})
	clientInformation.validatesInclusionOf('city', {in: cityList})

}
