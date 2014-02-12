// js-hint globals
/*global define,window,document,PointBreak,assert,QUnit*/
(function () {
    "use strict";

    // test instance of pointbreak
    var pb;

    try {
        // try to force a reference error.
        if (PointBreak) {
            console.log("PointBreak loaded.");
        }
    } catch (e) {
        window.alert("PointBreak.js not found. Try running `grunt QUnit.test`");
    }

    QUnit.module("Dependencies");

    QUnit.test("require PointBreak.js", function (assert) {
        assert.ok (PointBreak, "PointBreak.js is loaded.");
    });

    QUnit.module ("Registering breakpoints on a still page", {
        setup: function () {
            pb = new PointBreak();
        },
        teardown: function () {
            pb = null;
        }
    });

    QUnit.test ("methods for setting and getting breakpoints", function (assert) {
        assert.equal (pb.getWidth(), window.innerWidth, "getWidth gets the current width of the window.");
        pb.registerBreakpoint("test", pb.getWidth());

        assert.ok (pb.hasBreakpoint("test"), "After registering, 'test' is a registered breakpoint.");
        assert.ok (!pb.hasBreakpoint("bogus"), "'bogus' wasn't ever registered.");

        assert.ok (pb.isCurrentBreakpoint("test"), "'test' is the current breakpoint (since it's based on getWidth())");
        assert.ok (pb.isCurrentBreakpoint("a", "b", "c", "test"), "isCurrentBreakpoint() takes multiple params and is true if any match");
        assert.ok (!pb.isCurrentBreakpoint("a", "b", "c"), "isCurrentBreakpoint() fails if none match");

        assert.equal ( pb.getBreakpoints().test, pb.getWidth(), "The value set is the max for the breakpoint.");
        assert.equal ( pb.getCurrentBreakpoint(), "test", "current breakpoint maps to the name of the current breakpoint.");
        assert.equal ( pb.getBreakpointForSize(pb.getWidth()), "test", "getBreakpointForSize() returns the name of the breakpoint at the given size.");
        assert.equal ( pb.getSizeOfBreakpoint("test"), pb.getWidth(), "getSizeOfBreakpoint() returns the max size of the breakpoint or 0.");
        assert.equal ( pb.getSizeOfBreakpoint("bogus"), 0, "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");
        pb.unregisterBreakpoint("test");
        assert.equal (pb.getCurrentBreakpoint(), PointBreak.MAX_BREAKPOINT, "unregisterBreakpoint removes breakpoints. MAX_BREAKPOINT is the only default breakpoint.");
    });


    QUnit.module ("Responding to window resizing");

    QUnit.asyncTest ("Resizing", function (assert) {
        var w = window.open();
        w.resizeTo(500,500);

        var pb = new PointBreak(null, w);
        pb.registerBreakpoint("small", 300);
        pb.registerBreakpoint({"med": 600, "large": 900});

        QUnit.expect(9);

        assert.equal(pb.getWindow(), w, "getWindow() returns the window object");

        setTimeout(onWindowLoad, 1000);
        setTimeout(function () {
            w.close();
            QUnit.start();
        }, 2000);

        function onWindowLoad () {
            console.log(pb.getCurrentBreakpoint());
            console.log(pb.getWidth());
            assert.equal (pb.getCurrentBreakpoint(), "med", "A custom window can be the target of pointbreak.js " + pb.getWidth());

            pb.addChangeListener(onWindowChange);
            pb.addLargeListener(onLargeBreakpoint);

            w.resizeTo(800, 500);
        }

        function onWindowChange (event) {
            assert.ok (1, "Change listener is fired on width change.");
            assert.equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
            assert.equal (event.newBreakpoint, "large", "and the new breakpoint");
            pb.removeChangeListener(onWindowChange);
        }

        function onLargeBreakpoint (event) {
            assert.ok (1, "onLargeBreakpoint: Large listener is fired on width change.");
            assert.equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
            assert.equal (event.newBreakpoint, "large", "and the new breakpoint");
            assert.equal (pb.getCurrentBreakpoint(), "large", "There's a reference to the window object stored in pointbreak.js");
        }
    });

    QUnit.test ("Default breakpoints", function (assert) {
        PointBreak.defaultBreakpoints = {"xxx":123};
        var pb = new PointBreak();
        assert.equal(pb.getBreakpointForSize(100), "xxx", "Defining default breakpoints makes the breakpoints automatically get added.");
    });
}());