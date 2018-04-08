module.exports = {
  inputValidator: function (dataInput, callback) {
    if (dataInput)
      if (dataInput.name && dataInput.explanation && dataInput.revisionCounter && dataInput.content && dataInput.status && dataInput.type && dataInput.createDate && dataInput.modifyDate && dataInput.finalizeDate && dataInput.adminMessage)
        return callback(null)
    return callback(new Error('Input Validation for Dynamic Agreement V1 Failed'))
  },

  mergeDataWithTemplate: function(data, template, callback) {
    const cheerio = require('cheerio')
		const $ = cheerio.load(template)
		$('#titleId').text(data.name)
    $('#nameId').text(data.name)
    $('#explanationId').text(data.explanation)
		$('#revisionCounterId').text(data.revisionCounter)
		$('#createDateId').text(data.createDate)
		$('#modifyDateId').text(data.modifyDate)
		$('#finalizeDateId').text(data.finalizeDate)
		$('#adminMessageId').text(data.revisionCounter)
		for (var i = 0; i < data.content.length; i++)
			$('#contentId').append('<p>' + data.content[i] + '</p>')
		$('#statusId').text(data.status)
		$('#typeId').text(data.type)
    return callback(null, $.html())
  }
}  
