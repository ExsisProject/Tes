define("admin/views/ehr/timeline/ip/edit", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");

	var IpEditTmpl = require("hgn!admin/templates/ehr/timeline/ip/edit");
	var TimelineAccessIpModel = require("admin/models/ehr/timeline/access_ip");

	var adminLang = require("i18n!admin/nls/admin");
	var commonLang = require("i18n!nls/commons");
	require("jquery.go-sdk");

	var lang = {
		label_access_allow_ip_info : adminLang["접속 허용 IP 정보"],
		label_ip_name : adminLang["접속 IP 이름"],
		label_ip : adminLang["접속 IP 대역"],
		label_save : commonLang["저장"],
		label_cancel : commonLang["취소"],
		label_modify : commonLang["수정"]
	};
	var TimelineAccessIpEdit = Backbone.View.extend({
		events : {
			"click #btn_save" : "saveIp",
			"click #btn_cancel" : "reset",
			"keyup #ipName" : "clearAlert"
		},

		initialize : function(options) {
			this.options = options || {};
			this.workPlaceId = this.options.workPlaceId;
			this.ipId = this.options.ipId;
			if (!this.ipId) {
				this.model = new TimelineAccessIpModel({workPlaceId: this.workPlaceId});
			} else {
				this.model = new TimelineAccessIpModel({id: this.ipId});
			}
		},

		render : function() {
			if(this.ipId){
				this.model.fetch({async: false});
				var model = this.model.toJSON();
				var ipRange = model.ipRange.split("-");
				model.ip1=ipRange[0].split(".")[0];
				model.ip2=ipRange[0].split(".")[1];
				model.ip3=ipRange[0].split(".")[2];
				model.ip4=ipRange[0].split(".")[3];
				model.ip5=ipRange[1];
			}
            this.$el.html(IpEditTmpl({
                lang : lang,
				model : model
            }));
			return this;

		},

		saveIp : function() {
			var self = this,
				validate = true;
			var form = $('form[name=formIpEdit]');

			var ipName = form.find("#ipName").val();

			if(!$.goValidation.isCheckLength(1,255,ipName)){
				validate = false;
                form.find('#ipNameAlert').html(GO.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"255"}));
                form.find('#ipName').focus();
			}else if(!$.goValidation.isNumber(form.find("#ip1").val())
				|| !$.goValidation.isNumber(form.find("#ip2").val())
				|| !$.goValidation.isNumber(form.find("#ip3").val())
				|| !$.goValidation.isNumber(form.find("#ip4").val())
				|| !$.goValidation.isNumber(form.find("#ip5").val())){
				validate = false;
				form.find('#ipAlert').html(adminLang['숫자만 입력하세요.']);
			}else if((form.find("#ip1").val() < 0 || form.find("#ip1").val() > 255)
				|| (form.find("#ip2").val() < 0 || form.find("#ip2").val() > 255)
				|| (form.find("#ip3").val() < 0 || form.find("#ip3").val() > 255)
				|| (form.find("#ip4").val() < 0 || form.find("#ip4").val() > 255)
				|| (form.find("#ip5").val() < 0 || form.find("#ip5").val() > 255)){
				validate = false;
				form.find('#ipAlert').html("0~255 사이의 값을 입력해주세요.");
			}
			var ipRange = form.find("#ip1").val() + "." + form.find("#ip2").val() + "." + form.find("#ip3").val() + "." + form.find("#ip4").val() + "-" + form.find("#ip5").val();
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
			GO.router.navigate('ehr/workplace/manage', true);
		},

		validateIpRange : function(ip) {
			var valid = false;
			$.go(GO.contextRoot + 'ad/api/timeline/ip/check?workplaceid=' + this.workPlaceId +
				'&ip='+ip + "&excludeip=" + this.model.attributes.ipRange, "", {
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

	return TimelineAccessIpEdit;
});