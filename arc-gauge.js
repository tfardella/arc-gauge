var arcGauge = function (data, element, options ) {
  var self = this;

  var defaults = {
    'elementID': "#arc-gauge",
    'margin': {top: 0, right: 0, bottom: 0, left: 0},
    'arcWidth': 60,
    'cornerRadius': 4,
    'clockwise': true,
    'startAngle': 240,
    'endAngle': 120,
    'precision': 0,
    'textCountUp': true,
    'textStartValue': 0,
    'textFinalValue': 50,
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
    self.options = $.extend({}, defaults, options);          
  } else {
    self.options = $.extend({}, defaults);         
  }    
}

arcGauge.prototype = {
  checkData: function( data ) {
    data = parseFloat(data);
    if( data < 0 || !data > 1 ) {
      data = 0;
    }
    return data;
  },

  initialize: function () {
    var self = this;
    var containerRect = d3.select( self.element ).node().getBoundingClientRect();
    self.width = containerRect.width - self.options.margin.left - self.options.margin.right;
    self.height = containerRect.height - self.options.margin.top - self.options.margin.bottom;
    self.outerRadius = self.width / 2;
    self.innerRadius = self.outerRadius - self.options.arcWidth;

    var polarToCartesian = function( centerX, centerY, radius, angleInDegrees ) {
      var angleInRadians = ( angleInDegrees - 90 ) * Math.PI / 180.0;

      return {
        x: centerX + ( radius * Math.cos( angleInRadians ) ),
        y: centerY + ( radius * Math.sin( angleInRadians ) )
      };
    }

    var toRadians = function( degrees ) {
        return( degrees * ( Math.PI / 180 ) );
    };

    self.startRadians = toRadians( self.options.startAngle );
    self.endRadians = ( toRadians( self.options.endAngle + ( self.options.clockwise ? 360 : 0 ) ) );

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

  drawGauge: function() {
    var self = this;

    // Create the arc
    self.gaugeArc = d3.arc()
      .innerRadius( self.innerRadius )
      .outerRadius( self.outerRadius )
      .startAngle( self.startRadians )
      .cornerRadius( self.options.cornerRadius );

    // Append the background arc to the SVG element
    self.bg2 = self.group.append('path')
      .datum( { endAngle: self.endRadians } )
      .attr( "d", self.gaugeArc )
      .attr( "class", "bgArc" );

    // Append the foreground arc to the SVG element
    self.fg2 = self.group.append('path')
      .datum( { endAngle: ( ( ( self.data) * ( self.endRadians - self.startRadians ) ) + self.startRadians ) } )
      .attr( "d", self.gaugeArc )
      .attr( "class", "fgArc" );

      return self;
  },

  drawText: function() {
    var self = this;

    var textSize = self.options.textSize * self.outerRadius / 2;

    self.gaugeText = self.group.append( 'text' )
      .attr( "class", "gaugeText" )
      .style( "font-size", self.outerRadius/2.5 + "px" )
      // .attr("x", 0)
      // .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text( (self.data * 100).toFixed( self.options.precision )  + "%");

      return self;
  },

  updateGauge: function( data ) {
    var self = this;

    var textRounderUpdater = function( data ){ return Math.round( data ); };

    var textTween = function(){
      var i = d3.interpolate( self.gaugeText.textContent, parseFloat( data ).toFixed( self.options.precision ) );
      return function( t ) { self.gaugeText.textContent = textRounderUpdater( i( t ) ); }
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

    self.fg2.transition()
        .duration( self.options.animationDuration )
        .call( arcTween, data ) ;

    self.gaugeText.text( (data * 100).toFixed( self.options.precision ) + "%" );
    self.gaugeText.transition()
      .duration( self.options.animationDuration )
      .tween( "text", textTween);

    return self;
  }
};
