define("system/views/tmw_config", function(require) {

	var GO = require("app");
	var Backbone = require("backbone");

	var TMWModel = require("system/models/tmw_config");
	var TMWTmpl = require("hgn!system/templates/tmw_config");

	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var boardLang = require("i18n!board/nls/board");

	require("jquery.go-validation");

	var lang = {
			label_edit: commonLang["수정"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_fail: commonLang["실패"],
			label_failDesc: commonLang["실패했습니다."],
			label_sucess: commonLang["저장되었습니다."],
			label_ko: adminLang["KO"],
			label_en: adminLang["EN"],
			label_jp: adminLang["JP"],
			label_zhcn: adminLang["ZH-CN"],
			label_zhtw: adminLang["ZH-TW"],
			label_usage : adminLang["사용여부"],
			label_order : adminLang["정렬여부"],
			label_use : commonLang["사용"],
			label_no_use : commonLang["사용하지 않음"],
			label_folder_name : adminLang["폴더명"],
			label_add : commonLang["추가"],
			label_delete : commonLang["삭제"]
			};

	var TmwConfigView = Backbone.View.extend({

		events : {
			"click .ic_edit" : "editText",
			"click #btn_add_tmw" : "addTMWServer",
			"click #btn_delete_tmw" : "deleteTMWServer",
			"click #btn_ok" : "saveTMWConfig",
			"click input:radio[name='useTmw']" : "changeUseTMWFolder"
		},

		initialize : function() {
			this.tmwModel = TMWModel.get();
		},

		render : function() {
			var self = this;
			$('.breadcrumb .path').html(adminLang["TMW 연동"]);

			this.$el.html(TMWTmpl({
				lang : lang,
				data : this.tmwModel.toJSON()
			}));

			$.each(this.tmwModel.toJSON().serverInfos, function(k, v) {
				this.$el.find("#tmwServerInfos").append(self.makeServerInfoOption(v.server, v.port, v.key));
			});
			return this.$el;
		},

		editText : function(e) {
			var targetEl = $(e.currentTarget).closest("td");
			targetEl.find(".editable").hide();
			targetEl.find("input:text").show();
		},

		addTMWServer : function() {
			var self = this;
			var server = this.$el.find("#tmwServer").val();
			var port = this.$el.find("#tmwPort").val();
			var key = this.$el.find("#tmwKey").val();

			if(!$.goValidation.validateURL(server)) {
				self.showValidateMsg("tmwServer", boardLang["잘못된 url입니다."]);
				return;
			}
			this.$el.find("#tmwServerValidate").empty();

			if(!$.goValidation.isNumber(port)) {
				self.showValidateMsg("tmwPort", adminLang["숫자만 입력하세요."]);
				return;
			}
			this.$el.find("#tmwPortValidate").empty();

			if(key.length != 8) {
				self.showValidateMsg("tmwKey", adminLang["키는 8자리여야합니다."]);
				return;
			}
			this.$el.find("#tmwKeyValidate").empty();

			this.$el.find("#tmwServer").val("");
			this.$el.find("#tmwPort").val("");
			this.$el.find("#tmwKey").val("");

			this.$el.find("#tmwServerInfos").append(this.makeServerInfoOption(server, port, key));
		},

		deleteTMWServer : function() {
			this.$el.find("#tmwServerInfos option:selected").remove();
		},

		saveTMWConfig : function() {
			var self = this;

			var koLabel = this.$el.find("#tmwKoLabel").val();
			var enLabel = this.$el.find("#tmwEnLabel").val();
			var jaLabel = this.$el.find("#tmwJaLabel").val();
			var zhcnLabel = this.$el.find("#tmwZhcnLabel").val();
			var zhtwLabel = this.$el.find("#tmwZhtwLabel").val();

			var selectTMWFolder = this.$el.find("input:radio[name='useTmw']:checked").val();
			var selectSpamFolder = this.$el.find("input:radio[name='useSpam']:checked").val();

			var serverInfos = [];
			$.each(this.$el.find("#tmwServerInfos option"), function(k, v) {
				serverInfos.push({
					id : k,
					server : v.getAttribute("data-server"),
					port : v.getAttribute("data-port"),
					key : v.getAttribute("data-key")
				});
			});

			self.tmwModel.set("useTMWFolder", selectTMWFolder == 'on' ? true : false);
			self.tmwModel.set("useSpamFolder", selectSpamFolder == 'on' ? true : false);
			self.tmwModel.set("koLabel", koLabel);
			self.tmwModel.set("enLabel", enLabel);
			self.tmwModel.set("jaLabel", jaLabel);
			self.tmwModel.set("zhcnLabel", zhcnLabel);
			self.tmwModel.set("zhtwLabel", zhtwLabel);
			self.tmwModel.set("serverInfos", serverInfos);


			self.tmwModel.save({}, {
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(lang['label_sucess']);
						self.tmwModel = TMWModel.get();
						self.render();
					}
				},
				error : function(model, response) {
					$.goAlert(lang['label_fail'],lang['label_failDesc']);
				}
			})
		},

		makeServerInfoOption : function(server, port, key) {
			var displayStr = server + ":" + port + ", KEY : " + key;
			var optionStr = '<option value="' + displayStr + '" data-server="' + server + '" data-port="' + port + '" data-key="' + key + '">' + displayStr + '</option>'  ;
			return optionStr;
		},

		showValidateMsg : function(targetId, msg) {
			$('#' + targetId).focus();
			$('#' + targetId + 'Validate').html(msg);
		},

		changeUseTMWFolder : function(e) {
			if($(e.currentTarget).val() == "on") {
				this.$el.find("#tmwDetailInfo").show();
			} else {
				this.$el.find("#tmwDetailInfo").hide();
			}
		}
	},{
		__instance__: null
	});

	function privateFunc(view, param1, param2) {
	}

	return TmwConfigView;
});
