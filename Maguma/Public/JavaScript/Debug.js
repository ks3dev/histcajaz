/// <reference path="_references.js" />
/// <reference path="External/_references.history.js" />
// how to set up history.js: https://gist.github.com/854622

window.$debug = window.$debug || {};

/// This is a quick way to see if an action has broken the Single Page Application structure 
/// by reloading the entire page, the counter will have reset
///
/// Usage
/// - Simply call at first page, with a div element to write the count value to
window.$debug.startGlobalTicker = function (divToShowOn) {
    var opts = { frequency: 250, count: 1 };
    function tickGo(o) {
        divToShowOn.html(o.count);
        o.count += 2;
        setTimeout(function () { tickGo(o); }, o.frequency);
    };
    tickGo(opts);
};