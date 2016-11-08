# Ascii85 (Base85) Encoding/Decoding #

[![Build Status](https://travis-ci.org/huandu/node-ascii85.svg?branch=master)](https://travis-ci.org/huandu/node-ascii85)

[Ascii85](http://en.wikipedia.org/wiki/Ascii85), also called Base85, is a form of binary-to-text encoding. By using five ASCII characters to represent four bytes of binary data, it is more efficient than uuencode or Base64, which use four characters to represent three bytes of data. See [ascii85 wikipedia page](http://en.wikipedia.org/wiki/Ascii85) for more details.

This node module provides straight forward APIs to encode/decode data in ascii85 encoding. Both `string` and `Buffer` are accepted by `encode()` and `decode()` functions. The return value of both functions is a `Buffer` for better performance.

## Install ##

Install `ascii85` through `npm`.

	npm install --save ascii85

## Usage ##

```javascript
var ascii85 = require('ascii85');
var buf = ascii85.encode('easy');

buf.toString() === 'ARTY*';                // true
ascii85.decode(buf).toString() === 'easy'; // true
```

## API ##

`encode(data, [options])`

Encode a string or `Buffer`.

* `data` is a string or a `Buffer`.
* `options` is optional. If it's provided, it can be an array of character or an option object.
* Return a `Buffer` with encoded data.

Here is a sample.

```javascript
var ascii85 = require('ascii85');
var buf;

// Most common use.
buf = ascii85.encode('easy');

// Provide an array of characters to encode the string.
// The array must have 85 elements. It's useful to work
// with a customized ascii85 encoding, e.g. ZeroMQ flavor.
buf = ascii85.encode('easy', ['0', '1', '2', ...]);

buf = ascii85.encode('easy', {
	table: [...],     // an array of characters to encode the string
	delimiter: false, // result will be surrounded by '<~' and '~>'
	groupSpace: false // group spaces by 'u'
});
```

`decode(str, [table])`

Decode a ascii85-encoded string or `Buffer`.

* `str` is a string or a `Buffer`. All invalid characters will be discarded. If `str` starts with `<~`, it must have `~>` at the end. Otherwise, an error will be thrown.
* `table` is a sparse array to map char code to decoded value for decoding.
* Return a `Buffer` with decoded data.
* Invalid characters are ignored silently.

Here is a sample.

```javascript
var ascii85 = require('ascii85');
var data;

// Most common use.
data = ascii85.decode('ARTY*');

// Spaces can be omitted automatically.
data = ascii85.decode('A  R  T  Y  *');

// '<~' and '~>' can be trimmed properly.
data = ascii85.decode('<~ARTY*~>');

// Provide a sparse array to map char code to decode value.
ascii85.decode('ARTY*', [...]);
```

`Ascii85(options)`

Construct a new codec object. It can store customized options for every `encode`/`decode`.

```javascript
var Ascii85 = require('ascii85').Ascii85;

// PostScript always uses delimiter.
var PostScript = new Ascii85({
	delimiter: true
});

PostScript.encode('easy').toString() === '<~ARTY*~>'; // true
```

`ZeroMQ`

A specialized codec for ZeroMQ which uses different charset.

```javascript
var ZeroMQ = require('ascii85').ZeroMQ;
ZeroMQ.encode('easy').toString() === 'wNPU9'; // true
```

`PostScript`

A specialized codec for PostScript which always uses delimiter.

```javascript
var PostScript = require('ascii85').PostScript;
PostScript.encode('easy').toString() === '<~ARTY*~>'; // true
```

## License ##

This module is licensed under the MIT license that can be found in the LICENSE file.
