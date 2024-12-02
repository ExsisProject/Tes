(function() {
	
	define(["jquery", "normalize"], function($, normalize) {
		
		var RequireMap;
		
		RequireMap = (function() {
			function Klass(profile) {
				this._profile = profile;
				this._vendorPath = '';
				
				this.map = {};
				this.map.common = {};
				this.map.development = {};
				this.map.production = {};
				this.map.test = {};
			}
			
			Klass.prototype.set = function(key, val, profile) {
				this.map[resolveProfile.call(this, profile)][key] = val;
			};
			
			Klass.prototype.get = function(key, profile) {
				return this.map[resolveProfile.call(this, profile)][key];
			};
			
			Klass.prototype.paths = function(key, path, profile) {
				var profileConfig;

				if($.isPlainObject(key) && !!path) {
					profile = path;
				}
				
				profileConfig = this.map[resolveProfile.call(this, profile)];
				
				if(!profileConfig.paths) {
					profileConfig.paths = {};
				}
				
				if($.isPlainObject(key)) {
					profileConfig.path = key;
				} else {
					profileConfig.paths[key] = path;
				}
			};
			
			/**
			 * vendors 경로 등록. paths의 특수 형태
			 * @param key
			 * @param path
			 * @param profile
			 */
			Klass.prototype.vendors = function(key, path, profile) {
				this.paths(key, this.resolveVendorPath(path), profile);
			};
			
			Klass.prototype.setVendorPath = function(path) {
				this._vendorPath = path;
			};
			
			Klass.prototype.getVendorPath = function() {
				return this._vendorPath;
			};
			
			Klass.prototype.resolveVendorPath = function(path, plugin) {
				var normalizedPath = normalize(this.getVendorPath() + '/' + path);
				return !!plugin ? plugin + '!' + normalizedPath : normalizedPath;
			};
			
			Klass.prototype.shim = function(key, setting, profile) {
				var profileConfig;

				if($.isPlainObject(key) && !!setting) {
					profile = setting;
				}
				
				profileConfig = this.map[resolveProfile.call(this, profile)];

				if(!profileConfig.shim) {
					profileConfig.shim = {};
				}
				
				profileConfig.shim[key] = setting;
			};
			
			Klass.prototype.packages = function(settings, profile) {
				var profileConfig = this.map[resolveProfile.call(this, profile)];
				
				if(!profileConfig.packages) {
					profileConfig.packages = [];
				}
				
				profileConfig.packages.push(settings);
			};
			
			Klass.prototype.config = function(key, val) {
				if(!this.map.common.config) {
					this.map.common.config = {};
				}
				
				this.map.common.config[key] = val;
			};
						
			Klass.prototype.profile = function(profile, fn) {
				var nested = new Klass(profile);
				nested.setVendorPath(this.getVendorPath());
				
				fn(nested);
				$.extend(true, this.map[profile], nested.map[profile]);
			};
			
			Klass.prototype.result = function(profile) {
				return $.extend( true, {}, this.map.common, this.map[resolveProfile.call(this, profile)]);
			}; 
			
			Klass.prototype.resolve = function(mapFn) {
				mapFn(this);
			};
			
			Klass.prototype.loadRequire = function(profile) {
				return requirejs.config(this.result(profile));
			};
			
			function resolveProfile(profile) {
				return profile || this._profile || 'common';
			}
			
			return Klass;
		})();
		
		return RequireMap;
	});
	
})();