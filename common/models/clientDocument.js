var modelStatusConfig = require('../../config/ModelStatus.json')

var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

module.exports = function(clientDocument) {

  var statusList = []
  for (var key in modelStatusConfig) 
    statusList.push(modelStatusConfig[key])

	clientDocument.validatesInclusionOf('nationalCardStatus', {in: statusList})
	clientDocument.validatesInclusionOf('birthCertificateStatus', {in: statusList})

	clientDocument.beforeRemote('updateById', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
        return next(err)
      if (response.roles.length != 0) {
        var whiteList = ['nationalCardStatus', 'nationalCardAdminMessage', 'birthCertificateStatus', 'birthCertificateAdminMessage']
        if (!utility.whiteChecker(ctx.args.data, whiteList))
          return next(new Error('White Parameters'))
      }
      else
        return next(new Error('Only admin and founder are allowed'))
    })
	})

	clientDocument.afterRemote('updateById', function (ctx, modelInstance, next) {
    if (modelInstance.nationalCardStatus === modelStatusConfig.approved && modelInstance.birthCertificateStatus === modelStatusConfig.approved) {
      var client = app.models.client
      client.findById(modelInstance.clientId.toString(), function(err, clientModel) {
        if (err)
          return next(err)
        if (!clientModel)
          return next(new Error('Model not Found'))
        var clientNewData = {
          'stage': Number(clientModel.stage) + 1,
          'status': availabilityStatusConfig.available
        }
        clientModel.updateAttributes(clientNewData, function(err, clientUpdatedModel) {
          if (err)
            return next(err)
          return next()
        })
      })      
    }        
  })

}