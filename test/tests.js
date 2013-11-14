try {
  // try to force an error.
  if (PointBreak.prototype);
} catch (e) {
  alert("PointBreak.js not found. Try running `grunt test`");
}

module("Dependencies");

var pb, w;

test("require PointBreak.js", function() {
  ok (PointBreak, "PointBreak.js is loaded.");
});

module ("Registering breakpoints on a still page", {
	setup: function () {
		pb = new PointBreak();
	},
	teardown: function () {
		pb = null;
	}
});

test ("methods for seeting and getting breakpoints", function () {
	equal (pb.getWidth(), window.innerWidth, "getWidth gets the current width of the window.");
	pb.registerBreakpoint("test", pb.getWidth());
	ok (pb.isBreakpoint("test"), "After registering the breakpoint, 'test' is the current breakpoint");
	equal ( pb.getBreakpoints().test, pb.getWidth(), "The value set is the max for the breakpoint.");
	equal ( pb.getCurrentBreakpoint(), "test", "current breakpoint maps to the name of the current breakpoint.");
	equal( pb.getBreakpointForSize(pb.getWidth()), "test", "getBreakpointForSize() returns the name of the breakpoint at the given size.");
	equal( pb.getSizeOfBreakpoint("test"), pb.getWidth(), "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");
	equal( pb.getSizeOfBreakpoint("bogus"), 0, "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");
	pb.unregisterBreakpoint("test");
	equal (pb.getCurrentBreakpoint(), PointBreak.MAX_BREAKPOINT, "unregisterBreakpoint removes breakpoints. MAX_BREAKPOINT is the only default breakpoint.");
});


module ("Responding to window resizing");

asyncTest ("Resizing", function () {
	var w = window.open();
	w.resizeTo(500,500);

	var pb = new PointBreak(null, w);
	pb.registerBreakpoint("small", 300);
	pb.registerBreakpoint({"med": 600, "large": 900});

	expect(9);

	equal(pb.getWindow(), w, "getWindow() returns the window object");

	setTimeout(onWindowLoad, 1000);
	setTimeout(function () {
		w.close();
		start();
	}, 2000);

	function onWindowLoad () {
		console.log(pb.getCurrentBreakpoint());
		console.log(pb.getWidth());
		equal (pb.getCurrentBreakpoint(), "med", "A custom window can be the target of pointbreak.js " + pb.getWidth());

		pb.addChangeListener(onWindowChange);
		pb.addLargeListener(onLargeBreakpoint);

		w.resizeTo(800, 500);
	}

	function onWindowChange (event) {
		ok (1, "Change listener is fired on width change.");
		equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
		equal (event.newBreakpoint, "large", "and the new breakpoint");
		pb.removeChangeListener(onWindowChange);
	}

	function onLargeBreakpoint (event) {
		ok (1, "onLargeBreakpoint: Large listener is fired on width change.");
		equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
		equal (event.newBreakpoint, "large", "and the new breakpoint");
		equal (pb.getCurrentBreakpoint(), "large", "There's a reference to the window object stored in pointbreak.js");
	}
});
