; // defensive programming: script may be concatenated with others

/*
 * InViewTracker | v0.1
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

var InViewTracker = (function() {

    "use strict";

    var scrollDelay;
    var totalTime = 0;
    var heartbeatDelay;
    var heartbeatCounter = 0;
    var isHeartbeatRunning;
    var heartbeatDate;
    var viewportTop;
    var viewportBottom;

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
        heartbeatInterval: 2000,
        heartbeatExpires: 180000 // 3 min
    };

    /**
     * Central function for binding all event listeners
     */
    function bindDOMEvents() {

        // when user scrolls: start heart beat if element is "in view"
        // delay (150 ms) to avoid unnecessary event
        window.onscroll = function() {
            clearTimeout(scrollDelay);
            scrollDelay = setTimeout(function() {

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
        };

        // after page loads: calculate view port size
        // start heartbeat if element is "in view"
        window.onload = function() {
            calculateViewportBoundaries();

            if ( isInViewport() ) {
                heartbeatStart();
            }
        };

        // before page unloads: send event with total time
        window.onbeforeunload = function() {
            settings.eventHandler("totaltime: " + totalTime);
        };

        // when window loses focus: stop heartbeat
        window.onblur = function() {
            if (isHeartbeatRunning) {
                heartbeatStop();
                totalTime += calculateTimeSpent();
            }
        };

        // when window gains focus: start heartbeat if element is "in view"
        window.onfocus = function() {
            calculateViewportBoundaries();

            if ( isInViewport() ) {
                if (!isHeartbeatRunning) {
                    heartbeatStart();
                }
            }
        };

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

        // first heartbeat (fake)
        if (heartbeatCounter === 0) {
            settings.eventHandler("heartbeatDelay " + heartbeatCounter + "=" + totalTime);
            heartbeatCounter++;
        }

        // Check if heartbeat is expired
        if (totalTime < settings.heartbeatExpires) {
            heartbeatDelay = setInterval(function() {
                totalTime += calculateTimeSpent();

                // Stop heatbeat if expired
                if (totalTime > settings.heartbeatExpires) {
                    clearInterval(heartbeatDelay);
                }
                else {
                    heartbeatDate = new Date();
                    settings.eventHandler("heartbeatDelay " + heartbeatCounter + "=" + totalTime);
                    heartbeatCounter++;
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

    /**
     * Calcule time spent "in view" since last heartbeat
     * @returns time spent
     */
    function calculateTimeSpent() {
        var result = 0

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
        var element = (settings.element).getBoundingClientRect();

        if ( element.height < window.innerHeight )
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
     * @param message: event message
     */
    function broadcastEvent(message) {
        console.log("simulate event: " + message);
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

    // define plugin interface
    return {
        init: init
    };

})();
