http = require('http')

server = http.createServer (request, response) ->
  response.writeHead(200, 'Content-Type': 'text/plain' )
  response.end('Hello World\n')

server.listen 8000, '127.0.0.1', () ->
  console.log('app.js running at http://127.0.0.1:8000/')
