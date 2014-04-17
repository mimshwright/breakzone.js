// js-hint globals
/*global define,window,document,BreakZone,assert,QUnit*/
(function () {
    "use strict";

    // test instance of breakzone
    var bz;

    try {
        // try to force a reference error.
        if (BreakZone) {
            console.log("BreakZone loaded.");
        }
    } catch (e) {
        window.alert("BreakZone.js not found. Try running `grunt QUnit.test`");
    }

    QUnit.module("Dependencies");

    QUnit.test("require BreakZone.js", function (assert) {
        assert.ok (BreakZone, "BreakZone.js is loaded.");
    });

    QUnit.module ("Registering breakpoints on a still page", {
        setup: function () {
            bz = new BreakZone();
        },
        teardown: function () {
            bz = null;
        }
    });

    QUnit.test ("methods for setting and getting breakpoints", function (assert) {
        assert.equal (bz.getWidth(), window.innerWidth, "getWidth gets the current width of the window.");
        assert.equal (bz.getCurrentBreakpoint(), BreakZone.MAX_BREAKPOINT, "Before any other breakpoints are registered, the max breakpoint is the only one.");

        bz.registerBreakpoint("test", bz.getWidth());

        assert.equal (bz.getBreakpoints().test, bz.getWidth(), "Get a list of all breakpoints with getBreakpoints()");
        assert.ok    (bz.getSizes() instanceof Array, "Return an array of breakpoint sizes");
        assert.equal (bz.getSizes()[0], bz.getWidth(), "Return an array of breakpoint sizes");

        assert.ok    (bz.hasBreakpoint("test"), "After registering, 'test' is a registered breakpoint.");
        assert.ok    (!bz.hasBreakpoint("bogus"), "'bogus' wasn't ever registered.");

        assert.ok    (bz.isCurrentBreakpoint("test"), "'test' is the current breakpoint (since it's based on getWidth())");
        assert.ok    (bz.isCurrentBreakpoint("a", "b", "c", "test"), "isCurrentBreakpoint() takes multiple params and is true if any match");
        assert.ok    (!bz.isCurrentBreakpoint("a", "b", "c"), "isCurrentBreakpoint() fails if none match");

        assert.equal (bz.getBreakpoints().test, bz.getWidth(), "The value set is the max for the breakpoint.");
        assert.equal (bz.getCurrentBreakpoint(), "test", "current breakpoint maps to the name of the current breakpoint.");
        assert.equal (bz.getBreakpointForSize(bz.getWidth()), "test", "getBreakpointForSize() returns the name of the breakpoint at the given size.");
        assert.equal (bz.getBreakpointForSize(NaN), null, "getBreakpointForSize() returns null if the size is bogus");
        assert.equal (bz.getBreakpointForSize(-100), null, "getBreakpointForSize() returns null if the size is negative");
        assert.equal (bz.getSizeOfBreakpoint("test"), bz.getWidth(), "getSizeOfBreakpoint() returns the max size of the breakpoint or 0.");
        assert.equal (bz.getSizeOfBreakpoint("bogus"), 0, "getSizeOfBreakpoint() returns the size of the breakpoint or 0.");

        bz.unregisterBreakpoint("test");
        assert.equal (bz.getCurrentBreakpoint(), BreakZone.MAX_BREAKPOINT, "unregisterBreakpoint removes breakpoints. MAX_BREAKPOINT is the only default breakpoint.");
    });


    QUnit.module ("Responding to window resizing");

    QUnit.asyncTest ("Resizing", function (assert) {
        QUnit.expect(12);

        var w = window.open("", "resizing");
        if (!w) { throw new Error ("For some reason, couldn't open window. Try disabling your pop-up blocker.");}
        w.document.write("Resizing Test");
        w.resizeTo(500,500);

        var bz = new BreakZone(null, w);
        assert.equal(bz.getWindow(), w, "getWindow() returns the window object");

        bz.registerBreakpoint("small", 300);
        bz.registerBreakpoint({"med": 600, "large": 900});

        setTimeout(onWindowLoad, 1000);
        setTimeout(function () {
            w.close();
            QUnit.start();
        }, 2000);

        function onWindowLoad () {
            console.log(bz.getCurrentBreakpoint());
            console.log(bz.getWidth());
            assert.equal (bz.getCurrentBreakpoint(), "med", "A custom window can be the target of breakzone.js " + bz.getWidth());

            bz.addChangeListener(onWindowChange);
            bz.addLargeListener(onLargeBreakpoint);
            bz.addMaxListener(onMaxBreakpoint);

            // Use the callback to fire a function.
            bz.onLarge = function (oldBreakpoint, newBreakpoint) {
                assert.equal(newBreakpoint, "large", "Using an `onXyz()` callback is another way to respond to changes.");
            };

            bz.onmax = function (oldBreakpoint, newBreakpoint) {
                assert.equal(newBreakpoint, "max", "Using an `onxyz()` (all lowercase) callback is another way to respond to changes.");
            };

            w.resizeTo(800, 500);
        }

        function onWindowChange (event) {
            assert.ok (1, "Change listener is fired on width change.");
            assert.equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
            assert.equal (event.newBreakpoint, "large", "and the new breakpoint");
            bz.removeChangeListener(onWindowChange);
            w.resizeTo(1200, 500);
        }

        function onLargeBreakpoint (event) {
            assert.ok (1, "onLargeBreakpoint: Large listener is fired on width change.");
            assert.equal (event.oldBreakpoint, "med", "Change listener is provided the old breakpoint");
            assert.equal (event.newBreakpoint, "large", "and the new breakpoint");
            assert.equal (bz.getCurrentBreakpoint(), "large", "There's a reference to the window object stored in breakzone.js");
        }

        function onMaxBreakpoint (event) {
            assert.ok(1, "Triggered max breakpoint");
        }
    });

    QUnit.asyncTest ("Orientation", function (assert) {
        var w = window.open("", "orientation");
        w.document.write("Orientation Test");
        var bz = new BreakZone(null, w);

        QUnit.expect(3);

        setTimeout(onWindowLoad, 1000);
        setTimeout(function () {
            w.close();
            QUnit.start();
        }, 2000);

        function onWindowLoad() {
            w.addEventListener("resize", onResizePortrait);
            w.resizeTo(480,640);

            function onResizePortrait () {
                w.removeEventListener("resize", onResizePortrait);
                w.addEventListener("resize", onResizeLandscape);

                assert.equal(bz.getCurrentOrientation(), BreakZone.PORTRAIT, "Portrait orientation ok");
                w.resizeTo(640, 480);
            }

            function onResizeLandscape () {
                w.removeEventListener("resize", onResizeLandscape);
                w.addEventListener("resize", onResizeSquare);

                assert.equal(bz.getCurrentOrientation(), BreakZone.LANDSCAPE, "Landscape orientation ok");
                w.resizeTo(500, 500);
            }

            function onResizeSquare () {
                w.removeEventListener("resize", onResizeSquare);

                assert.equal(bz.getCurrentOrientation(), BreakZone.LANDSCAPE, "Use landscape for square windows");
            }
        }

    });

    QUnit.test ("Default breakpoints", function (assert) {
        BreakZone.defaultBreakpoints = {"xxx":123};
        var bz = new BreakZone();
        assert.equal(bz.getBreakpointForSize(100), "xxx", "Defining default breakpoints makes the breakpoints automatically get added.");
    });


    QUnit.test ("Events", function (assert) {
        QUnit.expect(4);
        var bz = new BreakZone();
        assert.equal(bz.removeEventListener("BOGUS", null), null, "removeEventListener fails silently.");
        assert.throws(function () { bz.addEventListener("BOGUS", null); }, "you must define a function when you add and event listener");
        assert.throws(function () { bz.addEventListener("BOGUS", "not a function"); }, "you must define a function when you add and event listener");
        bz.addEventListener("test", onTest);
        bz.dispatchEvent({type:"test"});
        bz.removeEventListener("test", onTest);

        // note: This should not cause an assertion to be called.
        // If it does, the test should be red because of the QUnit.expect()
        // call at the top of the test.
        bz.dispatchEvent({type:"test"});

        function onTest () { assert.ok(true, "Handler was called"); }
    });

    QUnit.asyncTest ("Prevent multiple dispatches", function (assert) {
        QUnit.expect(4);

        var w = window.open("","multipleDisptaches","width=800,height=800");
        w.document.write("Multiple Dispatches Test");
        var changeCount1 = 0,
            changeCount2 = 0,
            medCount = 0,
            changeCount3 = 0;
        var sizes = {"small":300, "med":500, "large": 800};
        var bz1 = new BreakZone(sizes, w);
        var bz2 = new BreakZone(sizes, w);
        var bz3 = new BreakZone(null, w);

        bz1.addChangeListener(onChange1);
        bz2.addChangeListener(onChange2);
        bz1.addMedListener(onMed);
        bz3.addChangeListener(onChange3);



        setTimeout(onWindowLoad, 1000);

        function onWindowLoad() {
            w.resizeTo(400,400);

            setTimeout(function () {
                w.close();
                assert.equal(changeCount1, 2, "change events should only be dispatched from the object that was used to add the handler. Once for change and once on load.");
                assert.equal(changeCount2, 2, "change events should only be dispatched from the object that was used to add the handler. Once for change and once on load.");
                assert.equal(changeCount3, 1, "listener for bz3 should only be fired on load since it has only one breakpoint and that should never change.");
                assert.equal(medCount, 1, "specific size event should only be dispatched from the object that was used to add the handler.");
                QUnit.start();
            }, 1000);

        }

        function onChange1() {
            changeCount1++;
        }
        function onChange2() {
            changeCount2++;
        }
        function onChange3() {
            changeCount3++;
        }
        function onMed() {
            medCount ++;
        }
    });
}());