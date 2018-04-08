var availabilityStatusConfig = require('../../config/AvailabilityStatus.json')
var genderConfig = require('../../config/ClientGender.json')
var modelStatusConfig = require('../../config/ModelStatus.json')
var verificationStatusConfig = require('../../config/VerificationStatus.json')
var operationStatusConfig = require('../../config/OperationStatus.json')
var transactionTypeConfig = require('../../config/TransactionType.json')

var app = require('../../server/server')
var utility = require('../../public/utility')

var fs = require('fs')
var path = require('path')

module.exports = function(client) {

  var availabilityList = []
  for (var key in availabilityStatusConfig) 
		availabilityList.push(availabilityStatusConfig[key])

  var genderList = []
  for (var key in genderConfig) 
		genderList.push(genderConfig[key])

	client.validatesInclusionOf('status', {in: availabilityList})
	client.validatesInclusionOf('gender', {in: genderList})

	client.beforeRemote('create', function (ctx, modelInstance, next) {
		var requiredList = ['password', 'email', 'username', 'firstName', 'lastName', 'gender', 'nationalCode', 'identityCode']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['password', 'email', 'username', 'firstName', 'lastName', 'gender', 'nationalCode', 'identityCode', 'referrer']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		ctx.args.data.status = availabilityStatusConfig.unavailable
		ctx.args.data.stage = 1
		if (!ctx.args.data.referrer)
			return next()
		client.findById(ctx.args.data.referrer.toString(), function(err, referrerModel) {
			if (err)
				return next(err)
			if (!referrerModel)
				return next(new Error('Referrer Model Not Found'))
			return next()
		})
	})

	client.afterRemote('create', function (ctx, modelInstance, next) {
		var clientDocumentData = {
			nationalCardFileURL: '',
			nationalCardFilePath: '',
			nationalCardStatus: modelStatusConfig.created,
			nationalCardAdminMessage: 'Add your national card',
			birthCertificateFileURL: '',
			birthCertificateFilePath: '',
			birthCertificateStatus: modelStatusConfig.created,
			birthCertificateAdminMessage: 'Add your birth certificate',
			clientId: modelInstance.id.toString()
		}
		modelInstance.clientDocument.create(clientDocumentData, function(err, clientDocumentModel) {
			if (err)
				return next(err)
			var clientFinanceData = {
				balance: 0,
				inputs: 0,
				outputs: 0,
				clientId: modelInstance.id.toString()
			}
			modelInstance.clientFinance.create(clientFinanceData, function(err, clinetFinanceModel) {
				if (err)
					return next(err)
				if (!modelInstance.referrer)
					return next()
				var clientReferralData = {
					userId: modelInstance.id.toString(),
					clientJoinDate: Number(utility.getUnixTimeStamp()),
					clientId: ctx.args.data.referrer.toString()
				}
				client.findById(ctx.args.data.referrer.toString(), function(err, referrerModel) {
					if (err)
						return next(err)
					referrerModel.referralsRel.create(clientReferralData, function(err, clientReferralModel) {
						if (err)
							return next(err)
						return next()
					})
				})				
			})			
		})
	})

	client.beforeRemote('prototype.__create_creditCardsRel', function (ctx, modelInstance, next) {
		var requiredList = ['cardNumber', 'owner', 'bank', 'clientId']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['cardNumber', 'owner', 'bank', 'clientId']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		return next()
	})

	client.beforeRemote('prototype.__updateById_creditCardsRel', function (ctx, modelInstance, next) {
		var whiteList = ['cardNumber', 'owner', 'bank']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		return next()
	})

	client.beforeRemote('prototype.__updateById_documentRel', function (ctx, modelInstance, next) {
		var requiredList = ['clientId']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['clientId']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		var nationalCardDirectory = path.resolve(__dirname + '/../fileStorage/nationalCard/')
		var nationalCardFilePath = directory + '/' + ctx.args.data.clientId.toString() + '.jpg'
		var nationalCardFileURL = CONTAINERS_URL + 'nationalCard' + '/download/' + ctx.args.data.clientId.toString() + '.jpg'
		var birthCertificateDirectory = path.resolve(__dirname + '/../fileStorage/birthCertificate/')
		var birthCertificateFilePath = directory + '/' + ctx.args.data.clientId.toString() + '.jpg'
		var birthCertificateFileURL = CONTAINERS_URL + 'birthCertificate' + '/download/' + ctx.args.data.clientId.toString() + '.jpg'
		fs.open(nationalCardFilePath, 'r', (err, fd) => {
			if (err) {
				if (err.code === 'ENOENT') 
					return next(new Error('National card file does not exist'))
				return next(err)
			}
			fs.open(birthCertificateFilePath, 'r', (err, fd) => {
				if (err) {
					if (err.code === 'ENOENT') 
						return next(new Error('Birth certificate file does not exist'))
					return next(err)
				}
				ctx.args.data.nationalCardFileURL = nationalCardFileURL
				ctx.args.data.nationalCardFilePath = nationalCardFilePath
				ctx.args.data.birthCertificateFileURL = birthCertificateFileURL
				ctx.args.data.birthCertificateFilePath = birthCertificateFilePath
				ctx.args.data.nationalCardStatus = modelStatusConfig.pending
				ctx.args.data.nationalCardAdminMessage = 'Pending Approval'
				ctx.args.data.birthCertificateStatus = modelStatusConfig.pending
				ctx.args.data.birthCertificateAdminMessage = 'Pending Approval'
				return next()		
			})
		})
	})

	client.beforeRemote('prototype.__create_informationRel', function (ctx, modelInstance, next) {
		var requiredList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'clientId']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['cellPhoneNumber', 'homePhoneNumber', 'country', 'province', 'city', 'address', 'postalCode', 'clientId', 'latitude', 'longitude']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		return next()
	})

	client.afterRemote('prototype.__create_informationRel', function (ctx, modelInstance, next) {
		client.findById(modelInstance.clientId.toString(), function(err, clientModel) {
			if (err)
				return next(err)
			if (!clientModel)
				return next(new Error('Model not exists'))
			clientModel.updateAttribute('stage', Number(clientModel.stage) + 1, function(err, clientUpdatedModel) {
				if (err)
					return next(err)
				return next()
			})
		})
	})

	client.beforeRemote('prototype.__create_networksRel', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
        return next(err)
      if (respone.roles.length <= 0) {
				var requireList = ['ipAddress', 'province', 'country', 'date', 'clientId']
				if (!utility.requiredChecker(ctx.args.data, requireList))
					return next(new Error('Strict Parameters! White list error!'))
				var whiteList = ['ipAddress', 'province', 'country', 'date', 'clientId']	
				if (!utility.whiteChecker(ctx.args.data, whiteList))
					return next(new Error('Strict Parameters! Required list error!'))
				var clientNetwork = app.models.clientNetwork
				clientNetwork.find({where:{clientId: ctx.args.data.clientId.toString()}, limit: 500000}, function (err, networkList) {
					if (err)
						return next(err)
					if (networkList.length <= 0)
						return next(null, 'not enough network model to compare')
					var safeIPs = []
					var safeProvinces = []
					var safeCountries = []
					for (var i = 0; i < networkList.length; i++) {
						var source = networkList[i]
						if (source.status === verificationStatusConfig.verified) {
							safeIPs.push(source.ipAddress)
							safeCountries.push(source.country)
							safeProvinces.push(source.province)
						}
					}
					ctx.args.data.status = verificationStatusConfig.verified
					if (safeIPs.indexOf(ctx.args.data.ipAddress) <= -1)
						ctx.args.data.status = verificationStatusConfig.unverified
					if (safeCountries.indexOf(ctx.args.data.country) <= -1)
						ctx.args.data.status = verificationStatusConfig.unverified
					if (safeProvinces.indexOf(ctx.args.data.province) <= -1)
						ctx.args.data.status = verificationStatusConfig.unverified
					if (ctx.args.data.status === verificationStatusConfig.unverified) {
						client.findById(ctx.args.data.clientId.toString(), function(err, clientModel) {
							if (err)
								return next(err)
							if (!clientModel)
								return next(new Error('Model not exists'))
							clientModel.updateAttribute(status, availabilityStatusConfig.suspended, function(err, clientUpdatedModel) {
								if (err)
									return next(err)
								return next()
							})
						})
					}
					else 
						return next()
				})				
			}
			else
				return next()
		})
	})

	client.beforeRemote('prototype.__create_receiptsRel', function (ctx, modelInstance, next) {
		var requiredList = ['date', 'price', 'type', 'receiptInfo', 'status', 'clientId']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['date', 'price', 'type', 'receiptInfo', 'status', 'clientId']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		return next()
	})

	client.beforeRemote('prototype.__create_receiptsRel', function (ctx, modelInstance, next) {
		if (modelInstance.status === operationStatusConfig.successful) {
			var clientFinance = app.model.clientFinance
			clientFinance.find({where:{'clientId': modelInstance.clientId.toString()}}, function(err, clientFinanceList) {
				if (err)
					return next(err)
				if (clientFinanceList.length == 0)
					return next(new Error('No model found'))
				if (clientFinanceList.length > 1)
					return next(new Error('Duplicate model found'))
				var clientFinanceModel = clientFinanceList[0]
				if (modelInstance.type === transactionTypeConfig.input) {
					clientFinanceModel.additiveChainFunction(modelInstance.clientId, modelInstance.price, function(err, additionResult) {
						if (err)
							return next(err)
						return next()
					})
				}
				else {
					clientFinanceModel.reduceChainFunction(modelInstance.clientId, modelInstance.price, function(err, reductionResult) {
						if (err)
							return next(err)
						return next()
					})	
				}	
			})
		}
		else 
			return next()
	})

}
