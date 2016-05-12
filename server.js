"use strict";

var port = process.env.PORT || 8080,
    accessKeyID = process.env.AccessKeyID,
    secretKey = process.env.SecretKey;

/* dependencies */
var aws = require('aws-sdk');
aws.config.update({
  accessKeyId: accessKeyID,
  secretAccessKey: secretKey
});

var express = require('express'),
    bodyParser = require('body-parser'),
    i = require('./imageHandler'),
    q = require('q'),
    morgan = require('morgan');

var app = express();
var jsonParser = bodyParser.json();

app.use(morgan('combined')); // register morgan library for logging
app.post('/', jsonParser, function (req, res) {

  i.parse(req.body)
      .then(i.s3GetObject)
      .then(i.makeThumbnail)
      .then(i.s3PutObject)
      .then(function () {
        res.sendStatus(200).end(); // makes sqsd delete the message from queue
      })
      .catch(function (err) {
        console.error(err);
        res.sendStatus(503).end(); // prevents sqsd from deleting the message
      });
});

app.listen(port);

console.log('Server listens on port: ' + port);