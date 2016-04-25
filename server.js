"use strict";

/* dependencies */
var aws = require('aws-sdk'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

var port = process.env.PORT || 8080,
    accessKeyID = process.env.AccessKeyID,
    secretKey = process.env.SecretKey,
    region = process.env.Region || 'us-east-1',
    s3Bucket = process.env.S3Bucket || 'image-viewer-app';

var app = express();
var jsonParser = bodyParser.json();

app.use(morgan('combined')); // register morgan library for logging
app.post('/', jsonParser, function (req, res) {
  console.log(JSON.stringify(req.body));

  res.sendStatus(200);
});

app.listen(port);

console.log('Server listens on port: ' + port);