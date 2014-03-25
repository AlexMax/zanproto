// dmaster: A web-based Doom server browser and REST API.
// Copyright (C) 2013  Alex Mayfield
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var assert = require('assert');
var fs = require('fs');

var huffman = require('../huffman.js');
var proto = require('../proto.js');

describe('Huffman', function() {
	describe('new Huffman()', function() {
		it('should accept a frequency table as an argument.', function() {
			new huffman.Huffman(proto.huffmanFreqs);
		});
		it('should throw an exception if you forget `new`.', function() {
			assert.throws(function() {
				new huffman.Huffman();
			}, Error);
		});
		it('should throw an exception if you pass nothing.', function() {
			assert.throws(function() {
				new huffman.Huffman();
			}, Error);
		});
		it('should throw an exception if you pass a non-Array argument.', function() {
			assert.throws(function() {
				new huffman.Huffman('foobar');
			}, Error);
		});
		it('should throw an exception if you pass an incomplete frequency Array.', function() {
			assert.throws(function() {
				new huffman.Huffman([0.5, 0.5]);
			}, Error);
		});
	});
	describe('Huffman.encode()', function() {
		var h = new huffman.Huffman(proto.huffmanFreqs);

		it('should huffman-encode a buffer if it saves space.', function() {
			var encoded = h.encode(new Buffer([0x00, 0x73, 0x03, 0x05]));
			var test = new Buffer([0x02, 0x1a, 0x4b, 0x28]);
			assert.equal(test.toString('hex'), encoded.toString('hex'));
		});
		it('should pad the original buffer with 0xff if there is no space saved.', function() {
			var encoded = h.encode(new Buffer([0x30, 0x40, 0x50]));
			var test = new Buffer([0xff, 0x30, 0x40, 0x50]);
			assert.equal(test.toString('hex'), encoded.toString('hex'));
		});
	});
	describe('Huffman.decode()', function() {
		var h = new huffman.Huffman(proto.huffmanFreqs);

		it('should decode the Zandronum master challenge.', function() {
			var decoded = h.decode(new Buffer([0x06, 0x68, 0x12, 0xf1, 0x52, 0x27, 0x01]));
			var test = Buffer.concat([proto.LAUNCHER_MASTER_CHALLENGE, proto.MASTER_SERVER_VERSION]);
			assert.equal('7c5d56000200', decoded.toString('hex'));
		});

		// Taken from a random Best Ever server running zomb-8 that was causing the
		// decoder to crash.  This packet is problematic for two reasons:
		//
		// 1. It can mess up huffman trees that don't properly account for the
		//    difference in precision between a float and double when building the
		//    huffman tree.
		// 2. It is not padded with 0's for some reason.
		//
		// Becuase of problem #2, you cannot use this packet to test encoding.
		it('should decode a problematic server query packet from a zomb-8 server.', function() {
			var encoded = new Buffer(fs.readFileSync(__dirname + '/packets/be_zomb8_encoded.bin'));
			var decoded = new Buffer(fs.readFileSync(__dirname + '/packets/be_zomb8_decoded.bin'));
			var test = h.decode(encoded);
			assert.equal(test.toString('hex'), decoded.toString('hex'));
		});
	});
});
