define("admin/views/ehr/timeline/workplace/manage", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");

	var IpManageTmpl = require("hgn!admin/templates/ehr/timeline/workplace/manage");

	var WorkPlaceListView = require('admin/views/ehr/timeline/workplace/work_place_list');
	var WorkPlaceView = require('admin/views/ehr/timeline/workplace/work_place');

	var adminLang = require("i18n!admin/nls/admin");
	var commonLang = require("i18n!nls/commons");
	require("jquery.go-grid");
	require("jquery.go-sdk");
    require("jquery.go-preloader");

	var lang = {
		label_title : adminLang["접속 허용 IP 설정"],
		label_guide : adminLang["접속 허용 IP 설명"],
        label_ip_info : adminLang["접속 허용 IP 정보"],
		label_ip_name : adminLang["접속 IP 이름"],
		label_ip : adminLang["IP"],
		label_use : commonLang["사용"],
		label_not_use : commonLang["사용하지 않음"],
		label_ok : commonLang["저장"],
		label_cancel : commonLang["취소"],
		label_add : commonLang["추가"],
		label_delete : commonLang["삭제"],
		label_access_yn : adminLang["접속 허용 IP 사용 여부"],
		label_workplace_description : adminLang["근무지 설정 설명"]
	};
	var TimelineAccessIpManage = Backbone.View.extend({
		events : {
			'activeWorkPlace #workPlaceList' : 'activeWorkPlaceCallback',
			'activeWorkPlace #workPlace' : 'activeWorkPlaceCallback',
			'inActiveWorkPlace #workPlaceList' : 'inActiveWorkPlaceCallback',
			'renderWorkPlace #workPlaceList' : 'saveAndRenderWorkPlace',
			'reset .container' : 'render',
			'addComplete .wrap_container_right' : 'renderWorkPlaceList',
		},

        render : function() {
			this.$el.html(IpManageTmpl({
				lang : lang,
			}));
			this.renderWorkPlaceList();
            return this;
		},

		renderWorkPlaceList: function () {
			this.workPlaceListView = new WorkPlaceListView({});
			this.workPlaceListView.render();
		},

		activeWorkPlaceCallback : function(e, workPlace) {
			this.$el.find(".work_place").removeClass("active");
			this.$el.find(".work_place[value=" + workPlace.attributes.id + "]").addClass("active");
			if (_.isUndefined(this.workPlaceView))
				this.renderWorkPlace(workPlace);
		},

		activeWorkPlace : function(workPlace) {
			this.$el.find(".work_place").removeClass("active");
			this.$el.find(".work_place[value=" + workPlace.attributes.id + "]").addClass("active");
		},

		inActiveWorkPlaceCallback : function() {
			this.$el.find(".work_place").removeClass("active");
		},

		saveAndRenderWorkPlace : function(e, workPlace) {
			if (this.workPlaceView && !this.workPlaceView.isRemoved()) {
                if (this.workPlaceView.workPlace == workPlace) {
                    return;
                }
                this.saveWorkPlace(workPlace);
			} else {
                this.renderWorkPlace(workPlace);
			}
		},

		saveWorkPlace : function(workPlace) {
            var self = this;
            var saveCallback = function () {
                if (self.workPlaceView.validate()) {
                    self.workPlaceView.save().done(function () {
						self.workPlaceView.remove();
						self.activeWorkPlace(workPlace);
						self.renderWorkPlace(workPlace);
                    });
                }
            };
            var cancelCallback = function () {
                self.workPlaceView.remove();
                self.renderWorkPlace(workPlace);
            };
            if (!self.workPlaceView.isUpdated()) {
                cancelCallback();
                return;
            }
            $.goPopup({
                title: adminLang["저장하시겠습니까?"],
                modal: true,
                buttons: [{
                    btype: 'confirm',
                    btext: commonLang["저장"],
                    callback: saveCallback
                }, {
                    btype: 'close', btext: commonLang["취소"],
                    callback: cancelCallback
                }]
            });
		},

		renderWorkPlace : function (workPlace) {
            workPlace = workPlace ? workPlace : this.workPlaceListView.getCheckedWorkPlace();
            this.workPlaceView = new WorkPlaceView({
                workPlace : workPlace
            });
			this.$el.find('#workPlaceSetting').append(this.workPlaceView.el);
            this.workPlaceView.render();
        }
	});

	return TimelineAccessIpManage;
});
