pointbreak.js
===============================

Create screen breakpoints in javascript and easily react to changes in the viewport.

![pointbreak](http://media.giphy.com/media/8o23ZAJCavmTK/giphy.gif)

## Build using Grunt

- Clone repository.
- Install all dependencies from `package.json` using `npm install`.
- Run grunt.
	- General development `grunt dev` or just `grunt`
	- Open test suite (Mac only) `grunt test`
	- Deploy `grunt deploy`
	- Demo `grunt demo` - runs a `deploy` then opens a browser window
	- Full list of tasks `grunt --help`

## Demo

Check out the [demo](http://htmlpreview.github.io/?https://github.com/mimshwright/pointbreak.js/blob/master/demo/index.html) and view the [source code](https://github.com/mimshwright/pointbreak.js/blob/master/demo/demo.js).

## Usage

```javascript
// Javascript

// Instantiate pointbreak with a list of breakpoint names and sizes.
// Note: Sizes are the maximum size for the breakpoint. By default,
// the "max" breakpoint is the largest breakpoint and has no upper limit.
var pointbreak = new PointBreak({
    "small": 480,
    "medium": 769,
    "large": 960
});

// Add a listener that is triggered when the breakpoint changes.
pointbreak.addChangeListener(function (event) {
    console.log("Old breakpoint: " + event.oldBreakpoint);
    console.log("New breakpoint: " + event.newBreakpoint);
});

// Add a listener for a specific event.
// Use addXyzListener() where "Xyz" is the name of the breakpoint.
pointbreak.addMediumListener(function (event) {
    console.log("Medium Breakpoint Triggered");
});

// Add a callback to pointbreak directly.
// Use onXyz()
pointbreak.onLarge = function (oldBreakpoint, newBreakpoint) {
    console.log("Large Breakpoint Triggered");
}

// See the current breakpoint
console.log("The current breakpoint is " + pointbreak.getCurrentBreakpoint());

// Check to see if the current breakpoint matches.
if (pointbreak.isCurrentBreakpoint("small", "medium")) {
    console.log("The current breakpoint is 'medium' or smaller");
}

```

For more details, check out the well documented [source code](https://github.com/mimshwright/pointbreak.js/blob/master/src/pointbreak.js).

## Credits

### Contributors

- [Mims H. Wright](http://github.com/mimshwright)	Author
