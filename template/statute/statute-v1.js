module.exports = {
  inputValidator: function (dataInput, callback) {
    if (dataInput)
      if (dataInput.name && dataInput.explanation && dataInput.version && dataInput.content && dataInput.status && dataInput.lastUpdate)
        return callback(null)
    return callback(new Error('Input Validation for Dynamic Statute V1 Failed'))
  },

  mergeDataWithTemplate: function(data, template, callback) {
    const cheerio = require('cheerio')
		const $ = cheerio.load(template)
		$('#titleId').text(data.name)
    $('#nameId').text(data.name)
    $('#explanationId').text(data.explanation)
		$('#versionId').text(data.version)
		for (var i = 0; i < data.content.length; i++)
			$('#contentId').append('<p>' + data.content[i] + '</p>')
		$('#statusId').text(data.status)
		$('#lastUpdateId').text(data.lastUpdate)
    return callback(null, $.html())
  }
}  
