module.exports = function (app) {
	app.datasources.fileStorage.connector.allowedContentTypes = ["image/jpg"]
  app.datasources.fileStorage.connector.getFilename = function (file, req, res) {
    return (req.accessToken.userId.toString() + '.jpg')
	}
}
