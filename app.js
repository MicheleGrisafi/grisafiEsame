/*globals require, console, process */
var express         = require('express');
var bodyParser      = require('body-parser');
var fetch 			= require('node-fetch');
//var checker			= require('check');

// instantiate express
var app = express();
var router = express.Router();

//Configure bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set our port
var port = process.env.PORT || 5000;

// middleware route to support CORS and preflighted requests
app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Content-Type', 'application/json');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE');
        return res.status(200).json({});
    }
    console.log("Query=",req.query,";\nBody: ",req.body);
    // make sure we go to the next routes
    next();
});

router.get('/', function (req, res) {
    res.json({ message: 'welcome to our api!' });
});
router.route('/check')
	.post(function(req,res){
		var url = req.body.url;
		var invocationParameters = req.body.invocationParameters;
		var expectedResultData = req.body.expectedResultData;
		var expectedResultStatus = req.body.expectedResultStatus;
		console.log(url);
		console.log(invocationParameters);
		console.log(expectedResultData);
		console.log(expectedResultStatus);
		var output = check(url,invocationParameters,expectedResultData,expectedResultStatus);
		console.log(output);
		res.end("ok!");
	});

// register our router on /
app.use('/', router);

app.listen(port, function () {
    console.log('Node app is running on port', port);
});


function compareResults(expected, actual) {
    if (!expected) return true //always ok if there are no expectations
    if (!actual) return false
    for (let e of Object.keys(expected)) {
        if (actual[e]===undefined || expected[e]!=actual[e]  ) return false
    }
    return true
}
var check = function (url,invocationParameters,expectedResultData,expectedResultStatus){
	var query = url + '?';
	for (var key in invocationParameters) {
		if (invocationParameters.hasOwnProperty(key)) {
			query += key + '=' + invocationParameters[key] + '&';
		}
	}
	query = query.substring(0, query.length - 1)
	console.log(query);
	var risposta = [];
	return fetch(query)
		.then(function(res) {
			var resultsCheck = compareResults(expectedResultData,res);
			var statusCheck = expectedResultStatus == res.status;
			risposta['urlChecked'] = url;
			risposta['resultData'] = res;
			risposta['resultStatus'] = res.status;
			risposta['statusTestPassed'] = statusCheck;
			risposta['resultDataAsExpected'] = resultsCheck;
			console.log(risposta.json());
			return risposta.json();
		});
}
