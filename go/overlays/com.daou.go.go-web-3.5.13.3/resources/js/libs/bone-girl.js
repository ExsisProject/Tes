(function(){

	var BoneGirl, 
		global = this, 
		apush = Array.prototype.push, 
		aslice = Array.prototype.slice;

	var _isA = isArray = function(obj) {
		return (obj instanceof Array);
	};

	var _isD = isDate = function(obj) {
		return (obj instanceof Date);
	};

	var _isO = isObject = function(obj) {
		return (typeof obj === 'object');
	};

	var _clone = function(obj, deep) {
		deep = deep || false;
		if(_isA(obj)) return aslice.call(obj);
		if(_isD(obj)) return new Date(obj.getTime());

        var cloned = new Object();
        for(var key in obj) {
            cloned[key] = _isO(obj[key]) && deep ? _clone(obj[key]) : obj[key];
        }
        return cloned;
	};

	var _extend = function() {
		var target = arguments[0], 
			dests = aslice.call(arguments, 1);
		if(!_isO(target)) return;
		for(var _i in dests) {
			var _o = dests[_i];
			if(typeof _o !== 'object') continue;
			for(var _key in _o) {
				target[_key] = _o[_key];
			}
		}
		return target;
	};

	var _checkObj = function(obj) {
		var _o = obj;
		if(typeof Backbone !== 'undefined' && obj instanceof Backbone.Model) {
			_o = obj.attributes;
		} 
		return _o;
	};

	BoneGirl = {
		_attrs: {}, 

		set: function(key, obj) {
			this._attrs[key] = _checkObj(obj);
		}, 

		add: function(key, obj) {
			if(!this._attrs[key]) return this.set(key, obj);
			if(!_isA(this._attrs[key])) this._attrs[key] = [this._attrs[key]];
			this._attrs[key].push(obj);
		}, 

		get: function(key, override) {
			var robj = null;
			override = override || null;
			if(override) {
				var cloned = _clone(this._attrs[key], true);
				robj = _extend(cloned, override);
			} else {
				robj = this._attrs[key];
			}
			return robj;
		}, 

		remove: function(key) {
			if(this._attrs[key]) delete this._attrs[key];
		}, 

		clear: function() {
			this._attrs = null;
			this._attrs = {};
		}
	};

	var bonegirl = function(key, override) {
		return BoneGirl.get(key, override);
	};

	global.BoneGirl = BoneGirl;
	global.bonegirl = bonegirl;

	// support for AMD module
	if(typeof define !== 'undefined') {
		define(function() { return BoneGirl; });
	};

}).call(typeof exports !== 'undefined' ? exports : this);