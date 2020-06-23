var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

var client = require('./db');
var template = require('./template.js');
const { query } = require('./db');

exports.home = function(request, response) {
    client.query(`SELECT * FROM topic`, function(err, res) {
        if (err) throw err;
        var title = 'author';
        var list = template.list(res.rows);
        client.query(`SELECT * FROM author`, function (err, res) {
            var html = template.HTML(title, list, 
                `
                ${template.authorTable(res.rows)}
                <style>
                    table {
                        border-collapse: collapse;
                    } 
                    td {
                        border: 1px solid black;
                    }
                </style>
                <form action="/author/create_process" method="post">
                    <p>
                        <input type="text" name="name" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="profile"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                '<a href="/create">create</a>'
                );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response, body) {
    var author = qs.parse(body);
    client.query(`INSERT INTO author(name, profile) VALUES($1, $2)`, [author.name, author.profile], (err, res) => {
        if (err) throw err;
        response.writeHead(302, {Location: '/author'});
        response.end();
    });
}

exports.update = function(request, response) {
    client.query(`SELECT * FROM topic`, function(err, res) {
        var title = 'author';
        var topics = template.list(res.rows);
        client.query(`SELECT * FROM author`, function(err, res) {
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            var authors = res.rows;
            client.query(`SELECT * FROM author WHERE id = $1`, [queryData.id], (err, res) => {
              var author = res.rows[0];
              var html = template.HTML(title, topics, 
                `
                ${template.authorTable(authors)}
                <style>
                    table {
                        border-collapse: collapse;
                    }
                    td {
                        border: 1px solid black;
                    }
                </style>
                <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${queryData.id}">
                    </p>
                    <p>
                        <input type="text" name="name" value="${sanitizeHtml(author.name)}" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description">${sanitizeHtml(author.profile)}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                </form>
                `,
                ``);
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response, body) {
    var author = qs.parse(body);
    client.query(`UPDATE author SET name=$1, profile=$2 WHERE id=$3`, [author.name, author.profile, author.id], (err, res) => {
        if (err) throw err;
        response.writeHead(302, {Location: '/author'});
        response.end();
      });
}

exports.delete_process = function(request, response, body) {
    client.query(`DELETE FROM author WHERE id=$1`, [body], (err, res) => {
        if (err) throw err;
        response.writeHead(302, {Location: '/author'});
        response.end();
    });
}