var reader = require('fs')
var express = require('express')
var app = express()

function getHtml(filePath) {

	var _data

	reader.readFile(filePath, (err,data) => {
		if (err) throw err
		_data = data
	})

	return _data
}

app.use(express.static(__dirname))

app.get('/', function (req, res) {
	res.send('Hello')
})

app.get('/example', function (req, res) {

	res.sendFile(__dirname+'/intro_example.html')
})
app.listen(8080, function () {
	console.log( ' listening 8080 port')
})	