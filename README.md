# InViewJS
InViewJS is a small JavaScript plugin useful for tracking how much time users spend viewing certain contents on your web pages.

**[Available at my github page](https://github.com/olefrank/inviewjs/)**

## Options
* **element** which element to track (default: ".article")
* **pctInView** percentage that the element must fill the screen to be "in view" (default: 50)
* **eventHandler** name of external function to handle event broadcasting
* **heartbeatInterval** interval (milliseconds) between heart beats (default: 2000 = 2 sec)
* **heartbeatExpires** how long (milliseconds) before heartbeat stops (default: 180000 = 3 min)

## Demos
In the '''demo''' folder you can find various HTML pages to demo the plugin. Open the browsers console to view events.

## Contributing
Bug reports and code contributions are welcome. Please see [CONTRIBUTIONS.md](https://github.com/olefrank/inviewjs/).

## Contact
If you have any questions you can find me on Twitter at [@olefrankjensen](https://twitter.com/OleFrankJensen).

## Inspiration
In making this plugin I was inspired by:
* [Viljami S](http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/) Wrote a blog post about migrating from jQuery to Vanilla JavaScript. I used some of his suggestion how to decide when an element is in view.
* [Addi Osmani](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript) Wrote a great (free) book about JavaScript programming. I used the "Revealing Module Pattern" for my plugin 'cause it's just - nice!