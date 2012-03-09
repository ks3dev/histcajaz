
describe("The first set of jasmine tests bundled with Cassette", function() {
    var core;

    beforeEach(function() {
        core = $("#core");
    });

    afterEach(function() {
        $("#temp-elements").empty();

        $("#on-going-uploads").remove();
        
    });

    it("should have created a new uploader", function() {
        
        expect(core).toBeDefined();
    });
});