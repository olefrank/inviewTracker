; // defensive programming: script may be concatenated with others

/*
 * InViewTracker | v0.1
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

var InViewTracker = (function() {

    "use strict";

    var listenDelay;
    var totalTime = 0;
    var heartbeatDelay;
    var heartbeatCounter = 0;
    var isHeartbeatStarted;
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

        window.onscroll = function() {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function() {

                if ( isInViewport() ) {
                    if (!isHeartbeatStarted) {
                        heartbeatStart();
                    }
                }
                else {
                     if (isHeartbeatStarted) {
                        heartbeatStop();
                        totalTime += calculateTimeSpent();
                    }
                }
            }, 150);
        };

        window.onload = function() {
            calculateViewportBoundaries();

            if ( isInViewport() ) {
                heartbeatStart();
            }
        };

        window.onbeforeunload = function() {
            settings.eventHandler("totaltime: " + totalTime);
        };

        window.onblur = function() {
            if (isHeartbeatStarted) {
                heartbeatStop();
                totalTime += calculateTimeSpent();
            }
        };

        window.onfocus = function() {
            if ( isInViewport() ) {
                if (!isHeartbeatStarted) {
                    heartbeatStart();
                }
            }
        };

        window.onresize = function() {
            clearTimeout(listenDelay);
            listenDelay = setTimeout(function() {
                calculateViewportBoundaries();
            }, 150);
        };
    }

    function calculateViewportBoundaries() {
        var pctInView = settings.pctInView / 100;
        viewportTop = ( window.innerHeight * (1 - pctInView) );
        viewportBottom = ( window.innerHeight * pctInView );
    }

    function heartbeatStart() {
        heartbeatDate = new Date();
        isHeartbeatStarted = true;

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

    function heartbeatStop() {
        isHeartbeatStarted = false;
        clearInterval(heartbeatDelay);
    }

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
        var rect = settings.element.getBoundingClientRect();

        if ( rect.height < window.innerHeight )
            return isFullyVisible(rect);
        else
            return isPartiallyVisible(rect);
    }

    /**
     * Determines if element fills percentage of view port
     * @param rect: element
     * @param html: client / view port
     * @returns boolean
     */
    function isPartiallyVisible(rect) {
        return (rect.top <= viewportTop) && (rect.bottom >= viewportBottom);
    }

    /**
     * Determines if element is fully visible
     * @param rect: element
     * @param html: client / view port
     * @returns boolean
     */
    function isFullyVisible(rect, html) {
        return (rect.top >= 0) && ( rect.bottom <= (window.innerHeight || html.clientHeight) );
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

    return {
        init: init
    };

})();
