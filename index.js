/**
 * Copyright 2015 Huan Du. All rights reserved.
 * Licensed under the MIT license that can be found in the LICENSE file.
 */
'use strict';

var ASCII85_BASE = 85;
var ASCII85_CODE_START = 33;
var ASCII85_CODE_END = ASCII85_CODE_START + ASCII85_BASE;
var ASCII85_NULL = String.fromCharCode(0);
var ASCII85_NULL_STRING = ASCII85_NULL + ASCII85_NULL + ASCII85_NULL + ASCII85_NULL;
var ASCII85_ZERO = 'z';
var ASCII85_ZERO_VALUE = ASCII85_ZERO.charCodeAt(0);
var ASCII85_PADDING_VALUE = 'u'.charCodeAt(0);
var ASCII85_BLOCK_START = '<~';
var ASCII85_BLOCK_START_VALUE = (new Buffer(ASCII85_BLOCK_START)).readInt16BE(0);
var ASCII85_BLOCK_END = '~>';
var ASCII85_BLOCK_END_VALUE = (new Buffer(ASCII85_BLOCK_END)).readInt16BE(0);
var ASCII85_GROUP_SPACE = 'y';
var ASCII85_GROUP_SPACE_VALUE = ASCII85_GROUP_SPACE.charCodeAt(0);
var ASCII85_GROUP_SPACE_CODE = 0x20202020;
var ASCII85_GROUP_SPACE_STRING = '    ';

var ASCII85_DEFAULT_ENCODING_TABLE = (function() {
  var arr = new Array(ASCII85_BASE);
  var i;

  for (i = 0; i < ASCII85_BASE; i++) {
    arr[i] = String.fromCharCode(ASCII85_CODE_START + i);
  }

  return arr;
})();

var ASCII85_DEFAULT_DECODING_TABLE = (function() {
  var arr = new Array(1 << 8);
  var i;

  for (i = 0; i < ASCII85_BASE; i++) {
    arr[ASCII85_CODE_START + i] = i;
  }

  return arr;
})();

/**
 * Create a new Ascii85 codec.
 * @param {Array|Object} [options] is a list of chars for encoding or an option object.
 *
 * Supported options are listed in Ascii85#encode document.
 * @note Only encoding table is supported. Decoding table will be generated automatically
 * based on encoding table.
 */
function Ascii85(options) {
  var decodingTable;

  options = options || {};
  this._options = options;

  // generate encoding and decoding table.
  if (Array.isArray(options.table)) {
    decodingTable = [];
    options.table.forEach(function(v, i) {
      decodingTable[v.charCodeAt(0)] = i;
    });

    options.encodingTable = options.table;
    options.decodingTable = decodingTable;
  }
}

var defaultCodec = module.exports = new Ascii85();

/**
 * Encode a binary data to ascii85 string.
 * @param {String|Buffer} data is a string or Buffer.
 * @param {Array|Object} [options] is a list of chars for encoding or an option object.
 *                                 If no options is provided, encode uses standard ascii85
 *                                 char table to encode data.
 *
 * Supported options are following.
 *   - table: Table for encoding. Default is ASCII85_DEFAULT_ENCODING_TABLE.
 *   - delimiter: Add '<~' and '~>' to output. Default is false.
 *   - groupSpace: Support group of all spaces in btoa 4.2. Default is false.
 */
Ascii85.prototype.encode = function(data, options) {
  var bytes = new Array(5);
  var output = [];
  var buf = data;
  var defOptions = this._options;
  var table, delimiter, groupSpace, digits, cur, i, j, r, b, len, padding;

  if (!(buf instanceof Buffer)) {
    buf = new Buffer(buf, 'binary');
  }

  // prepare options.
  options = options || {};

  if (Array.isArray(options)) {
    table = options;
    delimiter = defOptions.delimiter || false;
    groupSpace = defOptions.groupSpace || false;
  } else {
    table = options.table || defOptions.encodingTable || ASCII85_DEFAULT_ENCODING_TABLE;

    if (options.delimiter === undefined) {
      delimiter = defOptions.delimiter || false;
    } else {
      delimiter = !!options.delimiter;
    }

    if (options.groupSpace === undefined) {
      groupSpace = defOptions.groupSpace || false;
    } else {
      groupSpace = !!options.groupSpace;
    }
  }

  if (delimiter) {
    output.push(ASCII85_BLOCK_START);
  }
  
  // iterate over all data bytes.
  for (i = digits = cur = 0, len = buf.length; i < len; i++) {
    b = buf.readUInt8(i);
    
    cur *= 1 << 8;
    cur += b;
    digits++;
    
    if (digits % 4) {
      continue;
    }

    if (groupSpace && cur === ASCII85_GROUP_SPACE_CODE) {
      output.push(ASCII85_GROUP_SPACE);
    } else if (cur) {
      for (j = 4; j >= 0; j--) {
        r = cur % ASCII85_BASE;
        bytes[j] = r;
        cur = (cur - r) / ASCII85_BASE;
      }

      for (j = 0; j < 5; j++) {
        output.push(table[bytes[j]]);
      }
    } else {
      output.push(ASCII85_ZERO);
    }
    
    cur = 0;
    digits = 0;
  }
  
  // add padding for remaining bytes.
  if (digits) {
    if (cur) {
      padding = 4 - digits;

      for (i = 4 - digits; i > 0; i--) {
        cur *= 1 << 8;
      }

      for (j = 4; j >= 0; j--) {
        r = cur % ASCII85_BASE;
        bytes[j] = r;
        cur = (cur - r) / ASCII85_BASE;
      }

      for (j = 0; j < 5; j++) {
        output.push(table[bytes[j]]);
      }
      
      output = output.slice(0, output.length - padding);
    } else {
      // If remaining bytes are zero, need to insert '!' instead of 'z'.
      // This is a special case.
      for (i = 0; i < digits + 1; i++) {
        output.push(table[0]);
      }
    }
  }
  
  if (delimiter) {
    output.push('~>');
  }

  return output.join('');
};

/**
 * Decode a string to binary data.
 * @param {String|Buffer} data is a string or Buffer.
 * @param {Array|Object} [table] is a sparse array to map char code and decoded value for decoding.
 *                               Default is standard table.
 */
Ascii85.prototype.decode = function(str, table) {
  var output = '';
  var defOptions = this._options;
  var buf = str;
  var digits, cur, i, c, t, len, padding;

  table = table || defOptions.decodingTable || ASCII85_DEFAULT_DECODING_TABLE;

  // convert a key/value format char map to code array.
  if (!Array.isArray(table)) {
    table = table.table || table;

    if (!Array.isArray(table)) {
      t = [];
      Object.keys(table).forEach(function(v) {
        t[v.charCodeAt(0)] = table[v];
      });
    }
  }

  if (!(buf instanceof Buffer)) {
    buf = new Buffer(buf);
  }

  // if str starts with delimiter ('<~'), it must end with '~>'.
  if (buf.length >= 4 && buf.readInt16BE(0) === ASCII85_BLOCK_START_VALUE) {
    if (buf.readInt16BE(buf.length - 2) !== ASCII85_BLOCK_END_VALUE) {
      throw new Error('Invalid ascii85 string delimiter pair.');
    }

    buf = buf.slice(2, buf.length - 2);
  }
  
  for (i = digits = cur = 0, len = buf.length; i < len; i++) {    
    c = buf.readUInt8(i);

    if (c === ASCII85_ZERO_VALUE) {
      output += ASCII85_NULL_STRING;
      continue;
    }

    if (c === ASCII85_GROUP_SPACE_VALUE) {
      output += ASCII85_GROUP_SPACE_STRING;
      continue;
    }
    
    if (table[c] === undefined) {
      continue;
    }

    cur *= ASCII85_BASE;
    cur += table[c];
    digits++;
    
    if (digits % 5) {
      continue;
    }
    
    output += String.fromCharCode((cur >>> 24) & 0xFF);
    output += String.fromCharCode((cur >>> 16) & 0xFF);
    output += String.fromCharCode((cur >>> 8) & 0xFF);
    output += String.fromCharCode(cur & 0xFF);
    cur = 0;
    digits = 0;
  }
  
  if (digits) {
    padding = 5 - digits;
    
    for (i = 0; i < padding; i++) {
      cur *= ASCII85_BASE;
      cur += ASCII85_BASE - 1;
    }

    for (i = 3, len = padding - 1; i > len; i--) {
      output += String.fromCharCode((cur >>> (i * 8)) & 0xFF);
    }
  }
  
  return output;
};

/**
 * Ascii85 for ZeroMQ which uses a different codec table.
 */
defaultCodec.ZeroMQ = new Ascii85({
  table: [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '.', '-', ':', '+', '=', '^', '!', '/', '*', '?', '&', '<', '>', '(', ')', '[', ']', '{', '}', '@', '%', '$', '#'
  ]
});

/**
 * Ascii85 for PostScript which always uses delimiter for encoding.
 */
defaultCodec.PostScript = new Ascii85({
  delimiter: true
});

/**
 * Ascii85 codec constructor.
 */
defaultCodec.Ascii85 = Ascii85;
