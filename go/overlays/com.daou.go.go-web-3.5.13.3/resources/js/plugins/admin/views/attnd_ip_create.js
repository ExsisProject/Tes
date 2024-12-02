(function() {
	define([
	"backbone", 
	"app",
	"hgn!admin/templates/attnd_ip_create",
	"hgn!admin/templates/attnd_ip_modify",
	"admin/models/attnd_access_ip",
	"i18n!admin/nls/admin",
	"i18n!nls/commons",
	"jquery.go-sdk"
	],

	function(
	Backbone,
	GO,
	IpCreateTmpl,
	IpModifyTmpl,
	AttndAccessIpModel,
	adminLang,
	commonLang
	) {
		
		var lang = {
				label_access_allow_ip_info : adminLang["접속 허용 IP 정보"],
				label_ip_name : adminLang["접속 IP 이름"],
				label_ip : adminLang["접속 IP 대역"],
				label_save : commonLang["저장"],
				label_cancel : commonLang["취소"],
				label_modify : commonLang["수정"]
		};
		var AttndIpCreate = Backbone.View.extend({
			events : {
				"click #btn_save" : "saveIp",
				"click #btn_cancel" : "reset",
				"keyup #ipName" : "clearAlert"
			},

			initialize : function(options) {
				this.options = options || {};
				this.ipId = this.options.ipId;
				this.model = AttndAccessIpModel.create();
			},

			render : function() {
				if(this.ipId != undefined){
					this.model = AttndAccessIpModel.read(this.ipId);
					var model = this.model.toJSON();
					var ipRange = model.ipRange.split("-");
					model.ip1=ipRange[0].split(".")[0];
					model.ip2=ipRange[0].split(".")[1];
					model.ip3=ipRange[0].split(".")[2];
					model.ip4=ipRange[0].split(".")[3];
					model.ip5=ipRange[1];
					this.$el.html(IpModifyTmpl({
						lang : lang,
						model : model
					}));
				}else{
					this.$el.html(IpCreateTmpl({
						lang : lang
					}));
				}
				return this;

			},
			
			saveIp : function() {
				var self = this,
	        		type = 'POST',
	        		validate = true;
	        	var form = $('form[name=formIpCreate]');
	        	if(this.ipId){
	        		form = $('form[name=formIpModify]');
	        		type = 'PUT';
	        	}
	        	
	        	var ipName = $("#ipName").val();
	        	
		        if(!$.goValidation.isCheckLength(1,255,ipName)){
					validate = false;
					$('#ipNameAlert').html(GO.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"255"}));
					$('#ipName').focus();
				}else if(!$.goValidation.isNumber($("#ip1").val()) 
						|| !$.goValidation.isNumber($("#ip2").val()) 
						|| !$.goValidation.isNumber($("#ip3").val()) 
						|| !$.goValidation.isNumber($("#ip4").val()) 
						|| !$.goValidation.isNumber($("#ip5").val())){
					validate = false;
					$('#ipAlert').html(adminLang['숫자만 입력하세요.']);
				}else if(($("#ip1").val() < 0 || $("#ip1").val() > 255) 
						|| ($("#ip2").val() < 0 || $("#ip2").val() > 255) 
						|| ($("#ip3").val() < 0 || $("#ip3").val() > 255) 
						|| ($("#ip4").val() < 0 || $("#ip4").val() > 255) 
						|| ($("#ip5").val() < 0 || $("#ip5").val() > 255)){
					validate = false;
					$('#ipAlert').html("0~255 사이의 값을 입력해주세요.");
				}
	        	var ipRange = $("#ip1").val() + "." + $("#ip2").val() + "." + $("#ip3").val() + "." + $("#ip4").val() + "-" + $("#ip5").val();
	        	if(validate){
	        		validate = this.validateIpRange(ipRange);
	        	}
	        	
	        	if(!validate){
					return false;
				}
	        	
	        	self.model.set("ipName", $("#ipName").val(), {silent: true});
	        	self.model.set("ipRange", ipRange, {silent: true});

	        	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
	        	this.model.save({}, {
					type : type,
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
							GO.router.navigate("ehr/workplace/manage", {trigger: true});
							//GO.router.navigate("ehr/ip/modify/"+response.data.id, {trigger: true});
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				});
			},
			
			clearAlert : function() {
				if($('#ipName').val().length){
					$('#ipNameAlert').html('');
				}
			},
			
			reset : function() {
				this.render();
			},
			
			validateIpRange : function(ip) {
				var valid = false;
				$.go(GO.contextRoot + 'ad/api/ehr/attnd/ip/check?ip='+ip + "&excludeip=" + this.model.attributes.ipRange, "", {
					async : false,
					qryType : 'GET',					
					contentType : 'application/json',
					responseFn : function(response) {
						valid = true;
					},
					error: function(response){
						var responseData = JSON.parse(response.responseText);
						$.goMessage(adminLang["접속 IP 대역이 중복되었습니다."]);
						valid = false;
					}
				});
				return valid;
			}

		});

		function privateFunc(view, param1, param2) {

		}

		return AttndIpCreate;

	});

})();