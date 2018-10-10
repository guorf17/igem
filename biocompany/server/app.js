var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var login = require('./routes/login');
var user = require('./routes/user');
var question = require('./routes/question');
var radio = require('./routes/radio');
var xinxi = require('./routes/xinxi');
var huida = require('./routes/huida');
var wenti = require('./routes/wenti');
var login = require('./routes/login');
var idea = require('./routes/idea');
var comment = require('./routes/comment'); 

var question_detail = require('./routes/question_detail');
var answer = require('./routes/answer');

var app = express();
var port = config.port;

app.use(bodyParser.json());


app.use('/login', login);

app.use('/user', user);
app.use('/question', question);
app.use('/radio', radio);
app.use('/xinxi', xinxi);
app.use('/huida', huida);
app.use('/wenti', wenti);
app.use('/login', login);
app.use('/idea', idea);
app.use('/comment', comment);

app.use('/question_detail', question_detail);
app.use('/answer', answer);

app.use(function(req, res, next) {

    res.status(404).json({
        error: '资源未找到'
    });

});

app.use(function(error, req, res, next) {

    console.log(error);
    res.status(500).json({
        error: '服务器内部错误'
    });

});

app.listen(port, function(error) {
    if(error) {
        console.log('error!');
    }
    else {
        console.log("Server start! Listening on localhost:" + port);
    }
});