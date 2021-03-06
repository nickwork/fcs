/**
 * @author Morgan Conrad
 * Copyright(c) 2013
 * This software is released under the MIT license  (http://opensource.org/licenses/MIT)
 */

var fs = require('fs');
var FCS = require('../fcs');
var assert = require('assert');
var mocha = require('mocha');

var EMPTY = JSON.stringify({});

describe('test FCS', function() {

    describe('after new FCS()', function() {
        var fcs = new FCS();
        it('should have two defaults', function() {
            assert.equal(JSON.stringify(fcs.meta), JSON.stringify({
                dataFormat: FCS.DEFAULT_VALUES.dataFormat,
                groupBy:    FCS.DEFAULT_VALUES.groupBy
            }) );
        });
        it('should have empty header and text', function() {
            assert.equal(JSON.stringify(fcs.header), EMPTY);
            assert.equal(JSON.stringify(fcs.text), EMPTY);
            assert.equal(JSON.stringify(fcs.analysis), EMPTY);
        });
        it('should have null data and analysis', function() {
            assert(!fcs.dataAsNumbers);
            assert(!fcs.dataAsStrings);
        });
    });

    describe('after new FCS().options()', function() {
        var fcs = new FCS();
        fcs.options( {foo:'bar', dataFormat:'asNone'})
        it('should have new values defaults', function() {
            assert.equal(JSON.stringify(fcs.meta), JSON.stringify({
                dataFormat: 'asNone',
                groupBy:    FCS.DEFAULT_VALUES.groupBy,
                foo: 'bar'
            }) );
        });
        it('should still have empty header and text', function() {
            assert.equal(JSON.stringify(fcs.header), EMPTY);
            assert.equal(JSON.stringify(fcs.text), EMPTY);
            assert.equal(JSON.stringify(fcs.analysis), EMPTY)
        });
        it('should still have null data and analysis', function() {
            assert(!fcs.dataAsNumbers);
            assert(!fcs.dataAsStrings);
        });
    });

    describe('after reading an FCS file synchronously ', function() {
        it('should have text and data', function(done) {
            fs.readFile('./test/testdata/AriaFile1.fcs', function(err, databuf) {
                assert(!err);
                var fcs = new FCS(null, databuf);
                assertAriaTextAndData(fcs, false);
                done();
            });
        });
    });


    describe('after read async', function() {
        var stream;
        it('should have text and data', function(done) {
            stream = fs.createReadStream('./test/testdata/AriaFile1.fcs');
            var fcs = new FCS( { eventsToRead : 4000, groupBy: "byParam" });  // 4000 forces multiple reads 
            fcs.readStreamAsync(stream, null, function(err, fcs) {
                assert(!err);
                assertAriaTextAndData(fcs, true);
                done();
            });
        });
        
    });
});


function assertAriaTextAndData(fcs, byParam) {
    assert.equal('FCS3.0', fcs.header.FCSVersion);
    assert.equal('4,3,2,1', fcs.getText('$BYTEORD'));
    assert(fcs.getAnalysis());
    assert(!fcs.getAnalysis('foo'));
    if (!byParam)
        assert.equal('[33471.21,33250.00', fcs.getStringData(1).substring(0, 18)); 
    
    var p1nViaGetOnly = fcs.getOnly('text.$P1N');
    var p1NViaPnX = fcs.get$PnX('N');
    assert.equal(p1nViaGetOnly.text['$P1N'], p1NViaPnX[1]);
    
    // not a great test, but look for 1st line of data
    var json = fcs.toJSON();
    if (byParam) {
        assert.equal(3984, json.indexOf('[[33471.21,33892.11,30264.09'));
    }
    else {
       assert.equal(3960, json.indexOf('[[33471.21,33250.00,1708.00')); 
    }
}





