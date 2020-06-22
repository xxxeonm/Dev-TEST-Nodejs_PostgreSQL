var http = require('http');
var url = require('url');
var qs = require('querystring');

var template = require('./lib/template.js');

var topic = require('./lib/topic');
var author = require('./lib/author');
const client = require('./lib/db');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        topic.home(request, response)
      } else {
        topic.detail(request, response);
      } 
    } else if(pathname === '/create'){
      topic.create(request, response);
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
        topic.create_process(request, response, body);
      });
    } else if(pathname === '/update'){
      topic.update(request, response);
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
        topic.update_process(request, response, body)
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
        topic.delete_process(request, response, body);
      });
    } else if (pathname === '/author'){
      author.home(request, response);
    } else if (pathname === '/author/create_process') {
      var body = '';
      request.on('data', function(data) {
          body += data;
      });
      request.on('end', function() {
        author.create_process(request, response, body); // list와 같은 화면에서 create하므로 그냥 create는 필요없음
      });
    } else if (pathname === '/author/update') {
      author.update(request, response);
    } else if (pathname === '/author/update_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        author.update_process(request, response, body);
      })
    } else if (pathname === '/author/delete_process') {
      author.delete_process(request, response, queryData.id);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
