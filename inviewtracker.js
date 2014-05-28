; // defensive programming: script may be concatenated with others

/*
 * InViewTracker | v0.2
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

var InViewTracker = (function() {

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
            if (element.addEventListener) {
                return element.addEventListener(type, handler, false)
            }
            else if (element.attachEvent) {
                return element.attachEvent("on" + type, handler)
            }
        };

        // add eventlisteners
        addEventListener(window, "scroll", onScrollHandler);
        addEventListener(window, "load", onLoadHandler);
        addEventListener(window, "blur", onBlurHandler);
        addEventListener(window, "focus", onFocusHandler);
        addEventListener(window, "resize", onResizeHandler);
        addEventListener(window, "mousedown", onActivityHandler);
        addEventListener(window, "keydown", onActivityHandler);

        // when user scrolls: start heart beat if element is "in view"
        // delay (150 ms) to avoid unnecessary event
        function onScrollHandler() {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function() {
                // reset heartbeat timeout
                heartbeatTimeout = settings.heartbeatTimeout;

                if ( isInViewport() ) {
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
            // reset heartbeat timeout
            heartbeatTimeout = settings.heartbeatTimeout;

            if ( isInViewport() ) {
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
            // reset heartbeat timeout
            heartbeatTimeout = settings.heartbeatTimeout;

            if ( isInViewport() ) {
                if (!isHeartbeatRunning) {
                    heartbeatStart();
                }
            }
        }

        // when window is resized: recalculate viewport size
        // delay (150 ms): some browsers fire many events on resize
        function onResizeHandler() {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function() {
                calculateViewportBoundaries();
            }, 150);
        }

        // when user interacts with page (click, types): reset heartbeat timeout
        // heartbeat only active when user is attentive
        function onActivityHandler(e) {
            // reset heartbeat timeout
            heartbeatTimeout = settings.heartbeatTimeout;

            if ( isInViewport() ) {
                if (!isHeartbeatRunning) {
                    heartbeatStart();
                }
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
     * Start heartbeat
     */
    function heartbeatStart() {
        heartbeatDate = new Date();
        isHeartbeatRunning = true;

        // Check if heartbeat is expired
        if (totalTime < settings.heartbeatExpires) {
            heartbeatDelay = setInterval(function() {
                totalTime += calculateTimeSpent();

                // Stop heartbeat if expired
                if (totalTime > settings.heartbeatExpires || heartbeatTimeout <= 0) {
                    isHeartbeatRunning = false;
                    clearInterval(heartbeatDelay);
                }
                else {
                    // reset heartbeat timeout
                    heartbeatTimeout = heartbeatTimeout - settings.heartbeatInterval;

                    // heartbeat
                    heartbeatCounter++;
                    heartbeatDate = new Date();
                    // heartbeat event
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
        var eventObj = {
            heartbeatCount: heartbeatCounter,
            timestamp: totalTime,
            viewportHeight: viewportBottom + viewportTop,
            elementHeight: element.height
        };
        return eventObj;
    }

    /**
     * Calcule time spent "in view" since last heartbeat
     * @returns time spent
     */
    function calculateTimeSpent() {
        var result = 0;

        if ( heartbeatDate !== undefined) {
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

        if ( element.height < (window.innerHeight * pctInView) )
            return isFullyVisible(element);

        else
            return isPartiallyVisible(element);
    }

    /**
     * Determines if element fills percentage of view port
     * @param element: element
     * @param html: client / view port
     * @returns boolean
     */
    function isPartiallyVisible(element) {
        return (element.top <= viewportTop) && (element.bottom >= viewportBottom);
    }

    /**
     * Determines if element is fully visible
     * @param element: element
     * @param html: client / view port
     * @returns boolean
     */
    function isFullyVisible(element) {
        return (element.top >= 0) && ( element.bottom <= (window.innerHeight || html.clientHeight) );
    }

    /**
     * Send events
     * @param eventObj: event eventObj
     */
    function broadcastEvent(eventObj) {
        console.log("--- simulate event ---");
        console.log(eventObj);
    };

    /**
     * Merge user settings with default settings
     * User settings overwrite default settings where applied
     * @param userSettings: settings the user has specified
     */
    function mergeSettings(userSettings) {
        for (var key in userSettings) {
            settings[key] = userSettings[key];
        }
    };

    /**
     * Start tracking attention!
     * @param userSettings: settings the user has specified
     */
    function init(userSettings) {
        mergeSettings(userSettings);
        bindDOMEvents();
    };

    function getCurrentTimeEvent() {
        if (isHeartbeatRunning) {
            heartbeatStop();
        }

        totalTime += calculateTimeSpent();
        var eventObj = createEventObject();

        settings.eventHandler(eventObj);
    }

    // define plugin interface
    return {
        init: init,
        getCurrentTimeEvent: getCurrentTimeEvent
    };

})();
