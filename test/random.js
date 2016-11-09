'use strict';

var expect = require('chai').expect;
var ascii85 = require('../index');

var _BufferAllocUnsafe = Buffer.allocUnsafe || function(size) {
  return new Buffer(size);
};

describe('Random codec', function() {
  var codecs = [ascii85, ascii85.ZeroMQ, ascii85.PostScript];
  var i, result;

  for (i = 10; i < 100; i += 1) {
    it('tests random binarys with length ' + i, function() {
      random(10, i).forEach(function(buf) {
        codecs.forEach(function(codec) {
          result = codec.decode(codec.encode(buf));
          expect(result.length).to.equal(buf.length);
          expect(result.toString('binary')).to.equal(buf.toString('binary'));
        });
      });
    });
  }
});

function random(num, len) {
  var bufs = [];
  var i, j, buf;

  for (i = 0; i < num; i++) {
    buf = _BufferAllocUnsafe(len);

    for (j = 0; j < len; j++) {
      buf.writeUInt8(~~(Math.random() * 256), j);
    }

    bufs.push(buf);
  }

  return bufs;
}
