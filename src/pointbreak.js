// js-hint globals
/*global define,window,document*/
/*exported PointBreak*/

var PointBreak = (function() {
    "use strict";

    /**
     * Sets up a system for dispatching events when breakpoints change.
     * @class PointBreak
     * @constructor
     * @param {BreakpointObject} [breakpoints] A set of breakpoints to register when PointBreak initializes.
     * @param {Window} [targetWindow=window] If you want to target a different window than the current one, you may set it here.
     */
    PointBreak = function(breakpoints, targetWindow) {
        var that = this,
            name;

        if (targetWindow !== undefined) {
            this.window = targetWindow;
        } else {
            // use the current global window by default.
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

    /**
     * Shortcut for listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    PointBreak.prototype.addChangeListener = function(handler) {
        this.getWindow().addEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Shortcut for un-listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    PointBreak.prototype.removeChangeListener = function(handler) {
        this.getWindow().removeEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Returns the current width of the screen
     *
     * @return {number} width of screen.
     */
    PointBreak.prototype.getWidth = function() {
        return this.getWindow().innerWidth;
    };

    /**
     * Returns PointBreak's target window.
     *
     * @returns {Window} window
     */
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
     * Returns the array of registered breakpoints.
     *
     * @return {BreakpointObject} breakpoints.
     */
    PointBreak.prototype.getBreakpoints = function() {
        return this.breakpoints;
    };

    /**
     * Returns the name for the width.
     *
     * @param {number} width Any width number to check the name of.
     * @return {string} Breakpoint title for width.
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

    /**
     * Returns all registered breakpoint sizes in order as an array.
     *
     * @return {Array} All breakpoint sizes sorted.
     */
    PointBreak.prototype.getSizes = function() {
        var sizes = [];
        for (var breakpoint in this.breakpoints) {
            if (this.breakpoints.hasOwnProperty(breakpoint)) {
                sizes.push(this.breakpoints[breakpoint]);
            }
        }
        sizes.sort();
        return sizes;
    };

    /**
     * Returns the maximum width of the breakpoint with the specified name.
     *
     * @param {string} name Name of the breakpoint.
     * @returns {number} The maximum width of the breakpoint.
     */
    PointBreak.prototype.getSizeOfBreakpoint = function(name) {
        if (this.hasBreakpoint(name)) {
            return this.breakpoints[name];
        }
        return 0;
    };

    /**
     * Returns the name for the window's current breakpoint.
     *
     * @return {string} Name of the current breakpoint.
     */
    PointBreak.prototype.getCurrentBreakpoint = function() {
        return this.getBreakpointForSize(this.getWidth());
    };

    /**
     * Add a breakpoint with `name` at the specified `width`.
     *
     * @param {BreakpointObject|string} object_or_name If this value is a string, use it as the name
     *                                  along with the width to register the breakpoint.
     *                                  If this value is an object, inspect it as if it
     *                                  was a hash of breakpoint names and widths.
     * @param {number} [width] The maximum width of the breakpoint (if object_or_name was a string)
     */
    PointBreak.prototype.registerBreakpoint = function(object_or_name, width) {
        var obj, name;

        // check to see if the object_or_name was a string.
        // if so, convert it to an object format.
        if (typeof object_or_name === "string" && !isNaN(width)) {
            name = object_or_name;
            obj = {};
            obj[name] = width;
        } else {
            obj = object_or_name;
        }

        // loop through the object and register each breakpoint found.
        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                this.registerSingleBreakpoint(name, obj[name]);
            }
        }
    };

    /**
     * @private
     * Explicitly add a single breakpoint name / value pair.
     *
     * @param {string} name Name of the breakpoint.
     * @param {number} width Max width of the breakpoint.
     */
    PointBreak.prototype.registerSingleBreakpoint = function(name, width) {
        this.breakpoints[name] = width;

        this.addListenerFunctionsForBreakpoint(name);
    };

    /**
     * Remove the breakpoint called `name`.
     *
     * @param {string} name The name of the breakpoint to remove.
     */
    PointBreak.prototype.unregisterBreakpoint = function(name) {
        this.breakpoints[name] = null;
        this.removeListenerFunctionsForBreakpoint(name);
    };

    /**
     * @private
     * Creates two functions on the instance of PointBreak for adding and removing listeners.
     * They are addNameListener() and removeNameListener() where "Name" would be replaced with
     * the name of the breakpoint. E.g. addSmallListener()
     *
     * @param name The name of the breakpoint
     */
    PointBreak.prototype.addListenerFunctionsForBreakpoint = function(name) {
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
     * @private
     * Removes the listener functions added by addListenerFunctionsForBreakpoint().
     *
     * @param {string} name The name of the breakpoint to remove the listeners for.
     */
    PointBreak.prototype.removeListenerFunctionsForBreakpoint = function(name) {
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] =
            this["remove" + capitalizedName + "Listener"] = null;
    };

    /**
     * Returns true if the name of current breakpoint is registered.
     *
     * @param {string} name A breakpoint to check.
     */
    PointBreak.prototype.hasBreakpoint = function(name) {
        return !isNaN(this.getBreakpoints()[name]);
    };

    /**
     * Checks all parameters against the name of the current breakpoint.
     * Returns true if any of them match.
     *
     * @param {...string} name One or more breakpoint names.
     *
     * @example
     * // returns true if the window is in the small or medium breakpoint zone.
     * myPointBreak.isCurrentBreakpoint("small", "medium");
     */
    PointBreak.prototype.isCurrentBreakpoint = function(name) {
        var i = 0,
            l = arguments.length,
            result = false,
            nameToCheck;

        for (; i < l; i++) {
            nameToCheck = (arguments[i]);
            result = this.getCurrentBreakpoint() === nameToCheck;
        }
        return result;
    };

    // You can add breakpoints to all instances of PointBreak by adding
    // values to PointBreak.defaultBreakpoints.
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


/**
 * An object that maps names to breakpoint sizes.
 *
 * @typedef {Object.<string, number>} BreakpointObject
 */

/**
 * An event that is dispatched when a breakpoint changes.
 *
 * @typedef {Event} BreakpointChangeEvent
 * @prop {string} newBreakpoint
 * @prop {string} oldBreakpoint
 * @prop {int} width
 */

/**
 * An event handler for changes in breakpoint.
 * @typedef {Function} BreakpointChangeHandler
 * @param {BreakpointChangeEvent} event
 */
