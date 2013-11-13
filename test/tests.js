try {
  // try to force an error.
  if (PointBreak.prototype);
} catch (e) {
  alert("PointBreak.js not found. Try running `grunt test`");
}

module("Dependencies");

var pb;

test("require PointBreak.js", function() {
  ok (PointBreak, "PointBreak.js is loaded.");
});

module ("Methods", {
	setup: function () {
		pb = new PointBreak();
	},
	teardown: function () {
		pb = null;
	}
});

test ("Methods", function () {
	equal (pb.getWidth(), window.innerWidth, "getWidth gets the current width of the window.");
	pb.registerBreakpoint(pb.getWidth(), "test");
	ok (pb.isBreakpoint("test"), "After registering the breakpoint, 'test' is a breakpoint");
	equal (pb.getBreakpoints().test, pb.getWidth(), "You always have at least one breakpoint, MAX_BREAKPOINT");
	equal( pb.getCurrentBreakpoint(), "test", "current breakpoint maps to the name of the current breakpoint.");
	equal( pb.getBreakpointForSize(pb.getWidth()), "test", "getBreakpointForSize() returns the name of the breakpoint at the given size.");
	equal( pb.getSizeOfBreakpoint("test"), pb.getWidth(), "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");
	equal( pb.getSizeOfBreakpoint("bogus"), 0, "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");
	pb.unregisterBreakpoint("test");
	equal (pb.getCurrentBreakpoint(), PointBreak.MAX_BREAKPOINT, "unregisterBreakpoint removes breakpoints. MAX_BREAKPOINT is the only default breakpoint.");
});