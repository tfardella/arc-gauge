# ArcGauge

Draws a simple arc gauge in a given dom container. The width is determined by the container. The arc can be adjusted by setting the start and end angles as well as the "clockwise" option (true or false).

The following are the default options that can be overriden:

  defaults = {
    'elementID': "#arc-gauge",
    'margin': {top: 0, right: 0, bottom: 0, left: 0},
    'arcWidth': 60,
    'cornerRadius': 4,
    'clockwise': false,
    'startAngle': 240,
    'endAngle': 120,
    'precision': 0,
    'textX': '0.3em',
    'textY': '0em',
    'animationDuration': 500 
  };

Styles can be changed via CSS (see index.html).

To use:

```javascript
	var myGauge = new arcGauge( 0.5, '#arc-gauge', options );
	myGauge.initialize().drawGauge().drawText();
```

See the index.html file for a full example.

To install: 
	- cd to the directory with the package.json file
	- npm install
