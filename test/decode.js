'use strict';

var expect = require('chai').expect;
var ascii85 = require('../index');

describe('Test decode', function() {
  it('decodes "easy"', function() {
    expect(ascii85.decode('<~ARTY*~>')).to.equal('easy');
  });

  it('decodes "moderate"', function() {
    expect(ascii85.decode('<~D/WrrEaa\'$~>')).to.equal('moderate');
  });

  it('decodes "somewhat difficult"', function() {
    expect(ascii85.decode('<~F)Po,GA(E,+Co1uAnbatCif~>')).to.equal('somewhat difficult');
  });

  it('decodes "         "', function() {
    expect(ascii85.decode('<~+<VdL+<VdL+9~>')).to.equal('         ');
    expect(ascii85.decode('<~yy+9~>')).to.equal('         ');
  });

  it('decodes zeros', function() {
    expect(ascii85.decode('<~!!~>')).to.equal('\0');
    expect(ascii85.decode('<~!!!~>')).to.equal('\0\0');
    expect(ascii85.decode('<~!!!!~>')).to.equal('\0\0\0');
    expect(ascii85.decode('<~z~>')).to.equal('\0\0\0\0');
    expect(ascii85.decode('<~z!!~>')).to.equal('\0\0\0\0\0');
  });
});
