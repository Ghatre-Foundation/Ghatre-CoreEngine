var bankListConfig = require('../../config/ListOfBanks.json')

var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

module.exports = function(clientCreditCard) {

  var bankList = []
  for (var i = 0; i < bankListConfig.length; i++) {
		var model = bankListConfig[i]
		bankList.push(model.title)
	}

	clientCreditCard.validatesInclusionOf('bank', {in: bankList})

	clientCreditCard.beforeRemote('create', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
				return next(err)
			if (response.roles.indexOf('admin') >= 0)
				return next(new Error('Only founder is allowed'))
      if (response.roles.length == 0) {
				var requiredList = ['cardNumber', 'owner', 'bank']
				if (!utility.requiredChecker(ctx.args.data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['cardNumber', 'owner', 'bank']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))
				ctx.args.data.clientId = ctx.args.options.accessToken.userId.toString()
			}
			else {
				var requiredList = ['cardNumber', 'owner', 'bank', 'clientId']
				if (!utility.requiredChecker(ctx.args.data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['cardNumber', 'owner', 'bank', 'clientId']
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

	clientCreditCard.afterRemote('create', function (ctx, modelInstance, next) {
		var client = app.models.client
		client.findById(modelInstance.clientId.toString(), function(err, clientModel) {
			if (err)
				return next(err)
			if (!clientModel)
				return next(new Error('Model not exists'))
			modelInstance.clientRel(clientModel)
			return next()
		})
	})

	clientCreditCard.beforeRemote('updateById', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
				return next(err)
			if (response.roles.indexOf('admin') >= 0)
				return next(new Error('Only founder is allowed'))
      if (response.roles.length == 0) {
				var whiteList = ['cardNumber', 'owner', 'bank']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))
				ctx.args.data.clientId = ctx.args.options.accessToken.userId.toString()
			}
			else {
				var whiteList = ['cardNumber', 'owner', 'bank']
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('White Parameters'))		
			}
			return next()
		})
	})
	
}
