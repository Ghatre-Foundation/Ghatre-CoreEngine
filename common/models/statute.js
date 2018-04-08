var modelStatusConfig = require('../../config/ModelStatus.json')
var visibilityTypeConfig = require('../../config/VisibilityType.json')

var app = require('../../server/server')
var utility = require('../../public/utility')

var CONTAINERS_URL = '/api/containers/'

var fs = require('fs')
var path = require('path')

var statueV1Handler = require('../../template/statute/statute-v1')

module.exports = function(statute) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

  var visibilityTypeList = []
  for (var key in visibilityTypeConfig) 
		visibilityTypeList.push(visibilityTypeConfig[key])

	statute.validatesInclusionOf('status', {in: statusList})
	statute.validatesInclusionOf('type', {in: visibilityTypeList})
  statute.validatesUniquenessOf('name')
	statute.validatesUniquenessOf('fileName')

  function writeBack(file, inputData, cb) {
    fs.writeFile(file, inputData, function (err) {
      if (err)
        return cb(err, null)
      return cb(null, 'result')
    })
  }

  statute.beforeRemote('create', function (ctx, modelInstance, next) {
		var requiredList = ['name', 'explanation', 'content', 'type', 'fileName']
    if (!utility.requiredChecker(ctx.args.data, requiredList))
			return next(new Error('Required Parameters'))
		var whiteList = ['name', 'explanation', 'content', 'type', 'fileName']
		if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))	
		ctx.args.data.status = modelStatusConfig.created
		ctx.args.data.version = '1.0'
		ctx.args.data.lastUpdate = Number(utility.getUnixTimeStamp())
		var directory = path.resolve(__dirname + '/../../fileStorage/statute/')
		var fp = directory + '/' + ctx.args.data.fileName + '.html'
		var fileURL = CONTAINERS_URL + 'statute' + '/download/' + ctx.args.data.fileName + '.html'
		ctx.args.data.filePath = fp
		ctx.args.data.fileURL = fileURL
		return next()
	})

  statute.afterRemote('create', function (ctx, modelInstance, next) {
		statueV1Handler.inputValidator(modelInstance, function (err) {
			if (err)
				return next(err)
			statueV1Handler.mergeDataWithTemplate(modelInstance, app.templates.statutes['statute-v1'], function (err, response) {
				if (err)
					return next(err)
				var directory = path.resolve(__dirname + '/../../fileStorage/statute/')
				var fp = directory + '/' + modelInstance.fileName + '.html'
				var fileURL = CONTAINERS_URL + 'statute' + '/download/' + modelInstance.fileName + '.html'
				writeBack(fp, response, function (err, writeObject) {
					if (err)
						return next(err)
					modelInstance.updateAttribute('status', modelStatusConfig.approved, function(err, updatedModel) {
						if (err)
							return next(err)
						return next()
					})
				})
			})
		})
	})

  statute.beforeRemote('prototype.patchAttributes', function (ctx, modelInstance, next) {
		var whiteList = ['name', 'explanation', 'content', 'version', 'type', 'fileName', 'status']
    if (!utility.whiteChecker(ctx.args.data, whiteList))
			return next(new Error('White Parameters'))
		ctx.args.data.lastUpdate = Number(utility.getUnixTimeStamp())
		statute.findById(ctx.req.params.id.toString(), function(err, statuteModel) {
			if (err)
				return next(err)
			if (!statuteModel)
				return next(new Error('Oops! Model Not Found'))
			if (statuteModel.status === modelStatusConfig.approved)
				return next(new Error('It is Finalized and Locked'))
			var filename = statuteModel.fileName
			if ((ctx.args.data.fileName) && statuteModel.fileName !== ctx.args.data.fileName) {
				filename = ctx.args.data.fileName
				fs.unlinkSync(statuteModel.filePath)
			}
			var directory = path.resolve(__dirname + '/../../fileStorage/statute/')
			var fp = directory + '/' + filename + '.html'
			var fileURL = CONTAINERS_URL + 'statute' + '/download/' + filename + '.html'
			ctx.args.data.filePath = fp
			ctx.args.data.fileURL = fileURL
			return next()
		})
	})

  statute.afterRemote('prototype.patchAttributes', function (ctx, modelInstance, next) {
		statueV1Handler.inputValidator(modelInstance, function (err) {
			if (err)
				return next(err)
			statueV1Handler.mergeDataWithTemplate(modelInstance, app.templates.statutes['statute-v1'], function (err, response) {
				if (err)
					return next(err)
				var directory = path.resolve(__dirname + '/../../fileStorage/statute/')
				var fp = directory + '/' + modelInstance.fileName + '.html'
				var fileURL = CONTAINERS_URL + 'statute' + '/download/' + modelInstance.fileName + '.html'
				writeBack(fp, response, function (err, writeObject) {
					if (err)
						return next(err)
					return next()
				})
			})
		})
	})

	statute.beforeRemote('deleteById', function (ctx, modelInstance, next) {
		statute.findById(ctx.req.params.id.toString(), function(err, statuteModel) {
			if (err)
				return next(err)
			if (!statuteModel)
				return next(new Error('Oops! Model Not Found'))       
			fs.unlink(statuteModel.filePath, function(err) {
				if (err)
					return next(err)
				return next()
			})
		})
	})

}
