try {
  // try to force an error.
  if (pointbreak.prototype);
} catch (e) {
  alert("pointbreak.js not found. Try running `grunt test`");
}

module("Dependencies");

test("require pointbreak.js", function() {
  ok (pointbreak, "pointbreak.js is loaded.");
});