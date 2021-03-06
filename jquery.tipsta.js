/**
 * Tipsta - jQuery plugin to display custom animated tooltips for image maps
 *
 * @version 1.0.1 (2010 April 13th)
 * @require jQuery 1.4 or above
 * @require jQuery easing functions 1.3+ (for animation effects)
 *
 * @author Greg Knapp (virtual dot greg at gmail dot com)
 * http://www.gregk.co.uk/software/tipsta
 *
 * This software is licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
  $.fn.tipsta = function(options) {  
    options = $.extend({}, $.fn.tipsta.defaults, options);
        
    function _sortAsc(a, b) {
      return a - b;
    }
  
    function _getNumeric(value) {
      value = value.replace(/[^\-\.0-9]/g, "");
      
      if (value == "") {
        value = 0;
      }
      
      return Math.round(parseFloat(value));
    }
    
    function _isImageMap(elem) {
      var result = false;
      
      if (elem.attr("tagName").toLowerCase() == "map") {
        result = true;
      }
      
      return result;
    }
            
    function _createTip(id) {
      var tt = $("<div>").attr("id", id);
      
      if (arguments[1]) { // caption specified
        tt.html(arguments[1]);
      }
    
      if (options.cssClass != "") {
        tt.addClass(options.cssClass);
      }
    
      return tt.appendTo(options.anchor);      
    }
    
    function _getCaption(elem, cap) {
      var ttl = elem.attr("title");
      
      // make title attr blank to stop 
      // tooltip being displayed in IE
      // note: does not work for imagemaps
      elem.attr("title","");
        
      if (cap !== undefined && cap != "") { // caption specified
        return cap;
      }
    
      // try to obtain caption from 'alt' or 'title' attribute
      var caption = "<no caption>";
        
      if (_isImageMap(elem)) {
        // use area attributes, if one exists
        var area = elem.find("area");
        
        if (area.length) {
          // if more than one area, use idx specified
          elem = (area.length > 1) ? area[options.area] : area;
        }
      }
      
      var alt = elem.attr("alt");
      
      if (alt !== undefined && alt != "") { // use alt
        caption = alt;
      } else if (ttl !== undefined && alt != "") { // use title
        caption = ttl;
      }
      
      return caption;
    }

    function _calcPosition(elem, tip) {
      var top = 0;
      var left = 0;
      var p; // parent element
      var i, j;
    
      if (_isImageMap(elem)) {
        var area = elem.find("area");
          
        if (area.length) {
          // if more than one area, use idx specified
          area = (area.length > 1) ? area[options.area] : area;
        } else {
          throw new Error(
            "No area found for image map '" + elem.attr("id") + "'"
          );
        }
        
        var coords = area.attr("coords").split(",");
        var x = [];
        var y = [];
        var v;
        
        for (i = 1, j = coords.length; i <= j; i++) {
          v = parseInt(coords[i-1], 10);
          
          if (i / 2 != Math.round(i / 2)) { // odd
            x[x.length] = v;
          } else { // even
            y[y.length] = v;
          }
        }
        
        x.sort(_sortAsc);
        y.sort(_sortAsc);
      
        // calc dimensions, max - min
        var mapHeight = y[y.length - 1] - y[0];
        var mapWidth  = x[x.length - 1] - x[0];
        
        top = mapHeight + y[0];
        left = Math.round(mapWidth / 2) + x[0];
      
        // get the image using this map
        var img;
        
        $.each($("img[usemap]"), function(i, image) {
            image = $(image);

            if (image.attr("usemap").substr(1) == elem.attr("id")) {
                img = image;
            }
        });
        
        if (!img.length) {
          throw new Error(
            "Could not find an image using map: " + elem.attr("id")
          );
        }
        
        // look for parent to obtain top/left/margin/padding
        p = $(img).parent();
      } else {
        p = elem.parent();
      }
  
      // css attributes that can contribute to positioning    
      var attrs = ["","margin-","padding-"];
      var offset = { x: options.x, y: options.y };
      
      // add values to offset
      for (i = 0, j = attrs.length; i < j; i++) {
        offset.y += _getNumeric(p.css(attrs[i] + "top"));
        offset.x += _getNumeric(p.css(attrs[i] + "left"));
      }
      
      // subtract half the width of tooltip
      // add the vertical padding and margin on the tip
      
      // temporarily set display to block to obtain offsetWidth
      tip.css({ visibility: "hidden", display: "block" });
      offset.x -= Math.round(tip.attr("offsetWidth") / 2);
      tip.css({ visibility: "visible", display: "none" });
      
      offset.y += _getNumeric(tip.css("padding-top"));
      offset.y += _getNumeric(tip.css("margin-top"));
      
      top += offset.y;
      left += offset.x;
      
      return { top: top, left: left };
    }

    return this.each(function() {
      if (!$(this).length) {
        throw new Error("Cannot find " + $(this).attr("id") + " in document");
      }
      
      var id = $(this).attr("id") + "_tip";
      var tip = $(id);
      
      if (!tip.length) {
        tip = _createTip(
          id, _getCaption($(this), options.caption)
        );
      }
      
      var position = _calcPosition($(this), tip);

      tip.css("top", position.top);
      tip.css("left", position.left);
      
      $(this).hover(
        function(e) {
          // prevent queue backlog if mouseover tooltip
          if (tip.queue("fx").length > 1) {
            tip.clearQueue();
            return;
          }
          
          tip.fadeIn(options.duration).animate(
            { top: position.top - options.distance },
            {
              duration: options.duration,
              easing: options.easing,
              queue: false
            }
          );
        },
        function(e) {
          tip.animate(
            { top: position.top },
            {
              duration: options.duration,
              easing: options.easing,
              queue: false
            }
          ).fadeOut(options.duration);
        }
      );
    });
  };
})(jQuery);

$.fn.tipsta.defaults = {
  anchor: "body",
  area: 0,
  caption: "",
  cssClass: "tooltip",
  distance: 20,
  duration: 120,
  easing: "easeOutQuad",
  x: 0,
  y: 0
};
