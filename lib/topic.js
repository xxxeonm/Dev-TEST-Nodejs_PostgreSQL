var url = require('url');
var qs = require('querystring');

var client = require('./db');
var template = require('./template.js');

exports.home = function(request, response) {
    client.query('SELECT * FROM topic', (err, res) => {
        topics = res.rows;
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.detail = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    client.query('SELECT * FROM topic', (err, res) => {
        if (err) throw err;
        var list = template.list(res.rows);
        client.query(`SELECT topic.id, topic.title, topic.description, topic.author_id, author.name 
        FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = $1`, [queryData.id], (err, res) => {
            if (err) throw err;
            topic = res.rows[0];
            console.log(topic);
            var title = topic.title;
            var html = template.HTML(title, list,
                `<h2>${topic.title}</h2>
                ${topic.description} ${topic.name}`,
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

exports.create = function(request, response) {
    client.query(`SELECT * FROM topic`, (err, res) => {
      var list = template.list(res.rows);
      client.query(`SELECT * FROM author`, (err, res)=> {
        var title = 'WEB - create';
        var authors = res.rows;
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              ${template.authorCombo(authors)}
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    });
}
exports.create_process = function(request, response, body) {
    var post = qs.parse(body);
    client.query(`
    INSERT INTO topic(title, description, created, author_id) 
    VALUES($1, $2, NOW(), $3) RETURNING id`, [post.title, post.description, post.author], (err, res) => {
      if (err) throw err;
      response.writeHead(302, {Location: `/?id=${res.rows[0].id}`});
      response.end();
  });
}

exports.update = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    client.query(`SELECT * FROM topic`, (err, res) => {
      if (err) throw err;
      var list = template.list(res.rows);
      client.query(`SELECT * FROM author`, (err, res) => {
        authors = res.rows;
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
                ${template.authorCombo(authors, topic.author_id)}
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
    });
}
exports.update_process = function(request, response, body) {
    var post = qs.parse(body);
    console.log(post);
    client.query(`UPDATE topic SET title=$1, description=$2, author_id=$3 WHERE id = $4`, [post.title, post.description, post.author, post.id], (err, res) => {
      if (err) throw err;
      response.writeHead(302, {Location: `/?id=${post.id}`});
      response.end();
    });
}

exports.delete_process = function(request, response, body) {
    var post = qs.parse(body);
    client.query(`DELETE FROM topic WHERE id = $1`, [post.id], (err, res) => {
      if (err) throw err;
      response.writeHead(302, {Location: `/`});
      response.end();
    });
}
