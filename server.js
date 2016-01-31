var express = require('express');
var app = express();
var request = require('request');
var args;
var limit;

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/getPic', function(req, res) {
  args = req.query;
  args.chapter = Number(args.chapter);
  args.page = Number(args.page ? args.page : 1);
  getImage(args.name, args.chapter, args.page, res);
});

var getImage = function(name, chapter, page, res) {
  parseHtml(name + '/' + chapter + '/' + page, function(imgUrl, pageLimit) {
    request(imgUrl).pipe(res);
    limit = pageLimit;
    console.log('>>>', args, limit);
  });
}

app.get('/next', function(req, res) {
  if (!args) res.status(400).send('');

  if (args.page + 1 > limit) {
    args.chapter++;
    args.page= 1;
  } else {
    args.page++;
  }
  console.log('next', args);
  getImage(args.name, args.chapter, args.page, res);
});

app.get('/previous', function(req, res) {
  if (!args) res.status(400).send('');

  if (args.page - 1 == 0) {
    args.chapter--;
    args.page = 1;
  } else {
    args.page--;
  }
  console.log('prev', args);
  getImage(args.name, args.chapter, args.page, res);
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var parseHtml = function(url, callback) {
  request(url, function(err, res, body){
    var body = body.split('\n');
    var pages;
    var startIndex;
    var imgUrlPrefix;
    var imgUrl;

    for (index in body) {
      var line = body[index];

      if (line.indexOf('id="img"') > -1 || line.indexOf("id='img'") > -1) {
        if (startIndex) throw {msg: "wtf1111"};
        console.log('img>>>  ', body[index]);

        imgUrl = /src\s*=\s*"(.+?)"/.exec(line)[0];
        imgUrl = imgUrl.substring(0, imgUrl.length - 1).slice(5);
      }
      if (line.indexOf('</select> of') > -1) {
        if (pages) throw {msg: "wtf"};
        console.log('pages>>> ', body[index]);
        pages = Number(line.replace("</select> of", '').replace('</div>', ''));
      }
      if (pages && startIndex) {
        break;
      }
    }

    callback(imgUrl, pages);
  });
}
