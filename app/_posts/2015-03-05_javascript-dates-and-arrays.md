## JavaScript Date object and Arrays

#### March 3, 2015

Short post. Putting this here for myself and future googlers.

Did you know that you can easily create an array of all the days in a year? You don't have to explicitly set the month parameter in `new Date()`.


first we'll make a range function, unless you're using the underscore/loash method `_.range`
```javascript
function range(num) {
    return Array.apply(null, Array(num)).map(function (_, i) {return i;});
}
```
which will give us an array of numbers from 0-364. All we have to do to transform that into an array of `Date` objects is map them. The day parameter will automagically do a modulo into the month parameter:

```javascript
var dateArr = range(365).map(function (i) {
    return new Date(2014, 0, i);
});
```

Presto! You don't ever have to remember the number of days in each month again!