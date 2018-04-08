var app = require('../../server/server')
var utility = require('../../public/utility')
var roleManager = require('../../public/roleManager')

module.exports = function(manager) {

  manager.createAdmin = function (data, req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.indexOf('founder') >= 0) {
				var requiredList = ['email', 'password', 'username', 'phoneNumber']
				if (!utility.requiredChecker(data, requiredList))
					return next(new Error('Required Parameters'))
				var whiteList = ['email', 'password', 'username', 'phoneNumber']
				if (!utility.whiteChecker(data, whiteList))
					return next(new Error('White Parameters'))
				var User = app.models.User
				var Role = app.models.Role
				var RoleMapping = app.models.RoleMapping
				var newUserData = {
					email: data.email,
					username: data.username,
					phoneNumber: data.phoneNumber,
					password: data.password,
					job: 'admin'
				}
				User.create(newUserData, function(err, userModel) {
					if (err)
						return cb(err)
					if (!userModel)
						return cb(new Error('model not exists'))
						var roleData = {
							name: 'admin'
						}
						Role.create(roleData, function (err, role) {
							if (err)
								console.error(err)
							role.principals.create({
								principalType: RoleMapping.USER,
								principalId: userModel.id
							}, function (err, principal) {
								if (err)
									console.error(err)
								return cb(null, userModel)
							})
						})				
				})
			}
			else
				return cb(new Error('Not Allowed, Only Founders'))
		})
  }

  manager.remoteMethod('createAdmin', {
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
    description: 'create an admin user',
    http: {
      path: '/createAdmin',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      root: true,
      type: 'object'
    }
	})

  manager.removeAdmin = function (adminId, req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.indexOf('founder') >= 0) {
				var User = app.models.User
				User.removeById(adminId.toString(), function(err) {
					if (err)
						return cb(err)
					return cb(null, 'successful')
				})	
			}
			else
				return cb(new Error('Not Allowed, Only Founders'))
		})
  }

  manager.remoteMethod('removeAdmin', {
    accepts: [{
      arg: 'adminId',
      type: 'string',
      http: {
        source: 'path'
      }
    }, {
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }],
    description: 'remove an admin user',
    http: {
      path: '/removeAdmin/adminId',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      root: true,
      type: 'object'
    }
	})

  manager.getAdmin = function (adminId, req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.indexOf('founder') >= 0) {
				var User = app.models.User
				User.findById(adminId.toString(), function(err, userModel) {
					if (err)
						return cb(err)
					if (!userModel)
						return cb(new Error('Model not exists'))
					return cb(null, userModel)
				})
			}
			else
				return cb(new Error('Not Allowed, Only Founders'))
		})
  }

  manager.remoteMethod('getAdmin', {
    accepts: [{
      arg: 'adminId',
      type: 'string',
      http: {
        source: 'path'
      }
    }, {
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }],
    description: 'get an admin user',
    http: {
      path: '/getAdmin/adminId',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      root: true,
      type: 'object'
    }
	})

  manager.getAdmins = function (req, cb) {
		roleManager.getRolesById(app, req.accessToken.userId.toString(), function (err, response) {
			if (err)
				return next(err)
			if (response.roles.indexOf('founder') >= 0) {
				var User = app.models.User
				User.find({where:{job: 'admin'}}, function(err, userList) {
					if (err)
						return cb(err)
					return cb(null, userList)
				})
			}
			else
				return cb(new Error('Not Allowed, Only Founders'))
		})
  }

  manager.remoteMethod('getAdmins', {
    accepts: [{
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }],
    description: 'get all admin users',
    http: {
      path: '/getAdmins',
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
