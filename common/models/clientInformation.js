var countryListConfig = require('../../config/ListOfCountries.json')
var provinceListConfig = require('../../config/ListOfProvinces.json')
var cityListConfig = require('../../config/ListOfCities.json')

var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

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

	clientInformation.beforeRemote('create', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
				return next(err)
			if (response.roles.indexOf('admin') >= 0)
				return next(new Error('Only founder is allowed'))
      if (response.roles.length == 0) {
				var requiredList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode']
				if (!utility.requiredChecker(ctx.args.data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'latitude', 'longitude']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))		
				ctx.args.data.clientId = ctx.args.options.accessToken.userId.toString()
			}
			else {
				var requiredList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'clientId']
				if (!utility.requiredChecker(ctx.args.data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'clientId', 'latitude', 'longitude']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))		
			}
			client.findById(ctx.args.data.clientId.toString(), function(err, clientModel) {
				if (err)
					return next(err)
				if (!clientModel)
					return next(new Error('Model not exists'))
				return next()
			})	
		})
	})

	clientInformation.afterRemote('create', function (ctx, modelInstance, next) {
		client.findById(modelInstance.clientId.toString(), function(err, clientModel) {
			if (err)
				return next(err)
			if (!clientModel)
				return next(new Error('Model not exists'))
			clientModel.updateAttribute('stage', Number(clientModel.stage) + 1, function(err, clientUpdatedModel) {
				if (err)
					return next(err)
				modelInstance.clientRel(clientModel)
				return next()
			})
		})
	})

	clientInformation.beforeRemote('updateById', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
				return next(err)
			if (response.roles.indexOf('admin') >= 0)
				return next(new Error('Only founder is allowed'))
      if (response.roles.length != 0) {
				var whiteList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'latitude', 'longitude']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))
				return next()
			}
			else
				return next(new Error('Not Allowed'))
		})
	})

}
