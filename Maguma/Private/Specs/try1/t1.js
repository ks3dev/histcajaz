/// <reference path="../../../Public/JavaScript/External/jquery-1.7.1.js" />
    
describe("The first set of jasmine tests bundled with Cassette", function() {
    var core;

    beforeEach(function() {
        core = $("#core");
    });

    afterEach(function() {
        $("#temp-elements").empty();
    });

    it("should have created a new uploader", function() {
        
        expect(core).toBeDefined();
    });
});