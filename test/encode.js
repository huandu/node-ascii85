'use strict';

var expect = require('chai').expect;
var ascii85 = require('../index');

describe('Test encode', function() {
  it('encodes "easy"', function() {
    expect(ascii85.encode('easy')).to.equal('ARTY*');
  });

  it('encodes "easy" without delimiter', function() {
    expect(ascii85.encode('easy', {delimiter: true})).to.equal('<~ARTY*~>');
  });

  it('encodes "moderate"', function() {
    expect(ascii85.encode('moderate')).to.equal('D/WrrEaa\'$');
  });

  it('encodes "somewhat difficult"', function() {
    expect(ascii85.encode('somewhat difficult')).to.equal('F)Po,GA(E,+Co1uAnbatCif');
  });

  it('encodes "         "', function() {
    expect(ascii85.encode('         ')).to.equal('+<VdL+<VdL+9');
    expect(ascii85.encode('         ', {groupSpace: true})).to.equal('yy+9');
  });

  it('encodes zeros', function() {
    expect(ascii85.encode('\0')).to.equal('!!');
    expect(ascii85.encode('\0\0')).to.equal('!!!');
    expect(ascii85.encode('\0\0\0')).to.equal('!!!!');
    expect(ascii85.encode('\0\0\0\0')).to.equal('z');
    expect(ascii85.encode('\0\0\0\0\0')).to.equal('z!!');
  });

  it('encodes binary', function() {
    expect(ascii85.encode('\x60\xD1\x05\x8B\x3D\xB2\xB4\x71\x5A\x66\x5B\x05\xC3\xC7\x14\x1C\x4F\x3D\x17\x1E\x5F\x0C\x68'))
      .to.equal('@*o.94gMG7>%UtB_oEH2:H]L8?OUT');
    expect(ascii85.encode('\x5F\xAA\x7A\xDB\x06\x63\xC5\x43\xD8\xE3\x89\x4F\xC3\xCF\x17\x90\x4E\x0A\xA8\x6E\x86\x73\xD4\x9C\x49\xBC\x94\xA3\x6A\x59\xC3\xC4\xE5\x81\xBF\x03\x97\xB5\x29\x33\xF2\xD5'))
      .to.equal('?`JG,#%PV>f].fa_p9-\\:(!q;L3(k78\\C:_C0AHmjak/KQaJ7uo$m');
    expect(ascii85.encode('\xBB\xE1\xF6\x43\xD4\xDA\x18\x52\x85\x3E\x45\xD5\x61\x6E\xCD\x41\x4C\x05\xEB\x29\xC9\x11\xA1\x11\xEF\x29\xCB\x95\xBF\x7E\xAB\x93\x6F\x96\x08\xC3\x96\x3B\x86\x32\xC4\xD1'))
      .to.equal(']A`HNeCka;Kg%rU@;a=U9Ej`2aUt3YmjZGF^OE5IDjC[HQ90gV`6e');
    expect(ascii85.encode('\x6F\xA7\xA0\xFF\x53\x4D\x5D\x9E\xBD\xA7\x51\x9A\x16\xFE\x14\xB4\xB0\x16\x7E\x0C\x97\x3E\xC7\xD3\x44\xE5\xD0\x94\xA7\xF0\xA2\x3B\x0D\x23\xEC\x58\xD0\x01\xF7\x4A\x25\xCD\xA3\x03\xC1\xDE\xB7\xDA\x99\x1D\xF9\xA0\xA2\x66\x52\x40\xF1\x54\xDA\x55\x8F\x0B\x89\xDC\x72\x61\xAC\x6E\xB9\xAB\x42\xC7\x97\x0F\x61\x46\x0F\x75\xF9\x73'))
      .to.equal('Dl99.;b^Ph]r+_r(B,#TYSMZrQTiI=7-2d[VspEB%3t4AciNl5--`1e_;;ZTR2u*rU1R:gnPn4BNsgg"Eac%e\\Z8\';QOdLo%s@\\h');
  });

  it('encodes data using ZeroMQ flavor', function() {
    expect(ascii85.ZeroMQ.encode('easy')).to.equal('wNPU9');
  });

  it('encodes data using PostScript flavor', function() {
    expect(ascii85.PostScript.encode('easy')).to.equal('<~ARTY*~>');
  });
});
