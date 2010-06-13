
(function(jQuery) {

  /* simple method for creating queues */
  var lifedraft_events_queue = function() {
    
    var _queue = [],
        _pointer = 0;
    
    
    /* Use this to add item to the queue, returns the index of new inserted item. */
    this.add = function(item, args) {
      return _queue.push({args: args, item: item});
    };
    
    /* Use this to create delimiters with in the queue. */
    this.cut = function(item, args) {
      return _queue.push("cut");
    };
    
    /* Use this to go forward in the queue. Optionaly you can set the start pointer */
    this.next = function(next) {
      
      if (next) {
        _pointer = next;
      };
      
      /* stop executing the queue if the "cut" delimiter is reached */
      if (_queue[_pointer] == "cut") {
        return;
      };
      
      
      if(_queue[_pointer]) {
        
        /* save current pointer, this is magic here, think about it! */
        var _current = _pointer;
        /* increase the pointer */
        _pointer++;
        
        _queue[_current].item.apply(_queue[_current].item, _queue[_current].args);
        
        /* bring the loop back */
        if(_queue.length >= _pointer) {
          _pointer = 0;
        }
      
      }

    };
    
  };
  
  /* names of triggers that could potentially start our queue */
  var trigger = ("blur,change,click,dblclick,error,focus,keydown,keypress,keyup,"+
  "mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,"+
  "resize,scroll,select,submit,unload").split(",");
  
  /* Implementation of the jQuery methods, every one can use */
  jQuery.fn.lifedraft_events = function() {
    
    /* why does everybody calls this variable self instead of _this? */
    var _this = this,
        /* our functions we return to simulate jQuery's chain */
        functions = {},
        /* initialize our queue for later use */
        _queue = new lifedraft_events_queue();

    /* create our function wrapper around every jQuery's function */
    for (var name in jQuery.fn) {
      
      /* we dont't want to double intialize our plugin. Or should we be able? */
      if (name == "lifedraft_events") { continue; };
      
      /* for some reasons jQuery.each did not done the work with object here,
         the following is almost the same! */
      (function(_name) {
        
        /* this function is invoked in our chain */
        functions[_name] = function() {
          /* save the arguments this function was invoked */
          var args = arguments;
          
          /* add this call to the queue */
          _queue.add(function() {
            /* call jQuery's function with the given arguments and ovewrite _this */
            _this = _this[_name].apply(_this, args);
            /* go forward in the queue */
            _queue.next();
          }, args);
          
          /* queue must go on */
          return functions;
          
        };
        
      })(name);
    
    };
    

    jQuery.each(trigger, function(index, name) {
      
      /* override default behaviours with custom functions */
      functions[name] = function() {
        /* ambiguous _queue.cut invoke creates separates the queue cycles from anoter */
        var index = _queue.cut();
        
        /* attach the dafault handler to _this and wait to start the queue */
        _this[name](function() {
          _queue.next(index);
        });
        
        /* queue must go on */
        return functions;
        
      };
      
    });
    
    /* needing this to start over with querieng the dom, find isn't just enough */
    functions.jQuery = function() {
      
      var args = arguments;
      _queue.add(function() {
        
        _this = jQuery.apply(jQuery, args);
        _queue.next();
        
      });
      
      /* queue must go on */
      return functions;
      
    };
    
    
    /* I think this coud be handy */
    functions._if = function(func) {
      
      /* add this call to the queue */
      _queue.add(function() {
        
        /* if this'll be invoked, than test for truth */
        if (func.apply(_this)) {
          /* go forward in the queue */
          _queue.next();
        };
        
      });
      
      /* queue must go on */
      return functions;
      
    };
    
    return functions;
    
  };

})(jQuery);
