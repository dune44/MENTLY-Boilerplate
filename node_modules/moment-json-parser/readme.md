
# Moment.js JSON Parser
#### Date parsing extensions for the JavaScript JSON parser to provide moment objects from JSON.parse()####

This small JavaScript library provides for automatically parsing JSON date strings 
to moment objects as part of regular JSON parsing.
You can parse either individual date values or complex objects containing dates
and have them automatically turned into moments, unlike the default JSON parser
behavior of parsing to ISO 8601 date strings. 

You can either manually run the date parsing or replace the JSON parser 
for the global scope to force *all* JSON operations to parse dates 
automatically, including those by other frameworks such as jQuery, angularJS etc.

This library is a fork or [original](https://github.com/RickStrahl/json.date-extensions) which works with moment.js rather than with raw date.

Original article
* **[JavaScript JSON Date Parsing and real Dates](http://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates)**

## Usage ##

### Install

```
npm i moment-json-parser -S
#or with JSPM
jspm install moment-json-parser
```

Use as a function which you just require
```javascript
var jsonParser = require('../moment-json-parser');

```
or override the default JSON.parse
```javascript
require('../moment-json-parser').overrideDefault();
// JSON.parse gives you moments !!!
```

you can also revert back to default JSON.parse
```javascript
require('../moment-json-parser').overrideDefault(false);
// JSON.parse gives you only strings :-(
```

This