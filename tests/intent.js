describe("Intent tests", function() {

  it("Should be unitialized when instansiated", function() {
    var intent = new Intent();
    expect(intent.action).not.toBeDefined();
    expect(intent.type).not.toBeDefined();
    expect(intent.data).not.toBeDefined();
  });

  it("Should contain an action when instansiated", function() {
    var intent = new Intent("test");
    expect(intent.action).toBe("test");
  });

  it("Should contain an data type when instansiated", function() {
    var intent = new Intent("test", "test-filter");
    expect(intent.type).toBe("test-filter");
  });

  it("Should contain an data type when instansiated", function() {
    var intent = new Intent("test", "test-filter", {test: "hello"});
    expect(intent.data).toBeDefined();
    expect(intent.data).toBeDefined();
    expect(intent.data.test).toBeDefined();
    expect(intent.data.test).toBe("hello");
  });

  it("Should contain an action when set", function() {
    var intent = new Intent();
    intent.action = "test";
    expect(intent.action).toBe("test");
  });
  
  it("Should contain a type when set", function() {
    var intent = new Intent();
    intent.type = "test";
    expect(intent.type).toBe("test");
  });
  
  it("Should containn data when set", function() {
    var intent = new Intent();
    intent.data = "test";
    expect(intent.data).toBe("test");
  });

});
