; // defensive programming: script may be concatenated with others

/*
 * InViewTracker | v0.2
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

var InViewTracker;
InViewTracker = (function () {

    "use strict";

    var listenDelay;
    var totalTime = 0;
    var heartbeatDelay;
    var heartbeatCounter = 0;
    var isHeartbeatRunning;
    var heartbeatDate;
    var viewportTop;
    var viewportBottom;
    var element;
    var heartbeatTimeout;
    var timeoutTimer;

    /**
     * Object to hold default settings
     * @element: DOM element to track
     * @pctInView: percentage of element in view before tracking
     * @eventHandler: function to handle event broadcasting
     * @heartbeatInterval: number in millisecs. between heartbeats
     */
    var settings = {
        element: document.querySelector(".article"),
        pctInView: 50,
        eventHandler: broadcastEvent,
        heartbeatInterval: 2000, // 2 secs
        heartbeatExpires: 180000, // 3 mins
        heartbeatTimeout: 30000 // 30 secs
    };

    /**
     * Central function for binding all event listeners
     */
    function bindDOMEvents() {

        // handle cross browser event listeners
        var addEventListener = function (element, type, handler) {
            var result;

            if (element.addEventListener) {
                result = element.addEventListener(type, handler, false)
            }
            else if (element.attachEvent) {
                result = element.attachEvent("on" + type, handler)
            }

            return result;
        };

        // add eventlisteners
        addEventListener(window, "scroll", onScrollHandler);
        addEventListener(window, "load", onLoadHandler);
        addEventListener(window, "blur", onBlurHandler);
        addEventListener(window, "focus", onFocusHandler);
        addEventListener(window, "resize", onResizeHandler);

        addEventListener(window, "load", onActivityHandler);
        addEventListener(window, "focus", onActivityHandler);
        addEventListener(window, "mousedown", onActivityHandler);
        addEventListener(window, "keydown", onActivityHandler);

        // when user scrolls: start heart beat if element is "in view"
        // delay (150 ms) to avoid unnecessary event
        function onScrollHandler(e) {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function () {
                resetHeartbeatTimeout();

                if (isInViewport()) {
                    if (!isHeartbeatRunning) {
                        heartbeatStart();
                    }
                }
                else {
                    if (isHeartbeatRunning) {
                        heartbeatStop();
                        totalTime += calculateTimeSpent();
                    }
                }

            }, 150);
        }

        // after page loads: calculate view port size
        // start heartbeat if element is "in view"
        function onLoadHandler() {
            calculateViewportBoundaries();
            heartbeatTimeout = settings.heartbeatTimeout;

            if (isInViewport()) {
                heartbeatStart();
            }
        }

        // when window loses focus: stop heartbeat
        function onBlurHandler() {
            if (isHeartbeatRunning) {
                heartbeatStop();
            }
            totalTime += calculateTimeSpent();
        }

        // when window gains focus: start heartbeat if element is "in view"
        function onFocusHandler() {
            if (isInViewport()) {
                if (!isHeartbeatRunning) {
                    heartbeatStart();
                }
            }
        }

        // when window is resized: recalculate viewport size
        // delay (150 ms): some browsers fire many events on resize
        function onResizeHandler() {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function () {
                calculateViewportBoundaries();
            }, 150);
        }

        // when user interacts with page (click or type): reset heartbeatTimeout
        // prevent heartbeat from stopping when user is active
        function onActivityHandler(e) {
            // arrowUP (38) / arrowDOWN (40) are handled as scroll events
            if (e.keyCode != 38 || e.keyCode != 40) {
                resetHeartbeatTimeout();
            }
        }

    }

    /**
     * Calculate viewport top / bottom
     * Stores results in global vars: viewportTop / viewportBottom
     */
    function calculateViewportBoundaries() {
        var pctInView = settings.pctInView / 100;
        viewportTop = ( window.innerHeight * (1 - pctInView) );
        viewportBottom = ( window.innerHeight * pctInView );
    }

    /**
     * Resets heartbeatTimeout if user is active
     */
    function resetHeartbeatTimeout() {
        if (heartbeatTimeout < settings.heartbeatTimeout) {
            heartbeatTimeout = settings.heartbeatTimeout;
        }
    }

    /**
     * Timer that stops heartbeat if user is inactive
     */
    function heartbeatTimeoutHandler() {
        timeoutTimer = setInterval(function() {
            heartbeatTimeout = heartbeatTimeout - 1000;

            if (heartbeatTimeout <= 0 || !isHeartbeatRunning) {
                clearInterval(timeoutTimer);

                if (isHeartbeatRunning) {
                    heartbeatStop();
                }
            }
        }, 1000);
    }

    /**
     * Start heartbeat
     */
    function heartbeatStart() {
        heartbeatDate = new Date();
        isHeartbeatRunning = true;

        // Check if heartbeat is expired
        if (totalTime < settings.heartbeatExpires) {
            heartbeatTimeoutHandler();

            // Toggle heartbeat
            heartbeatDelay = setInterval(function () {
                totalTime += calculateTimeSpent();
                // Stop heartbeat if expired or timed out
                if (totalTime > settings.heartbeatExpires) {
                    isHeartbeatRunning = false;
                    clearInterval(heartbeatDelay);
                }
                else {
                    heartbeatCounter++;
                    heartbeatDate = new Date();
                    var eventObj = createEventObject();
                    settings.eventHandler(eventObj);
                }
            }, settings.heartbeatInterval);

        }
    }

    /**
     * Stop heartbeat
     */
    function heartbeatStop() {
        isHeartbeatRunning = false;
        clearInterval(heartbeatDelay);
    }

    function createEventObject() {
        return {
            heartbeatCount: heartbeatCounter,
            timestamp: totalTime,
            viewportHeight: viewportBottom + viewportTop,
            elementHeight: element.height
        };
    }

    /**
     * Calcule time spent "in view" since last heartbeat
     * @returns time spent
     */
    function calculateTimeSpent() {
        var result = 0;

        if (heartbeatDate !== undefined) {
            result = new Date().getTime() - heartbeatDate.getTime();
        }

        return result;
    }

    /**
     * Returns if element is "in view"
     * 2 cases: 1) element smaller than view port: uses isFullyVisible()
     *          2) element larger than view port: uses isPartiallyVisible()
     * @returns true: if 1) and element is inside view port
     *          true: if 2) and element fills percentage of view port
     */
    function isInViewport() {
        element = (settings.element).getBoundingClientRect();
        var pctInView = settings.pctInView / 100;

        if (element.height < (window.innerHeight * pctInView))
            return isFullyVisible(element);

        else
            return isPartiallyVisible(element);
    }

    /**
     * Determines if element fills percentage of view port
     * @param element element to track
     * @returns boolean
     */
    function isPartiallyVisible(element) {
        return (element.top <= viewportTop) && (element.bottom >= viewportBottom);
    }

    /**
     * Determines if element is fully visible
     * @param element element to track
     * @returns boolean
     */
    function isFullyVisible(element) {
        return (element.top >= 0) && ( element.bottom <= (window.innerHeight || html.clientHeight) );
    }

    /**
     * Send events
     * @param eventObj event object
     */
    function broadcastEvent(eventObj) {
        console.log("--- simulate event ---");
        console.log(eventObj);
    }

    /**
     * Merge user settings with default settings
     * User settings overwrite default settings where applied
     * @param userSettings settings the user has specified
     */
    function mergeSettings(userSettings) {
        for (var key in userSettings) {
            settings[key] = userSettings[key];
        }
    }

    /**
     * Start tracking attention!
     * @param userSettings settings the user has specified
     */
    function init(userSettings) {
        mergeSettings(userSettings);
        bindDOMEvents();
    }

    /**
     * Get total time spent in view
     * Can be used for getting total time on page unload
     */
    function getTotalTimeEvent() {
        if (isHeartbeatRunning) {
            heartbeatStop();
        }

        totalTime += calculateTimeSpent();
        var eventObj = createEventObject();

        settings.eventHandler(eventObj);
    }

    // define public interface
    return {
        init: init,
        getCurrentTimeEvent: getTotalTimeEvent
    };

})();
