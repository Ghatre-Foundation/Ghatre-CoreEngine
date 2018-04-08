var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

module.exports = function(container) {

  container.beforeRemote('**', function(ctx, unused, next) {
    roleManager.getRolesById(app, ctx.args.options.accessToken.userId.toString(), function (err, response) {
      if (err)
				return next(err)
			if (response.roles.indexOf('admin') >= 0 || response.roles.indexOf('founder') >= 0)
				return next()
			if(ctx.methodString === 'container.upload') {
				return next()
			}
			else if(ctx.methodString === 'container.download') {
				if (ctx.req.accessToken.userId.toString() !== ctx.req.param.file.toString())
					return next(new Error('Owner Error'))					
			}
			else
				return next()
		})
	})
	
}
