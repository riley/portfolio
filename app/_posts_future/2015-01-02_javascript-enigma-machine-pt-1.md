## JavaScript Enigma Machine (Pt. 1)

#### March 9, 2015

Recently I had the opportunity to build a WWII Enigma Machine simulator for work. I'm going to use this series of posts as a brain dump for myself, or if anyone stumbles across this site. The version that made it live was a bit truncated, and I wanted to put the full version up somewhere.

[Enigma Machine Simulator - Full](/demos/enigma.html)

- It's an Enigma machine - nerd cred
- I made myself build the thing without using any libraries
- I learned a lot about SVG working with CSS

In this first post, some background about the Eningma machine in case you haven't heard of it in a while. Before the first and second world wars (citation needed) the Enigma company produced commercial cypher machines for banks and others to communicate via coded messages and whatnot. At the outbreak of WWII, the German military thought they could harden the Enigma into a military-grade cypher machine. Here is a great introduction to the Enigma for the uninitiated:

(Youtube here)

The basic idea is that the Enigma had an input keyboard, and upon pressing a key, a series of electro-mechanical connections were made to encode a letter. Sine the positions of the circuits would shift with every key press, the code wasn't a simple letter substitution. Therefore, the receiver of the message had to know the initial settings to decode the message.

So let's dig into the code.

I wanted to build this without the help of any libraries mostly just to see if I could do it. This interactive existed as a one-off for a client, so I thought it would be a great opportunity to experiment. I learned a lot about the DOM API, which spawned a talk I gave at the office about [no more jQuery](http://github.com/spamhammer/no-more-jquery). This interactive didn't have a server component, further reducing complexity.

Highlights:
- Giving up IE8 is huge. I had been coding defensively, and leaning on jQuery to give me the js features I was missing. I found out many of the functional programming concepts from ES5 (citation needed) are in IE9. `forEach()`, `map()`, `reduce()`, `filter()` are all there.
- I hadn't even heard aobut `Element.prototype.classList` before this. I thought you still had to write your own class managment functions on the `className` property. You can `add()`, `remove()`, `hasClass()` and even `toggle()`. It even works on `SVGElement`s (mostly). [MDN classList](http://mdn.com)
- Iterating over selected elements is a bit more verbose without jQuery, but not painfully so. I modified the prototype (gasp!) of `NodeList` and `HTMLCollection` to add the `forEach` method. Otherwise you're writing for loops everywhere, and there are some gotchas depending on which selector method you used to get the collection.
- The DOM API and JavaScript aren't developed with parallel. This is so that they can be deveoped without being held back by the other, and they're not tightly coupled. There are things that seem obvious like `forEach` on `NodeList`s, but since the DOM API is just that, an API, JavaScript is compatible, but not really tightly integrated.

In Part II, I'll talk about how I leveraged CSS transforms and transitions on SVG elements to get great animation without writing cumbersome SVG code.

- selecting elements with DOM API - no more jQuery reference
- NodeList vs HTMLCollection
- forEach on NodeList
- classList
- classList + SVG
- css transition on svg
- browser issues
- bezier path
- trig for the layout
- transforms
- dotted lines
- viewBox