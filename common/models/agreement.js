var modelStatusConfig = require('../../config/ModelStatus.json')
var visibilityTypeConfig = require('../../config/VisibilityType.json')

var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

var CONTAINERS_URL = '/api/containers/'

var fs = require('fs')
var path = require('path')

var agreementV1Handler = require('../../template/agreement/agreement-v1')

module.exports = function(agreement) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

  var visibilityTypeList = []
  for (var key in visibilityTypeConfig) 
		visibilityTypeList.push(visibilityTypeConfig[key])

	agreement.validatesInclusionOf('status', {in: statusList})
	agreement.validatesInclusionOf('type', {in: visibilityTypeList})
  agreement.validatesUniquenessOf('name')
	agreement.validatesUniquenessOf('fileName')

  function writeBack(file, inputData, cb) {
    fs.writeFile(file, inputData, function (err) {
      if (err)
        return cb(err, null)
      return cb(null, 'result')
    })
  }

  agreement.beforeRemote('create', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
        return next(err)
      if (response.roles.length == 0) {
        var requiredList = ['name', 'explanation', 'content', 'type', 'fileName']
        if (!utility.requiredChecker(ctx.args.data, requiredList))
          return next(new Error('Required Parameters'))
        var whiteList = ['name', 'explanation', 'content', 'type', 'fileName']
        if (!utility.whiteChecker(ctx.args.data, whiteList))
          return next(new Error('White Parameters'))    
        ctx.args.data.clientId = ctx.args.options.accessToken.userId.toString()
      }
      else {
        var requiredList = ['name', 'explanation', 'content', 'type', 'fileName', 'clientId']
        if (!utility.requiredChecker(ctx.args.data, requiredList))
          return next(new Error('Required Parameters'))
        var whiteList = ['name', 'explanation', 'content', 'type', 'fileName', 'clientId']
        if (!utility.whiteChecker(ctx.args.data, whiteList))
          return next(new Error('White Parameters'))    
      }
      ctx.args.data.status = modelStatusConfig.created
      ctx.args.data.adminMessage = 'It is just created'
      ctx.args.data.revisionCounter = 1
      ctx.args.data.createDate = Number(utility.getUnixTimeStamp())
      ctx.args.data.modifyDate = 0
      ctx.args.data.finalizeDate = 0
      var directory = path.resolve(__dirname + '/../../fileStorage/agreement/')
      var fp = directory + '/' + ctx.args.data.fileName + '.html'
      var fileURL = CONTAINERS_URL + 'agreement' + '/download/' + ctx.args.data.fileName + '.html'
      ctx.args.data.filePath = fp
      ctx.args.data.fileURL = fileURL
      return next()  
    })
	})

  agreement.afterRemote('create', function (ctx, modelInstance, next) {
		agreementV1Handler.inputValidator(modelInstance, function (err) {
			if (err)
				return next(err)
        agreementV1Handler.mergeDataWithTemplate(modelInstance, app.templates.agreements['agreement-v1'], function (err, response) {
				if (err)
					return next(err)
				var directory = path.resolve(__dirname + '/../../fileStorage/agreement/')
				var fp = directory + '/' + modelInstance.fileName + '.html'
				var fileURL = CONTAINERS_URL + 'agreement' + '/download/' + modelInstance.fileName + '.html'
				writeBack(fp, response, function (err, writeObject) {
					if (err)
						return next(err)
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
			})
		})
  })
  
  agreement.beforeRemote('prototype.patchAttributes', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
        return next(err)
      agreement.findById(ctx.req.params.id.toString(), function(err, agreementModel) {
        if (err)
          return next(err)
        if (!agreementModel)
          return next(new Error('Oops! Model Not Found'))       
        ctx.args.data.modifyDate = Number(utility.getUnixTimeStamp())
        ctx.args.data.revisionCounter = Number(ctx.args.data.revisionCounter) + 1
        if (response.roles.length == 0) {
          if (ctx.args.options.accessToken.userId.toString() !== agreementModel.clientId.toString())
            return next(new Error('Owner problem in patch attributes'))
          if (agreementModel.status === modelStatusConfig.approved)
            return next(new Error('It is Finalized and Locked'))
          var whiteList = ['name', 'explanation', 'content', 'type', 'fileName']
          if (!utility.whiteChecker(ctx.args.data, whiteList))
            return next(new Error('White Parameters'))
        }
        else {
          var whiteList = ['name', 'explanation', 'content', 'type', 'fileName', 'adminMessage', 'status', 'depositId', 'lotteryId', 'clientId']
          if (!utility.whiteChecker(ctx.args.data, whiteList))
            return next(new Error('White Parameters'))
          if (ctx.args.data.status === modelStatusConfig.approved)
            ctx.args.data.finalizeDate = Number(utility.getUnixTimeStamp())
        }
        var filename = agreementModel.fileName
        if ((ctx.args.data.fileName) && agreementModel.fileName !== ctx.args.data.fileName) {
          filename = ctx.args.data.fileName
          fs.unlinkSync(agreementModel.filePath)
        }
        var directory = path.resolve(__dirname + '/../../fileStorage/agreement/')
        var fp = directory + '/' + filename + '.html'
        var fileURL = CONTAINERS_URL + 'agreement' + '/download/' + filename + '.html'
        ctx.args.data.filePath = fp
        ctx.args.data.fileURL = fileURL
        return next()
      })
    })		
	})

  agreement.afterRemote('prototype.patchAttributes', function (ctx, modelInstance, next) {
		agreementV1Handler.inputValidator(modelInstance, function (err) {
			if (err)
				return next(err)
      agreementV1Handler.mergeDataWithTemplate(modelInstance, app.templates.agreements['agreement-v1'], function (err, response) {
				if (err)
					return next(err)
				var directory = path.resolve(__dirname + '/../../fileStorage/agreement/')
				var fp = directory + '/' + modelInstance.fileName + '.html'
				var fileURL = CONTAINERS_URL + 'agreement' + '/download/' + modelInstance.fileName + '.html'
				writeBack(fp, response, function (err, writeObject) {
					if (err)
						return next(err)
					return next()
				})
			})
		})
	})

	agreement.beforeRemote('deleteById', function (ctx, modelInstance, next) {
		agreement.findById(ctx.req.params.id.toString(), function(err, agreementModel) {
			if (err)
        return next(err)
      if (!agreementModel)
        return next(new Error('Oops! Model Not Found'))
			fs.unlink(agreementModel.filePath, function(err) {
				if (err)
					return next(err)
				return next()
			})
		})
	})

}
