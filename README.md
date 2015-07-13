# InViewTracker
_Current version: 0.2_

_InViewTracker_ is a lightweight JavaScript plugin useful for tracking how much time users spend viewing certain content on your web pages. News papers or blogs use _InViewTracker_ to track how much time each user spends on reading articles on their website. Make sure all articles are within a container element (e.g. #article), include _InViewTracker_ on your pages and start tracking!

**[Available at my github](https://github.com/olefrank/inviewtracker/)**

## Compatibility
_InViewTracker_ should work in all modern browsers

I've tested _InViewTracker_ on:
* Chrome 32+
* Firefox 28+ 
* IE 9+
* Safari for Windows 5.1+

## Features
_Coming soon!_

## Options
* **element** which element to track (default: ".article")
* **pctInView** percentage that the element must fill the screen to be "in view" (default: 50)
* **eventHandler** name of external function to handle event broadcasting
* **heartbeatInterval** interval (milliseconds) between heart beats (default: 2000 = 2 secs)
* **heartbeatExpires** how long (milliseconds) before heartbeat stops (default: 180000 = 3 mins)
* **heartbeatTimeout** how long (milliseconds) with inactivity before heartbeat stops (default: 30000 = 30 secs)

## Demos
In the '''demo''' folder you can find various HTML pages to demo the plugin. Open the browsers console to view events.

## Changelog
* **0.2** Added property "heartbeatTimeout": used to ensure that _InViewTracker_ does not calculate time spent in view when computer is left unattended (defaults to 30 seconds)
* **0.1** Initial release

## Contributing
Bug reports and code contributions are welcome. Please see [CONTRIBUTIONS.md](https://github.com/olefrank/inviewTracker/blob/master/CONTRIBUTIONS.md).

## Contact
If you have any questions you can find me on Twitter at [@olefrankjensen](https://twitter.com/OleFrankJensen).

## Inspiration
In making this plugin I was inspired by:
* <a href="http://viljamis.com/" target="_blank">Viljami S</a> wrote a <a href="http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/" target="_blank">blog post</a> about migrating from jQuery to Vanilla JavaScript. I used some of his suggestion how to decide when an element is in view.
* <a href="http://addyosmani.com" target="_blank">Addi Osmani</a> wrote a <a href="http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript" target="_blanK">great (free) book</a> about JavaScript programming. I used the "Revealing Module Pattern" for my plugin 'cause it's just - nice!
