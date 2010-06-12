
(function(jQuery) {

  var lifedraft_events_queue = function() {
    
    var _queue = [],
        _pointer = 0;
    
    this.add = function(item, args) {
      return _queue.push({args: args, item: item});
    };
    
    this.cut = function(item, args) {
      return _queue.push("cut");
    };
    
    this.next = function(next) {
      
      if (next) {
        _pointer = next;
      };
      
      if (_queue[_pointer] == "cut") {
        return;
      };
      
      if(_queue[_pointer]) {
        
        var _current = _pointer;
        _pointer++;
        _queue[_current].item.apply(_queue[_current].item, _queue[_current].args);
        
        if(_queue.length >= _pointer) {
          _pointer = 0;
        }
      
      }

    };
    
    this.reset = function() {
      _pointer = 0;
    };
    
  };
  
  var trigger = ("blur,change,click,dblclick,error,focus,keydown,keypress,keyup,"+
  "mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,"+
  "resize,scroll,select,submit,unload").split(",");
  
  jQuery.fn.lifedraft_events = function() {
    
    var _this = this,
        functions = {},
        _queue = new lifedraft_events_queue();

    for (var name in jQuery.fn) {
      
      if (name == "lifedraft_events") { continue; };
      
      (function(_name) {
        
        functions[_name] = function() {
          
          var args = arguments;
          
          _queue.add(function() {
            
            _this = _this[_name].apply(_this, args);
            _queue.next();
          
          }, args);

          return functions;
          
        };
        
      })(name);
    
    };

    jQuery.each(trigger, function(index, name) {

      functions[name] = function() {
        var index = _queue.cut();
        
        _this[name](function() {
          _queue.next(index);
        });
        
        return functions;
        
      };      
    });
    
    
    functions._if = function(func) {
      
      _queue.add(function() {
        
        if (func.apply(_this)) {
          _queue.next();
        };
        
      });
      
      return functions;
      
    };
    
    functions.jQuery = function() {
      
      var args = arguments;
      _queue.add(function() {
        
        _this = jQuery.apply(jQuery, args);
        _queue.next();
        
      });
      
      return functions;
      
    };
    
    return functions;
    
  };

})(jQuery);
