
( function( $, window, self ) {
  'use strict';

  var defaults = {
  };

  var pluginName = 'gauge';
  var nameSpace = '.' + pluginName;

  var wrap = function( $ ) {

    // The plugin constructor
    var Gauge = function( element, options ) {
      this.element = $(element);
      this.element.data( pluginName, this );
      this.settings = $.extend({}, defaults, options);
      this.init();
    };

    Gauge.prototype.init = function() {
      var self = this;

    };
    
    Gauge.prototype.bindEvents = function() {
      var self = this;

      // form submit
      self.element.on('submit' + nameSpace, 'form', function(e) {
        self.inputField.blur();
        self.element.trigger( 'filterFormSubmit', [ self.inputField.val() ] );
        e.stopPropagation();
        return false;
      });

      // keydown
      self.element.find( 'input' ).on( 'keydown' + nameSpace, function() {
      });

      // clear
      self.element.on( 'clear' + nameSpace, function( e ) {
        self.clear();
      });
    };

    Gauge.prototype.clear = function() {
      var self = this;
    };

    $.fn[ pluginName ] = function( options ) {
      return this.each( function() {
        $.data( this, pluginName, new MyPlugin( this, options ) );
      } )
    };

    return MyPlugin;
  };


} )( jQuery, window, this );
