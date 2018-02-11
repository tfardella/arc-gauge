/**
 * Create a new arcGauge
 * @param {number} initial value ( 0 - 1)
 * @param {string} DOM element id
 * @param {object} options (see defaults below for what can be changed
 * @return {object} arcGauge
 */
var arcGauge = function (data, element, options ) {
  var self = this;

  var defaults = {
    'elementID': "#arc-gauge",
    'margin': {top: 10, right: 10, bottom: 10, left: 10},
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

  if( data ) {
    self.data = self.checkData( data );
  } else {
    self.data = 0;
  }

  if( element ) {
    self.element = element;
  } else {
    self.element = defaults.elementID;
  }

  if(options) {
//    self.options = $.extend({}, defaults, options);          
    self.options = { ...defaults, ...options};          
  } else {
    self.options = { ...defaults};         
  }    
};

arcGauge.prototype = {
  /**
   * Check if data is valid
   * @param {number} value (0 - 1)
   * @return {number} value or 0 if not valid
   */
  checkData: function( data ) {
    data = parseFloat(data);
    if( data < 0 || !data > 1 ) {
      data = 0;
    }
    return data;
  },

  /**
   * Initialize an arcGauge
   * @return {object} arcGauge
   */
  initialize: function () {
    var self = this;
    var containerRect = d3.select( self.element ).node().getBoundingClientRect();
    self.width = containerRect.width - self.options.margin.left - self.options.margin.right;
    self.height = containerRect.height - self.options.margin.top - self.options.margin.bottom;
    self.outerRadius = self.width / 2;
    self.innerRadius = self.outerRadius - self.options.arcWidth;

    var toRadians = function( degrees ) {
        return( degrees * ( Math.PI / 180 ) );
    };

    self.startRadians = toRadians( self.options.startAngle );
    self.endRadians = ( toRadians( self.options.endAngle + ( self.options.clockwise ? 0 : 360 ) ) );

    // Setup SVG element
    var canvas = d3.select( self.element ).append( 'svg' )
      .attr( "class", "bgContainer" )
      .attr( "width", self.width + 10 )
      .attr( "height", self.height + 10 );

    // Add group element to SVG
    self.group = canvas.append( "g" )
      .attr( "transform", "translate( " + (self.outerRadius + 4)+ ", " + (self.outerRadius + 4) + " )" );

    return self;
  },

  /**
   * Draw the gauge
   * @return {object} arcGauge
   */
  drawGauge: function() {
    var self = this;

    // Create the arc we'll use to create the foreground and background arcs
    self.gaugeArc = d3.arc()
      .innerRadius( self.innerRadius )
      .outerRadius( self.outerRadius )
      .startAngle( self.startRadians )
      .cornerRadius( self.options.cornerRadius );

    // Append the background arc to the SVG element
    self.bg = self.group.append('path')
      .datum( { endAngle: self.endRadians } )
      .attr( "d", self.gaugeArc )
      .attr( "class", "bgArc" );

    // Append the foreground arc to the SVG element
    self.fg = self.group.append('path')
      .datum( { endAngle: ( ( ( self.data) * ( self.endRadians - self.startRadians ) ) + self.startRadians ) } )
      .attr( "d", self.gaugeArc )
      .attr( "class", "fgArc" );

      return self;
  },

  /**
   * Draw the text on the gauge
   * @return {object} arcGauge
   */
  drawText: function() {
    var self = this;

    var textSize = self.options.textSize * self.outerRadius / 2;

    self.gaugeText = self.group.append( 'text' )
      .attr( "class", "gaugeText" )
      .attr("x", self.options.textX)
      .attr("dy", self.options.textY)
      .text( (self.data * 100).toFixed( self.options.precision ) + "%");
      
      self.gaugeText.currentValue = self.data;
    
      return self;
  },

  /**
   * Update the gauge with new data
   * @param {number} value (0 - 1)
   * @return {object} arcGauge
   */
  updateGauge: function( data ) {
    var self = this;

    var textTween = function(){
      var textItem = this;
      var i = d3.interpolate( self.gaugeText.currentValue, data );
      self.gaugeText.currentValue = data;

      return function( t ) { 
        textItem.textContent = (i( t ) * 100).toFixed(self.options.precision) + "%"; 
      }
    };

    function arcTween( transition, newAng ) {
      var newAng = ( ( data * ( self.endRadians - self.startRadians ) ) + self.startRadians );

      transition.attrTween( "d", function( d ) {
        var interpolate = d3.interpolate( d.endAngle, newAng );

        return function( t ) {
          d.endAngle = interpolate(t);
          return self.gaugeArc( d );
        };
      });
    }

    self.fg.transition()
        .duration( self.options.animationDuration )
        .call( arcTween, data ) ;

    self.gaugeText.transition()
      .duration( self.options.animationDuration )
      .tween( "text", textTween);

    return self;
  }
};
