(function() {
	
	define(function() {
		
		function RedirectPolicy() {
			this.policies = {};
		}
		
		RedirectPolicy.prototype.addPolicy = function(name, newPolicy) {
			this.policies[name] = newPolicy;
		};
		
		RedirectPolicy.prototype.removePolicy = function(name) {
			delete this.policies[name];
		};
		
		RedirectPolicy.prototype.allow = function() {
			try {
				for(name in this.policies) {
					var policyFunc = this.policies[name];
					
					if(!policyFunc()) {
						return false;
						break;
					}
				}
			} catch(e) {
				// 정책이 오류가 있더라도 true로 통과시킨다. false로 리턴시키면 사용자 불편만 초래할 듯...
				return true;
			}
			
			return true;
		};
		
		return RedirectPolicy;
	});
	
})();