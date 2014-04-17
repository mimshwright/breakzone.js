/*global BreakZone,document*/

// A demonstration using BreakZone to see the breakpoints.
window.onload = function () {
    "use strict";

    /** @type {BreakZone} */
    var bz = new BreakZone(
        // Pass in an object containing the breakpoints to register.
        {
            "tiny": 360,
            "small": 480,
            "medium": 960,
            "large": 1200
        }
    );

    /*
        // Alternatively, you can add breakpoints using registerBreakpoint()
        // either one at a time...
        bz.registerBreakpoint("myBreakpoint", 1234);

        // or as a list
        bz.registerBreakpoint({
            "foo": 400,
            "bar": 600,
            "baz": 800
        });
     */

    // Add a change listener.
    // This function gets called whenever the current breakpoint changes.
    bz.addChangeListener(onBreakpointChanged);

    // print all registered breakpoints to a div.
    renderAllBreakpointInfo("all-breakpoints");
    // print the current breakpoint to a div.
    renderCurrentBreakpointInfo("current");
    renderCurrentSizeInfo("size");

    window.addEventListener("resize", function() {
        renderCurrentSizeInfo("size");
    });


    /**
     * This event handler is called whenever the current breakpoint changes.
     *
     * @param {BreakpointChangeEvent} event An event object containing information about the breakpoint change.
     */
    function onBreakpointChanged(event) {
        "use strict";
        console.log("Old breakpoint is " + event.oldBreakpoint);
        console.log("New breakpoint is " + event.newBreakpoint);

        renderCurrentBreakpointInfo("current");
    }

    /**
     * Write out information about the current breakpoint to the DOM.
     *
     * @param {string} id ID of the DOM element to write to.
     */
    function renderCurrentBreakpointInfo (id) {
        var output = document.getElementById(id);
        output.innerHTML = "Current breakpoint : " + bz.getCurrentBreakpoint();
    }


    /**
     * Write out the name of every breakpoint and its size to the DOM.
     *
     * @param {string} id ID of the DOM element to write to.
     */
    function renderAllBreakpointInfo(id) {
        var breakpointInfo = "<h2>All breakpoints:</h2>",
            output = document.getElementById(id),
            breakpoint,
            breakpoints = bz.getBreakpoints();

        breakpointInfo += "<ul>";
        // loop through every breakpoint by name.
        for (breakpoint in breakpoints) {
            if (breakpoints.hasOwnProperty(breakpoint)) {
                breakpointInfo += "<li>" + breakpoint + " : " + breakpoints[breakpoint] + "</li>";
            }
        }
        breakpointInfo += "</ul>";

        output.innerHTML = breakpointInfo;
    }

    /**
     * Write out the current width in pixels to the DOM.
     *
     * @param {string} id ID of the DOM element to write to.
     */
    function renderCurrentSizeInfo(id) {
        var output = document.getElementById(id);
        output.innerHTML = "Current size : " + bz.getWidth();
    }

}
