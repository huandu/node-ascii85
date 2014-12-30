'use strict';

var expect = require('chai').expect;
var ascii85 = require('../index');

describe('Random codec', function() {
  var i;

  for (i = 10; i < 100; i += 3) {
    it('tests random binarys with length ' + i, function() {
      random(10, i).forEach(function(s) {
        expect(ascii85.decode(ascii85.encode(s))).to.equal(s);
      });
    });
  }
});

function random(num, len) {
  var strs = [];
  var i, j, s;

  for (i = 0; i < num; i++) {
    s = '';

    for (j = 0; j < len; j++) {
      s += String.fromCharCode(~~(Math.random() * 256));
    }

    strs.push(s);
  }

  return strs;
}
