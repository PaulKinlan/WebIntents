/**
 * <: jquery.jspath.1.0.rc0 :>
 * 
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * jQuery.jsPath   
 * 
 * A jquery-collection for javascript objects, using jsonpath
 * for selectors. Dependencies are built-in for convenience
 */
(function(){
    /**
     * jQuery.Collection
     * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com
     * Licensed under GPL license (http://www.opensource.org/licenses/gpl-license.php).
     * Date: 1/28/2008
     *
     * @projectDescription Extensible and inheritable jQuery-like collections
     * @author Ariel Flesler
     * @version 1.0.3
     *
     * @id $.collection
     * @param {  , Array } items Any amount of items for the collection, this is a generic (and the base) collection.
     * @return { $.collection } Returns a generic $.collection object.
     *
     * @id $.collection.build
     * @return {subclass of $.collection} Returns a subclass of it's caller ( $.collection in the first case ).
     */
    (function( $ ){
    	
    	var 
    		f = function(){},
    		emptyInstance = function( c ){//get an instance of this constructor, without calling it
    			f.prototype = (c._constructor||c).prototype;
    			return new f();
    		},
    		callConstructor = function( obj, args ){//calls the constructor of the object, passing an empty object.
    			return obj.init.apply(emptyInstance(obj), args);
    		},
    		getConstructor = function(){//generate a constructor for a new collections
    			return(function( list ){
    				var constructor = arguments.callee,
    					obj = this instanceof constructor ? this : emptyInstance(constructor);
    				if( list && list._constructor === constructor ){//special case, cloning
    					return obj.setArray( list.get() );
    				} return obj.init.apply(obj,arguments);
    			});	
    		};
    	
    	var $collection = $.collection = getConstructor();//$.collection is a valid collection itself
    	
    	$.extend( $collection, {
    		extend: $.extend,
    		fn:$collection.prototype,
    		statics:'extend,build,include,implement',
    		build:function(){//creates a new collection, that include this collections prototype
    			//inheritance is possible, all collection will first inherit from $.collection
    			var constr = getConstructor();
    			
    			//copy the statics
    			this.include( constr, this, $collection.statics );
    			//create inheritance.
    			constr.prototype = constr.fn = emptyInstance(this);
    			constr._constructor = constr.fn._constructor = constr.fn.constructor = constr;//we could lose it
    			
    			return constr;
    		},
    		//imports the given methods (names) into target, from source (optional parse function)
    		include:function( target, source, methods, parse ){
    			if( !methods || !methods.slice ){
    				var args = Array.prototype.slice.call(arguments);
    				args.unshift(this); //insert 'this' first
    				return this.include.apply(this,args);//call again with fixed arguments
    			}
    			$.each( methods.split ? methods.split(/\s?,\s?/) : methods, function( i, func ){
    				target[func] = parse ? parse(source[func], func, source) : source[func];
    			});
    			return target;
    		},
    		//same as include, but when calling an implemented function, it will map EACH matched element.
    		implement:function( source, methods ){
    			this.fn.include( source, methods, function( method ){
    				return function(){
    					var args = arguments;
    					return this.map(function(){
    						return method.apply(this,args);
    					});
    				};
    			});
    		}
    	});
    	
    	$collection.extend( $collection.fn, {
    		extend:$collection.extend,
    		include:$collection.include,
    		init:function( els ){//IMPORTANT: this is the main function to rewrite for each collection.
    			//init should always call setArray with the array of parsed items, to keep jQuery's array structure.
    			var items = typeof els == 'object' && 'length' in els ? els : arguments;
    			return this.setArray( items );//this is just a generic init.
    		},
    		filter:function( filter ){//TODO: add more filtering options
    			if( typeof filter != 'function' ){
    				var out = filter.constructor == Array ? filter : [filter];
    				filter = function(){ return $.inArray( this, out ) != -1; };
    			}
    			return this.pushStack($.grep( this, function( e, i ){
    				return filter.call( e, i );
    			}));
    		},
    		not:function( right ){
    			right = this.filter(right);
    			return this.filter(function(){
    				return $.inArray( this, right ) == -1;
    			});
    		},
    		is:function( s ){
    			return !!(s && this.filter( s ).length);
    		},
    		add:function(){
    			return this.pushStack( $.merge(this.get(), callConstructor(this,arguments) ) );
    		},
    		pushStack:function(items){
    			var ret = emptyInstance(this).setArray( items.get ? items.get() : items  );
    			ret.prevObject = this;
    			return ret;
    		},
    		end:function(){
    			return this.prevObject || callConstructor(this);
    		},
    		attr:function( key, value ){
    			return value === undefined ? this[0] != null && this[0][key] : this.each(function(){
    				this[key] = value;
    			});
    		}
    	});
    	//all these methods can be used in the collections, and are exactly (and literally) like in jQuery.
    	$collection.fn.include( $.fn, 'each,extend,index,setArray,get,size,eq,slice,map,andSelf' );
    		
    })( jQuery );
    
    
    // Map over jsPath in case of overwrite
    if ( window.jsPath )
      var _jsPath = window.jsPath;
    
	//Basic JSON Path Utilities (thin wrap of jsonpath.js)
	jsPath = jQuery.collection.build();
    
    // Map over the _ in case of overwrite
    if ( window._ )
      var $_ = window._;
      
    // Map the jsPath namespace to the '$' one
    window._ = jsPath;
    

	
	var __context__ = {};
	
	jsPath.fn.init = function(path, jsObject, pathOrResult){
		if(arguments.length === 0){
			return this.setArray(__context__.length?
				__context__:[__context__]);
		}
		if (!jsObject) {
			jsObject = __context__;
		}
		//in single arg case, if not a string
		//it should set the context.
		if (!(typeof path == "string")) {
			__context__ = path;
			return this.setArray(__context__.length?
				__context__:[__context__]);
		}else{
			//we save the user from having to prepend $ on every query
			path = "$"+path;
		}
		var result = jsonPath(jsObject, path, pathOrResult)||[];
		return this.setArray(result);
	};
	
	jsPath.fn.include( Array.prototype, 'join,push' );
	
	jsPath.fn.toString = function(js){
		return Array.prototype.join.apply(this, [' ']);
	};
	
	jsPath.fn.x = function(js){
		return '{'+Array.prototype.join.apply(this, [' '])+'}';
	};
	
	/* JSONPath 0.8.0 - XPath for JSON
	 *
	 * Copyright (c) 2007 Stefan Goessner (goessner.net)
	 * Licensed under the MIT (MIT-LICENSE.txt) licence.
	 */
	function jsonPath(obj, expr, arg) {
	   var P = {
	      resultType: arg && arg.resultType || "VALUE",
	      result: [],
	      normalize: function(expr) {
	         var subx = [];
	         return expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
	                    .replace(/'?\.'?|\['?/g, ";")
	                    .replace(/;;;|;;/g, ";..;")
	                    .replace(/;$|'?\]|'$/g, "")
	                    .replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
	      },
	      asPath: function(path) {
	         var x = path.split(";"), p = "$";
	         for (var i=1,n=x.length; i<n; i++)
	            p += (/^[0-9*]+$/).test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
	         return p;
	      },
	      store: function(p, v) {
	         if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
	         return !!p;
	      },
	      trace: function(expr, val, path) {
	         if (expr) {
	            var x = expr.split(";"), loc = x.shift();
	            x = x.join(";");
	            if (val && val.hasOwnProperty(loc))
	               P.trace(x, val[loc], path + ";" + loc);
	            else if (loc === "*")
	               P.walk(loc, x, val, path, function(m,l,x,v,p) { P.trace(m+";"+x,v,p); });
	            else if (loc === "..") {
	               P.trace(x, val, path);
	               P.walk(loc, x, val, path, function(m,l,x,v,p) { typeof v[m] === "object" && P.trace("..;"+x,v[m],p+";"+m); });
	            }
	            else if (/,/.test(loc)) { // [name1,name2,...]
	               for (var s=loc.split(/'?,'?/),i=0,n=s.length; i<n; i++)
	                  P.trace(s[i]+";"+x, val, path);
	            }
	            else if (/^\(.*?\)$/.test(loc)) // [(expr)]
	               P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";")+1))+";"+x, val, path);
	            else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
	               P.walk(loc, x, val, path, function(m,l,x,v,p) { if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m)) P.trace(m+";"+x,v,p); });
	            else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
	               P.slice(loc, x, val, path);
	         }
	         else
	            P.store(path, val);
	      },
	      walk: function(loc, expr, val, path, f) {
	         if (val instanceof Array) {
	            for (var i=0,n=val.length; i<n; i++)
	               if (i in val)
	                  f(i,loc,expr,val,path);
	         }
	         else if (typeof val === "object") {
	            for (var m in val)
	               if (val.hasOwnProperty(m))
	                  f(m,loc,expr,val,path);
	         }
	      },
	      slice: function(loc, expr, val, path) {
	         if (val instanceof Array) {
	            var len=val.length, start=0, end=len, step=1;
	            loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g,
	                function($0,$1,$2,$3){start=parseInt($1||start,10);end=parseInt($2||end,10);step=parseInt($3||step,10);});
	            start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
	            end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
	            for (var i=start; i<end; i+=step)
	               P.trace(i+";"+expr, val, path);
	         }
	      },
	      eval: function(x, _v, _vname) {
	         try { return $ && _v && eval(x.replace(/@/g, "_v")); }
	         catch(e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
	      }
	   };
	
	   var $ = obj;
	   if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
	      P.trace(P.normalize(expr).replace(/^\$;/,""), obj, "$");
	      return P.result.length ? P.result : false;
	   }
	};
    	
    
})();
