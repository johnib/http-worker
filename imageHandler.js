/**
 * Created by johni on 25/04/2016.
 */

var aws = require('aws-sdk'),
    s3 = new aws.S3(),
    q = require('q'),
    im = require('imagemagick'),
    _ = require('lodash');

function parse(sqsMessage) {
  console.info("parse: input:\n", JSON.stringify(sqsMessage));

  if (_.isEmpty(sqsMessage.Records)) {
    throw Error("SQS message has no records");
  }

  var image = {
    Bucket: sqsMessage.Records[0].s3.bucket.name,
    Key: sqsMessage.Records[0].s3.object.key.replace(/\+/g, " ")
  };

  console.info("parse: output:\n", JSON.stringify(image));

  return q.resolve(image);
}

function s3GetObjectPromise(params) {
  var defer = q.defer();

  s3.getObject(params, function (err, data) {
    if (err) {
      defer.reject(err);
    } else {
      params.Body = data.Body;
      params.ContentType = data.ContentType;
      defer.resolve(params);
    }
  });

  return defer.promise;
}

function s3PutObjectPromise(params) {
  var defer = q.defer();

  s3.putObject(params, function (err, data) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(data);
    }
  });

  return defer.promise;
}

function makeThumbnail(image) {
  var defer = q.defer();

  im.resize({
    srcData: image.Body,
    width: 256
  }, function (err, stdout) {
    if (err) {
      defer.reject(err);

    } else {
      image.Key.replace(/^images/, "thumbs");
      image.Body = new Buffer(stdout, 'binary');

      defer.resolve(image);
    }
  });

  return defer.promise;
}

function updateDatabase() {
  console.error("database updated");
}

module.exports = {
  parse: parse,
  s3GetObject: s3GetObjectPromise,
  s3PutObject: s3PutObjectPromise,
  makeThumbnail: makeThumbnail,
  updateDatabase: updateDatabase
};
