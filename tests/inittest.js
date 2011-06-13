describe("Initialization tests", function() {
  beforeEach(function() {
  
  });

  it("should be on the navigator object", function() {
    expect(window.navigator.intents).toBeDefined();
  });

  it("should have a global Intent object", function() {
    expect(window.Intent).toBeDefined();
  });

});
