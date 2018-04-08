var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

module.exports = function(clientFinance) {

	clientFinance.additiveChainFunction = function (clientId, addition, cb) {
		var client = app.models.client
		client.findById(clientId.toString(), function(err, clientModel) {
			if (err)
				return cb(err)
			if (!clientModel)
				return cb(new Error('Model not exists'))
			clientModel.clientFinance(function(err, clientFinanceModel) {
				if (err)
					return cb(err)
				if (!clientFinanceModel)
					return cb(new Error('Model not exists'))					
				var newData = {
					balance: Number(clientFinanceModel.balance) + Number(addition),
					inputs: Number(clientFinanceModel.inputs) + Number(addition)
				}
				clientFinanceModel.updateAttributes(newData, function(err, clientFinanceUpdatedModel) {
					if (err)
						return cb(err)
					return cb(null, clientFinanceUpdatedModel)
				})
			})
		})
	}
	
  clientFinance.additiveChain = function (data, req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.length != 0) {
				var requiredList = ['clientId', 'addition']
				if (!utility.requiredChecker(data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['clientId', 'addition']
				if (!utility.whiteChecker(data, whiteList))
					return next(new Error('White Parameters'))
				clientFinance.additiveChainFunction(data.clientId.toString(), data.addition, function(err, additionResult) {
					if (err)
						return cb(err)
					return cb(null, additionResult)
				})
			}
			else
				return cb(new Error('Not Allowed, Only Admins and Founders'))
		})
  }

  clientFinance.remoteMethod('additiveChain', {
    accepts: [{
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      }
    }, {
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }],
    description: 'additive chain to add in balance and inputs',
    http: {
      path: '/additiveChain',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      root: true,
      type: 'object'
    }
	})
	
	clientFinance.reduceChainFunction = function (clientId, reduction, cb) {
		var client = app.models.client
		client.findById(clientId.toString(), function(err, clientModel) {
			if (err)
				return cb(err)
			if (!clientModel)
				return cb(new Error('model not exists'))
			clientModel.clientFinance(function(err, clientFinanceModel) {
				if (err)
					return cb(err)
				if (!clientFinanceModel)
					return cb(new Error('model not exists'))
				var newData = {
					balance: Number(clientFinanceModel.balance) - Number(reduction),
					inputs: Number(clientFinanceModel.outputs) + Number(reduction)
				}
				clientFinanceModel.updateAttributes(newData, function(err, clientFinanceUpdatedModel) {
					if (err)
						return cb(err)
					return cb(null, clientFinanceUpdatedModel)
				})
			})
		})		
	}

  clientFinance.reduceChain = function (data, req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.length != 0) {
				var requiredList = ['clientId', 'reduction']
				if (!utility.requiredChecker(data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['clientId', 'reduction']
				if (!utility.whiteChecker(data, whiteList))
					return next(new Error('White Parameters'))
				clientFinance.reduceChainFunction(data.clientId.toString(), data.reduction, function(err, reductionResult) {
					if (err)
						return cb(err)
					return cb(null, reductionResult)
				})	
			}
			else
				return cb(new Error('Not Allowed, Only Admins and Founders'))
		})
  }

  clientFinance.remoteMethod('reduceChain', {
    accepts: [{
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      }
    }, {
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }],
    description: 'reduce chain to sub from balance and inputs',
    http: {
      path: '/reduceChain',
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
