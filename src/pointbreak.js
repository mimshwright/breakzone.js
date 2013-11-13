var PointBreak = PointBreak || {};

if (typeof define === "function" && define.amd) {
  define("PointBreak", [], function() {
    return PointBreak;
  });
}

/**
 * Sets up a system for dispatching events when breakpoints change.
 * @class
 */
PointBreak = function(breakpoints) {

	var lastBreakpoint;
	var that = this;

	this.window = window;

	this.breakpoints = [];

	if (breakpoints !== undefined && breakpoints !== null) {
		for (var name in breakpoints) {
			this.registerBreakpoint(breakpoints[name],name);
		}
	}

	lastBreakpoint = this.getBreakpointForSize(this.getWidth());

	this.window.addEventListener("resize", function (e) { that.onResize(e); } );
	document.addEventListener("load", function (e) { that.onResize(e); } );
};

/** Shortcut for listening to the BREAKPOINT_CHANGE_EVENT on the window */
PointBreak.prototype.addChangeListener = function (handler) {
	this.window.addEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
};

/** Shortcut for un-listening to the BREAKPOINT_CHANGE_EVENT on the window */
PointBreak.prototype.removeChangeListener = function (handler) {
	this.window.removeEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
};

/** Returns the current width of the screen */
PointBreak.prototype.getWidth = function () {
	return this.window.innerWidth;
};

/**
 * Called when the window resizes.
 */
PointBreak.prototype.onResize = function (event) {
	var newWidth = this.getWidth();
	var currentBreakpoint = this.getBreakpointForSize(newWidth);
	var breakpointChangeEvent, specificBreakpointEvent;
	if (this.lastBreakpoint != currentBreakpoint) {
		// Dispatch a generic event for this breakpoint change.
		breakpointChangeEvent = document.createEvent("Event");
		breakpointChangeEvent.initEvent(PointBreak.BREAKPOINT_CHANGE_EVENT, true, true);
		breakpointChangeEvent.oldBreakpoint = this.lastBreakpoint;
		breakpointChangeEvent.newBreakpoint = currentBreakpoint;
		breakpointChangeEvent.width = newWidth;
		this.window.dispatchEvent(breakpointChangeEvent);

		// Disptach a special event type for this breakpoint name
		// e.g. "smallBreakpoint"
		specificBreakpointEvent = document.createEvent("Event");
		specificBreakpointEvent.initEvent(currentBreakpoint + "Breakpoint", true, true);
		specificBreakpointEvent.oldBreakpoint = this.lastBreakpoint;
		specificBreakpointEvent.newBreakpoint = currentBreakpoint;
		specificBreakpointEvent.width = newWidth;
		this.window.dispatchEvent(specificBreakpointEvent);
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
PointBreak.prototype.getBreakpointForSize = function (width) {
	var lowestBreakpointValue = Infinity;
	var lowestBreakpointName = PointBreak.MAX_BREAKPOINT;
	for (var breakpointName in this.breakpoints) {
		var breakpoint = this.breakpoints[breakpointName];
		if (width <= breakpoint && breakpoint <= lowestBreakpointValue ) {
			lowestBreakpointValue = breakpoint;
			lowestBreakpointName = breakpointName;
		} else {
		}
	}
	return lowestBreakpointName;
};

PointBreak.prototype.getSizeOfBreakpoint = function (name) {
	if (this.isBreakpoint(name)) {
		return this.breakpoints[name];
	}
	return 0;
};

/**
 * Returns the name for the current breakpoint.
 */
PointBreak.prototype.getCurrentBreakpoint = function () {
	return this.getBreakpointForSize(this.getWidth());
};

/**
 * Add a breakpoint with `name` at the specified `width`.
 */
PointBreak.prototype.registerBreakpoint = function (width, name) {
	this.breakpoints[name] = width;

	// Add a new version of "on" for this breakpoint.
	var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
	this["add" + capitalizedName + "Listener"] = function (handler) {
		this.window.addEventListener(name + "Breakpoint", handler);
	};
	this["remove" + capitalizedName + "Listener"] = function (handler) {
		this.window.removeEventListener(name + "Breakpoint", handler);
	};
};

/**
 * Add a breakpoint with `name` at the specified `width`.
 */
PointBreak.prototype.unregisterBreakpoint = function (name) {
	this.breakpoints[name] = null;
	var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
	this["add" + capitalizedName + "Listener"] =
	this["remove" + capitalizedName + "Listener"] = null;
};

/**
 * Returns true if the current breakpoint matches the `name` parameter.
 */
PointBreak.prototype.isBreakpoint = function (name) {
	return this.getBreakpointForSize(this.getWidth()) == name;
};

PointBreak.BREAKPOINT_CHANGE_EVENT = "breakpointChange";
PointBreak.MAX_BREAKPOINT = "max";