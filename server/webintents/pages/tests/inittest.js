describe("Initialization tests", function() {
  beforeEach(function() {
  
  });

  it("startActivity should be on the navigator object", function() {
    expect(window.navigator.startActivity).toBeDefined();
  });

  it("should have a global Intent object", function() {
    expect(window.Intent).toBeDefined();
  });

});
