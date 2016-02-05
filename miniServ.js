startHTTPServ();
readConsole();

function startHTTPServ() {
  var http = require('http');
  httpServer = http.createServer(function(request, response) {
    var responseData = getResponse(request.url);
    console.log('Serving ' + responseData.url);
    response.writeHead(responseData.status, responseData.headers);
    response.end(responseData.data);
  }).listen(1337, '127.0.0.1');
  console.log('Server running at http://127.0.0.1:1337/');
}

function getResponse(url) {
  // Variable declaration
  var fs = require('fs');
  var status = 404;
  var type;
  var data;
  // Process request url
  if (url.match(/.*\.\..*/)) {
    status = 400;
    url = '400.shtml';
  }
  url = url.split(/(#|\?)/)[0];
  if (url.match(/.*\/$/))
    url = url + 'index.html';
  if (!url.match(/.*\..{0,5}$/))
    url = url + '.html';
  url = decodeURI(url);
  type = findContentType(url);
  // Get file data
  try {
    data = fs.readFileSync('./' + url);
    status = 200;
  } catch (ex) {
    console.log('Failed to serve ' + url);
    data = 'Unknown error: ' + ex;
  }
  // Return data object
  return {
    'status': status,
    'type': type,
    'url': url,
    'headers': {
      'Content-Type': type,
      'Is-Development': true,
      'Server': 'mini-serv'
    },
    'data': data
  };
}

function findContentType(reqUrl) {
  if (reqUrl.match(/.*\.(s)?html/))
    return 'text/html';
  if (reqUrl.match(/.*\.css/))
    return 'text/css';
  if (reqUrl.match(/.*\.js/))
    return 'application/javascript';
  if (reqUrl.match(/.*\.json/))
    return 'application/json';
  if (reqUrl.match(/.*\.svg/))
    return 'image/svg+xml';
  if (reqUrl.match(/.*\.png/))
    return 'image/png';
  if (reqUrl.match(/.*\.jp(e)?g/))
    return 'image/jpeg';
  if (reqUrl.match(/.*\.mp4/))
    return 'video/mp4';
  return 'text/plain';
}

function readConsole() {
  var readline = require('readline');
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.setPrompt('');
  rl.prompt();
  rl.on('line', function(line) {
    if (line.match(/(^\?$|^help$)/))
      console.log('\r\nHelp\r\n' +
        'exit    (x): Stop mini-serv\r\n' +
        'rebuild (r): Rebuild the project\r\n' +
        'help    (?): Show this message again\r\n'
      );
    else if (line.match(/(^x$|^exit$)/))
      rl.close();
    else
      console.log('Unknown command. Type \'help\' to see available commands');
    rl.prompt();
  }).on('close', function() {
    process.exit(0);
  });
}
