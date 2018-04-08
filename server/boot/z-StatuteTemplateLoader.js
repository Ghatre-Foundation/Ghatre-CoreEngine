var fs = require('fs')
var path = require('path')

module.exports = function (app) {
  var directory = path.resolve(__dirname + '/../../template/statute/')
	if (!app.templates)
		app.templates = {}
	app.templates.statutes = {}
  fs.readdir(directory, function (err, files) {
    if (err)
      console.error(err)
    files.forEach(function (file) {
			var address = directory + '/' + file
			if (path.extname(directory + '/' + file) === '.js')
				return
      fs.open(address, 'r+', function (err, fd) {
        if (err)
          console.error(err)
        fs.readFile(fd, function (err, data) {
          if (err)
            console.error(err)
					app.templates.statutes[file.slice(0, -5)] = data.toString()
          fs.close(fd, function (err) {
            if (err)
              console.error(err)
          })
        })
      })
    })
  })
}
