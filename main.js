var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');

var client = require('./lib/db')

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        /*
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
        */
        client.query('SELECT * FROM topic', (err, res) => {
          topics = res.rows;
          console.log(topics);
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        })
      } else {
        /*
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });*/
        client.query('SELECT * FROM topic', (err, res) => {
          if (err) throw err;
          var list = template.list(res.rows);
          client.query(`SELECT * FROM topic WHERE id = $1`, [queryData.id], (err, res) => {
            if (err) throw err;
            topic = res.rows[0];
            console.log(topic);
            var title = topic.title;
            var html = template.HTML(title, list,
              `<h2>${topic.title}</h2>${topic.description}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${topic.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${topic.id}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          })
        });
      } 
    } else if(pathname === '/create'){
      /*
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
      */
      client.query(`SELECT * FROM topic`, (err, res) => {
        var title = 'WEB - create';
        var list = template.list(res.rows);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          /*
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
          */
          client.query(`
            INSERT INTO topic(title, description, created, author_id) 
            VALUES($1, $2, NOW(), $3) RETURNING id`, [post.title, post.description, 1], (err, res) => {
              if (err) throw err;
              console.log(res.rows);
              response.writeHead(302, {Location: `/?id=${res.rows[0].id}`});
              response.end();
          });
      });
    } else if(pathname === '/update'){
      /*
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
      */
      client.query(`SELECT * FROM topic`, (err, res) => {
        if (err) throw err;
        var list = template.list(res.rows);
        client.query(`SELECT * FROM topic WHERE id = $1`, [queryData.id], (err, res) => {
          if (err) throw err;
          var topic = res.rows[0];
          var html = template.HTML(topic.id, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic.id}">
              <p><input type="text" name="title" placeholder="title" value="${topic.title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic.description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic.title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          /*
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
          */
         client.query(`UPDATE topic SET title=$1, description=$2 WHERE id = $3`, [post.title, post.description, post.id], (err, res) => {
          if (err) throw err;
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
         })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          /*
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
          */
        console.log(post.id);
        client.query(`DELETE FROM topic WHERE id = $1`, [post.id], (err, res) => {
        if (err) throw err;
        response.writeHead(302, {Location: `/`});
        response.end();
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
