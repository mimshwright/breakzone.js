breakzone.js
===============================

Create screen breakpoints in javascript and easily react to changes in the viewport.

  - Reference breakpoints by custom names rather than pixel sizes.
  - Intuitive API.
  - No dependency on JQuery or other libraries.

## Demo

Check out the [demo](http://htmlpreview.github.io/?https://github.com/mimshwright/breakzone.js/blob/master/demo/index.html) and view the [source code](https://github.com/mimshwright/breakzone.js/blob/master/demo/demo.js).

## Usage

```javascript
// Javascript

// Instantiate breakzone with a list of breakpoint names and sizes.
// Note: Sizes are the maximum size for the breakpoint. By default,
// the "max" breakpoint is the largest breakpoint and has no upper limit.
var breakzone = new BreakZone({
    "small": 480,
    "medium": 769,
    "large": 960
});

// Add a listener that is triggered when the breakpoint changes.
breakzone.addChangeListener(function (event) {
    console.log("Old breakpoint: " + event.oldBreakpoint);
    console.log("New breakpoint: " + event.newBreakpoint);
});

// Add a listener for a specific event.
// Use addXyzListener() where "Xyz" is the name of the breakpoint.
breakzone.addMediumListener(function (event) {
    console.log("Medium Breakpoint Triggered");
});

// Add a callback to breakzone directly.
// Use onXyz()
breakzone.onLarge = function (oldBreakpoint, newBreakpoint) {
    console.log("Large Breakpoint Triggered");
}

// See the current breakpoint
console.log("The current breakpoint is " + breakzone.getCurrentBreakpoint());

// Check to see if the current breakpoint matches.
if (breakzone.isCurrentBreakpoint("small", "medium")) {
    console.log("The current breakpoint is 'medium' or smaller");
}

```

For more details, check out the well documented [source code](https://github.com/mimshwright/breakzone.js/blob/master/src/breakzone.js).

## Build using Grunt

- Clone repository.
- Install all dependencies from `package.json` using `npm install`.
- Run grunt.
  - General development `grunt dev` or just `grunt`
  - Open test suite (Mac only) `grunt test`
  - Deploy `grunt deploy`
  - Demo `grunt demo` - runs `grunt dev` then opens a browser window
  - Full list of tasks `grunt --help`

## Credits

### Contributors

- [Mims H. Wright](http://github.com/mimshwright)	Author
- You!?
