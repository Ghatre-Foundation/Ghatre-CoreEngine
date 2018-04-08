var countryListConfig = require('../../config/ListOfCountries.json')
var provinceListConfig = require('../../config/ListOfProvinces.json')
var verificationStatusConfig = require('../../config/VerificationStatus.json')
var availabilityStatusConfig = require('../../config/AvailabilityStatus.json')

var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

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

	clientNetwork.makeModelSafe = function(ctx, clientId, cb) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
        return next(err)
      if (response.roles.length == 0) {
				if (ctx.req.accessToken.userId.toString() !== clientId.toString())
					return callback(new Error('Owner Error'))	
			}
			clientNetwork.find({where:{and:[{clientId: clientId.toString()}, {status: statusConfig.unsafe}]}, limit: 500000}, function (err, networkList) {
				if (err)
					return cb(err)
				if (networkList.length <= 0)
					return cb(null, 'not enough network model to compare')
				for (var i = 0; i < networkList.length; i++) {
					var model = networkList[i]
					model.updateAttribute(status, statusConfig.safe, function(err, updatedModel) {
						if (err)
							return cb(err)
						if (i == networkList.length) {
							var client = app.models.client
							client.findById(ctx.req.accessToken.userId.toString(), function(err, clientModel) {
								if (err)
									return cb(err)
								if (!clientModel)
									return cb(new Error('model not exists'))
								var newStatus = availabilityStatusConfig.unavailable
								if (Number(clientModel.stage) == 3)
									newStatus = availabilityStatusConfig.available
								clientModel.updateAttribute(status, newStatus, function(err, clientUpdatedModel) {
									if (err)
										return cb(err)
									return cb(null, networkList.length + ' models have became safed')
								})
							})
						}	
					})
				}
			})
		})		
	}

  clientNetwork.remoteMethod('makeModelSafe', {
    accepts: [{
			arg: 'ctx',
			type: 'object',
			http: {
				source: 'context'
			}
		}, {
      arg: 'clientId',
      type: 'string',
      http: {
        source: 'path'
      }
    }],
    description: 'make informations of all network models safe for a particular user',
    http: {
      path: '/information/:clientId/makeSafe',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
			root: true,
      type: 'object'
    }
  })

  clientNetwork.fetchInformations = function (clientId, cb) {
		clientNetwork.find({where:{clientId: clientId.toString()}, limit: 500000}, function (err, networkList) {
			if (err)
				return cb(err)
			if (networkList.length <= 1)
				return cb(null, 'not enough network model to compare')
			var data = {
				safe: 0,
				unsafe: 0,
				ipChange: 0,
				provinceChange: 0,
				countryChange: 0
			}
			for (var i = 0; i < networkList.length; i++) {
				var source = networkList[i]
				if (source.status === statusConfig.safe)
					data.safe++
				if (source.status === statusConfig.unsafe)
					data.unsafe++
				for (var j = i + 1; j < networkList.length; j++) {
					var destination = networkList[j]
					if (source.ipAddress !== destination.ipAddress)
						data.ipChange++
					if (source.country !== destination.country)
						data.countryChange++
					if (source.province !== destination.province)
						data.provinceChange++
				}
			}
			return cb(null, data)
		})
  }

  clientNetwork.remoteMethod('fetchInformations', {
    accepts: [{
      arg: 'publisherId',
      type: 'string',
      http: {
        source: 'path'
      }
    }],
    description: 'get informations of all network models related to a particular user',
    http: {
      path: '/information/:clientId',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
			root: true,
      type: 'object'
    }
  })

}
