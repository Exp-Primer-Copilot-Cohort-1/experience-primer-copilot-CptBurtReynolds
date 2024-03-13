// Create web server
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var comments = require('./comments.js');

// Create server
var server = http.createServer(function(request, response) {
  var pathname = url.parse(request.url).pathname;
  var ext = path.extname(pathname);
  if (ext) {
    // Serve static files
    fs.readFile(__dirname + pathname, function(err, data) {
      if (err) {
        response.writeHead(500);
        response.end('Error loading ' + pathname);
      } else {
        response.writeHead(200);
        response.end(data);
      }
    });
  } else {
    // Serve dynamic files
    if (pathname === '/comments') {
      if (request.method === 'POST') {
        var body = '';
        request.on('data', function(data) {
          body += data;
          if (body.length > 1e6) {
            request.connection.destroy();
          }
        });
        request.on('end', function() {
          var post = JSON.parse(body);
          comments.add(post, function(err) {
            if (err) {
              response.writeHead(500);
              response.end('Error adding comment');
            } else {
              response.writeHead(200);
              response.end('Comment added');
            }
          });
        });
      } else if (request.method === 'GET') {
        comments.get(function(err, data) {
          if (err) {
            response.writeHead(500);
            response.end('Error getting comments');
          } else {
            response.writeHead(200);
            response.end(JSON.stringify(data));
          }
        });
      }
    } else {
      response.writeHead(404);
      response.end('Not Found');
    }
  }
});

// Listen on port 3000
server.listen(3000);
