var url = require('url');
var qs = require('querystring');

var client = require('./db');
var template = require('./template.js');

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
                `,
                '<a href="/create">create</a>'
                );
            response.writeHead(200);
            response.end(html);
        });
    });
}