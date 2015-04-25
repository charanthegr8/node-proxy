let http = require('http')
let request=require('request')
let argv = require('yargs')
	.default('host', '127.0.0.1')
.argv

let fs = require('fs')
let logStream = argv.logFile ? fs.createWriteStream(argv.logFile) : process.stdout


let scheme = 'http://'
let port = argv.port || argv.host ==='127.0.0.1' ? 8000 : 80


let destinationURL =  scheme + argv.host  + ':' + port
// This is echo server
http.createServer ((req, res) => {
	logStream.write (JSON.stringify(req.headers) + '\n')
	req.pipe (logStream)
	req.pipe(res)
  	for (let header in req.headers) {
    	res.setHeader(header, req.headers[header])
  	}

}).listen(8000)

logStream.write('Listening at port 8000')

// This is proxy
http.createServer((req, res) =>{
	let url = destinationURL
	
	if (req.headers['x-dest-url']) {
    	url = req.headers['x-dest-url']
 		
 	} 
	logStream.write('Redirecing to ' + url + '\n')
	let options = {
		method: req.method,
		headers:req.headers,
		url:url+req.url
	}
	req.pipe(logStream)
	let destResponse = req.pipe(request(options))
	destResponse.pipe(logStream)
	destResponse.pipe(res)
	
}).listen(8001)