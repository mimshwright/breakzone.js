// js-hint globals
/*global define,window,document*/
/*exported PointBreak*/

var PointBreak = (function() {
    "use strict";

    /**
     * Sets up a system for dispatching events when breakpoints change.
     * @class PointBreak
     * @constructor
     */
    PointBreak = function(breakpoints, targetWindow) {
        var that = this,
            name;

        if (targetWindow !== undefined) {
            this.window = targetWindow;
        } else {
            this.window = window;
        }


        this.breakpoints = {};


        // Register default breakpoints.
        if (PointBreak.defaultBreakpoints !== null) {
            for (name in PointBreak.defaultBreakpoints) {
                if (PointBreak.defaultBreakpoints.hasOwnProperty(name)) {
                    this.registerBreakpoint(name, PointBreak.defaultBreakpoints[name]);
                }
            }
        }

        if (breakpoints !== undefined && breakpoints !== null) {
            this.registerBreakpoint(breakpoints);
        }

        this.getWindow().addEventListener("resize", function(e) {
            that.onResize(e);
        });
        document.addEventListener("load", function(e) {
            that.onResize(e);
        });
    };

    /** Shortcut for listening to the BREAKPOINT_CHANGE_EVENT on the window */
    PointBreak.prototype.addChangeListener = function(handler) {
        this.getWindow().addEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /** Shortcut for un-listening to the BREAKPOINT_CHANGE_EVENT on the window */
    PointBreak.prototype.removeChangeListener = function(handler) {
        this.getWindow().removeEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /** Returns the current width of the screen */
    PointBreak.prototype.getWidth = function() {
        return this.getWindow().innerWidth;
    };

    PointBreak.prototype.getWindow = function() {
        return this.window;
    };

    /**
     * Called when the window resizes.
     */
    PointBreak.prototype.onResize = function() {
        var newWidth = this.getWidth(),
            currentBreakpoint = this.getBreakpointForSize(newWidth),
            breakpointChangeEvent,
            specificBreakpointEvent;

        if (this.lastBreakpoint !== currentBreakpoint) {
            // Dispatch a generic event for this breakpoint change.
            breakpointChangeEvent = document.createEvent("Event");
            breakpointChangeEvent.initEvent(PointBreak.BREAKPOINT_CHANGE_EVENT, true, true);
            breakpointChangeEvent.oldBreakpoint = this.lastBreakpoint;
            breakpointChangeEvent.newBreakpoint = currentBreakpoint;
            breakpointChangeEvent.width = newWidth;
            this.getWindow().dispatchEvent(breakpointChangeEvent);

            // Dispatch a special event type for this breakpoint name
            // e.g. "smallBreakpoint"
            specificBreakpointEvent = document.createEvent("Event");
            specificBreakpointEvent.initEvent(currentBreakpoint + "Breakpoint", true, true);
            specificBreakpointEvent.oldBreakpoint = this.lastBreakpoint;
            specificBreakpointEvent.newBreakpoint = currentBreakpoint;
            specificBreakpointEvent.width = newWidth;
            this.getWindow().dispatchEvent(specificBreakpointEvent);
            this.lastBreakpoint = currentBreakpoint;
        }
    };

    /**
     * Returns the array of breakpoints.
     */
    PointBreak.prototype.getBreakpoints = function() {
        return this.breakpoints;
    };

    /**
     * Returns the name for the width.
     */
    PointBreak.prototype.getBreakpointForSize = function(width) {
        var lowestBreakpointValue = Infinity,
            lowestBreakpointName = PointBreak.MAX_BREAKPOINT,
            breakpointName,
            breakpoint;

        for (breakpointName in this.breakpoints) {
            if (this.breakpoints.hasOwnProperty(breakpointName)) {
                breakpoint = this.breakpoints[breakpointName];
                if (width <= breakpoint && breakpoint <= lowestBreakpointValue) {
                    lowestBreakpointValue = breakpoint;
                    lowestBreakpointName = breakpointName;
                }
            }
        }
        return lowestBreakpointName;
    };

    PointBreak.prototype.getSizeOfBreakpoint = function(name) {
        if (this.isBreakpoint(name)) {
            return this.breakpoints[name];
        }
        return 0;
    };

    /**
     * Returns the name for the current breakpoint.
     */
    PointBreak.prototype.getCurrentBreakpoint = function() {
        return this.getBreakpointForSize(this.getWidth());
    };

    /**
     * Add a breakpoint with `name` at the specified `width`.
     */
    PointBreak.prototype.registerBreakpoint = function(object_or_name, width) {
        var obj, name;
        if (typeof object_or_name === "string" && !isNaN(width)) {
            name = object_or_name;
            obj = {};
            obj[name] = width;
        } else {
            obj = object_or_name;
        }

        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                this.registerSingleBreakpoint(name, obj[name]);
            }
        }
    };
    PointBreak.prototype.registerSingleBreakpoint = function(name, width) {
        this.breakpoints[name] = width;

        // Add a new version of "on" for this breakpoint.
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] = function(handler) {
            this.getWindow().addEventListener(name + "Breakpoint", handler);
        };
        this["remove" + capitalizedName + "Listener"] = function(handler) {
            this.getWindow().removeEventListener(name + "Breakpoint", handler);
        };
    };

    /**
     * Add a breakpoint with `name` at the specified `width`.
     */
    PointBreak.prototype.unregisterBreakpoint = function(name) {
        this.breakpoints[name] = null;
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] =
            this["remove" + capitalizedName + "Listener"] = null;
    };

    /**
     * Returns true if the current breakpoint matches the `name` parameter.
     */
    PointBreak.prototype.isBreakpoint = function(name) {
        return this.getBreakpointForSize(this.getWidth()) === name;
    };

    // Set any breakpoints to automatically add to every instance.
    PointBreak.defaultBreakpoints = {};
    PointBreak.prototype.BREAKPOINT_CHANGE_EVENT = "breakpointChange";
    PointBreak.prototype.MAX_BREAKPOINT = "max";

    return PointBreak;
}());

// AMD / Require.js definition
if (typeof define === "function" && define.amd) {
    define("PointBreak", [], function() {
        "use strict";
        return PointBreak;
    });
}
