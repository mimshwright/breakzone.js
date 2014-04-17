// js-hint globals
/*global define,window,document*/
/*exported BreakZone*/

var BreakZone = (function() {
    "use strict";

    /**
     * Sets up a system for dispatching events when breakpoints change.
     * @class BreakZone
     * @constructor
     * @param {BreakpointObject} [breakpointsToAdd] A set of breakpoints to register when BreakZone initializes.
     * @param {Window} [targetWindow=window] If you want to target a different window than the current one, you may set it here.
     */
    BreakZone = function(breakpointsToAdd, targetWindow) {
        var that = this,
            name;

        if (targetWindow !== undefined) {
            this.window = targetWindow;
        } else {
            // use the current global window by default.
            this.window = window;
        }

        // Create the hash that holds the breakpoints
        this.breakpoints = {};
        this.listeners = {};

        // Automatically register a breakpoint at Infinity pixels.
        this.registerBreakpoint(BreakZone.MAX_BREAKPOINT, BreakZone.MAX_BREAKPOINT_WIDTH);

        // Register any default breakpoints.
        if (BreakZone.defaultBreakpoints !== null) {
            this.registerBreakpoint(BreakZone.defaultBreakpoints);
        }

        if (breakpointsToAdd !== undefined && breakpointsToAdd !== null) {
            this.registerBreakpoint(breakpointsToAdd);
        }

        /** @prop lastSize {int} */
        this.lastSize = NaN;

        this.getWindow().addEventListener("resize", function(e) {
            that.onResize(e);
        });
        document.addEventListener("load", function(e) {
            that.onResize(e);
        });
    };

    /**
     * @private
     * Adds an event listener to this object as if it were a dom element.
     * @param type {string} The type of event to listen for.
     * @param listener {function} A function to call when the event is dispatched.
     */
    BreakZone.prototype.addEventListener = function(type, listener) {
        if (!listener || typeof listener != "function") {
            throw new Error("listener parameter must be defined and be a function.");
        }
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(listener);
    };

    /**
     * @private
     * Removes a registered listener for an event.
     *
     * @param type {string} The type of event to remove the listener for.
     * @param listener {function} The function to remove.
     */
    BreakZone.prototype.removeEventListener = function(type, listener) {
        var typeListeners = this.listeners[type],
            index;

        if (typeListeners) {
            index = typeListeners.indexOf(listener);
        } else {
            return;
        }
        if (index >= 0) {
            typeListeners.splice(index, 1);
        }
    };

    /**
     * Dispatches an event.
     *
     * @param event {Event} An event object.
     */
    BreakZone.prototype.dispatchEvent = function(event) {
        var typeListeners = this.listeners[event.type],
            i = 0,
            l,
            listener;

        if (typeListeners) {
            l = typeListeners.length;
        } else {
            return;
        }

        for (; i < l; i += 1) {
            listener = typeListeners[i];
            listener.call(this.getWindow(), event);
        }
    };

    /**
     * Shortcut for listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    BreakZone.prototype.addChangeListener = function(handler) {
        this.addEventListener(BreakZone.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Shortcut for un-listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    BreakZone.prototype.removeChangeListener = function(handler) {
        this.removeEventListener(BreakZone.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Returns the current width of the screen
     *
     * @return {number} width of screen.
     */
    BreakZone.prototype.getWidth = function() {
        return this.getWindow().innerWidth;
    };

    /**
     * Returns BreakZone's target window.
     *
     * @returns {Window} window
     */
    BreakZone.prototype.getWindow = function() {
        return this.window;
    };

    /**
     * Called when the window resizes.
     */
    BreakZone.prototype.onResize = function() {
        var newWidth = this.getWidth(),
            currentBreakpoint = this.getBreakpointForSize(newWidth),
            lastBreakpoint = this.getBreakpointForSize(this.lastSize),
            breakpointChangeEvent,
            specificBreakpointEvent;

        if (lastBreakpoint !== currentBreakpoint) {
            // Dispatch a generic event for this breakpoint change.
            breakpointChangeEvent = document.createEvent("Event");
            breakpointChangeEvent.initEvent(BreakZone.BREAKPOINT_CHANGE_EVENT, true, true);
            breakpointChangeEvent.oldBreakpoint = lastBreakpoint;
            breakpointChangeEvent.newBreakpoint = currentBreakpoint;
            breakpointChangeEvent.width = newWidth;
            this.dispatchEvent(breakpointChangeEvent);

            // Dispatch a special event type for this breakpoint name
            // e.g. "smallBreakpoint"
            specificBreakpointEvent = document.createEvent("Event");
            specificBreakpointEvent.initEvent(currentBreakpoint + "Breakpoint", true, true);
            specificBreakpointEvent.oldBreakpoint = lastBreakpoint;
            specificBreakpointEvent.newBreakpoint = currentBreakpoint;
            specificBreakpointEvent.width = newWidth;
            this.dispatchEvent(specificBreakpointEvent);

            // attempt to call the onXyz function for this breakpoint.
            var capitalizedName = currentBreakpoint.charAt(0).toUpperCase() + currentBreakpoint.slice(1),
                callbackName = "on" + capitalizedName,
                callbackLowerCase = "on" + currentBreakpoint;
            if (this.hasOwnProperty(callbackName) && typeof this[callbackName] === "function") {
                this[callbackName].call(this, lastBreakpoint, currentBreakpoint);
            }

            if (this.hasOwnProperty(callbackLowerCase) && typeof this[callbackLowerCase] === "function") {
                this[callbackLowerCase].call(this, lastBreakpoint, currentBreakpoint);
            }

            this.lastSize = newWidth;
        }
    };

    /**
     * Returns the array of registered breakpoints.
     *
     * @return {BreakpointObject} breakpoints.
     */
    BreakZone.prototype.getBreakpoints = function() {
        return this.breakpoints;
    };

    /**
     * Returns the name for the width.
     *
     * @param {number} width Any width number to check the name of.
     * @return {string} Breakpoint title for width.
     */
    BreakZone.prototype.getBreakpointForSize = function(width) {
        var lowestBreakpointValue = BreakZone.MAX_BREAKPOINT_WIDTH,
            lowestBreakpointName = BreakZone.MAX_BREAKPOINT,
            breakpointName,
            breakpoint;

        if (isNaN(width) || width < 0) {
            return null;
        }

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
    BreakZone.prototype.getSizes = function() {
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
    BreakZone.prototype.getSizeOfBreakpoint = function(name) {
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
    BreakZone.prototype.getCurrentBreakpoint = function() {
        return this.getBreakpointForSize(this.getWidth());
    };

    /**
     * Returns the current orientation of the window.
     *
     * @returns {string} Either "landscape" or "portrait". Square windows return "landscape".
     *
     * @see BreakZone.LANDSCAPE
     * @see BreakZone.PORTRAIT
     */
    BreakZone.prototype.getCurrentOrientation = function() {
        var w = this.window;
        if (w.innerWidth >= w.innerHeight) {
            return BreakZone.LANDSCAPE;
        }
        return BreakZone.PORTRAIT;
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
    BreakZone.prototype.registerBreakpoint = function(object_or_name, width) {
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
    BreakZone.prototype.registerSingleBreakpoint = function(name, width) {
        this.breakpoints[name] = width;

        this.addListenerFunctionsForBreakpoint(name);
    };

    /**
     * Remove the breakpoint called `name`.
     *
     * @param {string} name The name of the breakpoint to remove.
     */
    BreakZone.prototype.unregisterBreakpoint = function(name) {
        this.breakpoints[name] = null;
        this.removeListenerFunctionsForBreakpoint(name);
    };

    /**
     * @private
     * Creates two functions on the instance of BreakZone for adding and removing listeners.
     * They are addNameListener() and removeNameListener() where "Name" would be replaced with
     * the name of the breakpoint. E.g. addSmallListener()
     *
     * @param name The name of the breakpoint
     */
    BreakZone.prototype.addListenerFunctionsForBreakpoint = function(name) {
        // Add a new version of "on" for this breakpoint.
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] = function(handler) {
            this.addEventListener(name + "Breakpoint", handler);
        };
        this["remove" + capitalizedName + "Listener"] = function(handler) {
            this.removeEventListener(name + "Breakpoint", handler);
        };
    };

    /**
     * @private
     * Removes the listener functions added by addListenerFunctionsForBreakpoint().
     *
     * @param {string} name The name of the breakpoint to remove the listeners for.
     */
    BreakZone.prototype.removeListenerFunctionsForBreakpoint = function(name) {
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] =
            this["remove" + capitalizedName + "Listener"] = null;
    };

    /**
     * Returns true if the name of current breakpoint is registered.
     *
     * @param {string} name A breakpoint to check.
     */
    BreakZone.prototype.hasBreakpoint = function(name) {
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
     * myBreakZone.isCurrentBreakpoint("small", "medium");
     */
    BreakZone.prototype.isCurrentBreakpoint = function(name) {
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

    // You can add breakpoints to all instances of BreakZone by adding
    // values to BreakZone.defaultBreakpoints.
    BreakZone.defaultBreakpoints = {};

    BreakZone.BREAKPOINT_CHANGE_EVENT = "breakpointChange";
    BreakZone.MAX_BREAKPOINT = "max";
    BreakZone.MAX_BREAKPOINT_WIDTH = Infinity;

    // used by getCurrentOrientation()
    BreakZone.LANDSCAPE = "landscape";
    BreakZone.PORTRAIT = "portrait";

    return BreakZone;
}());

// AMD / Require.js definition
if (typeof define === "function" && define.amd) {
    define("BreakZone", [], function() {
        "use strict";
        return BreakZone;
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
