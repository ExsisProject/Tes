define(function(require){
	var App = require("app");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var mamTmpl = require("hgn!admin/templates/mobile_access_block_config");
	var MobileConfig = require("models/mobile_config");
	var MobileContactListExposureView = require('admin/views/mobile_contact_list_exposure');
	
	var tmplVal = {
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"],
		label_not_use: adminLang["사용안함"],
		label_use: commonLang["사용"],
		label_attachment_download: adminLang["첨부파일 다운로드"],
		label_mam_title: adminLang["모바일 앱 접속차단 설정"],
		label_app_access: adminLang["모바일 앱 접속기기 관리"],
		mam_desc: adminLang["mam설명"],
		label_device: commonLang["기기명"],
		label_last_connect_time: commonLang["마지막 접속시간"],
		label_deviceid: adminLang["DeviceId"],
		label_access_setting: commonLang["접속설정"],
		label_empty: adminLang["등록된 모바일 기기 정보가 없습니다."],
		label_search: commonLang["검색"],
		label_delete: commonLang["삭제"],
		label_email: commonLang["이메일"],
		label_name: commonLang["이름"],
		label_tooltip: adminLang["mam툴팁"],
		alert_error: commonLang['500 오류페이지 타이틀'],
		noti_block: commonLang["접속차단알림"],
		noti_block_sub: commonLang["차단알림부제"],
		noti_access: commonLang["접속허용알림"],
		noti_access_sub: commonLang["허용알림부제"],
		noti_delete: commonLang["등록기기삭제"]
	};
	 
	var DeviceModel = Backbone.Model.extend({
		initialize: function (options) {
			this.id = options.id;
		},
	
		url: function () {
			return GO.contextRoot + 'ad/api/mobile/device/' + this.id;
	    }
	});
	
    var DeviceCollectionModel = Backbone.Collection.extend({
        initialize: function (options) {
            this.searchType = options.searchType || "";
            this.keyword = options.keyword || "";
        },

        url: function () {
            return GO.contextRoot + 'ad/api/mobile/device?searchType=' + this.searchType + "&keyword=" + this.keyword;
        },

        model: DeviceModel
    });

	
	var MobileAccessManagementView = Backbone.View.extend({
		CLASS: {
            BLOCKED: 'ic_off',
            ALLOWED: 'ic_on'
        },
        
        initialize: function () {
            this.model = new MobileConfig({
                adminContext: true
            });

            this.model.fetch({async: false});
        	
        	var searchParam = {
    			"searchType": "user.name",
    			"keyword": "initialize"
            }

            this.deviceListCollection = new DeviceCollectionModel(searchParam);
        },
        
        events: {
            "click span#btn_ok": "_mamSave",
            "click span#btn_cancel": "_mamCancel",
            "click span.btn_search": "_search",
            "keydown span.search_wrap input": "_searchKeyboardEvent"
        },
        
        render: function () {
        	var self = this,
    		data = this.model.toJSON();
    	
	        this.$el.html(mamTmpl({
	            lang: tmplVal,
	            model: data
	        }));
	
	        this._showMobileDeviceRenderList();

	        this.mobileContactListExposureView  = new MobileContactListExposureView;
            this.mobileContactListExposureView.render();
        },
        
        _showMobileDeviceRenderList: function (param) {
            var self = this;

            this.deviceListCollection.fetch(param).done($.proxy(this._deviceRenderList, this)).fail(function (resp) {
                $.goAlert(tmplVal.alert_error);
            });

            this._bindDeviceListEvents();
        },

        _deviceRenderList: function () {
            this.$el.find('#device_list').html(this._deviceListTmp().render(this._makeListData()));
        },

        _deviceListTmp: function () {
            var template = [];
            template.push('{{^deviceList}}');
            template.push('<tr class="topMenu">');
            template.push('		<td colspan="5">');
            template.push('			<p class="data_null">');
            template.push('				<span class="ic_data_type ic_no_data"></span>');
            template.push('				<span class="txt">{{noAccessDevice}}</span>');
            template.push('			</p>');
            template.push('		</td>');
            template.push('</tr>');
            template.push('{{/deviceList}}');
            template.push('{{#deviceList}}');
            template.push('<tr class="topMenu" data-device-id={{id}}>');
            template.push('		<td class="align_c" name="device">{{deviceName}}</td>');
            template.push('		<td class="align_c" name="email">{{email}}</td>');
            template.push('		<td class="align_c" name="contact">{{lastAccessTime}}</td>');
            template.push('		<td class="align_c" name="address">{{deviceId}}</td>');
            template.push('		<td class="align_c mam_toggle" name="toggle">');
            template.push('			<span class="device_access_setting ic ic_on {{deviceAccessOnOff}}"></span>');
            template.push('		</td>');
            template.push('		<td class="align_c mam_delete" name="delete">');
            template.push('			<span class="device_access_delete ic ic_delete" title="{{lang.delete}}"></span>');
            template.push('		</td>');
            template.push('</tr>');
            template.push('{{/deviceList}}');

            return Hogan.compile(template.join("\n"));
        },

        _noticeTmp: function (title, sub) {
            var template = [];
            template.push('<div class="content">');
            template.push('			<p class="q">' + title + '</p>');
            if (sub) {
                template.push('		<p class="add">' + sub + '</p>');
            }
            template.push('</div>');

            return Hogan.compile(template.join("\n"));
        },

        _makeListData: function () {
            var data = {
                noAccessDevice: tmplVal.label_empty,
                deviceList: []
            };

            data.deviceList = this.deviceListCollection.map(function (model) {
                return {
                    id: model.get('id'),
                    email: model.get('email'),
                    deviceName: model.get('deviceLabel'),
                    lastAccessTime: GO.util.basicDate3(model.get('lastConnected')),
                    deviceId: model.get('deviceId'),
                    deviceAccessOnOff: model.get('blocked') ? this.CLASS.BLOCKED : this.CLASS.ALLOWED
                }
            }, this);

            return data;
        },

        _bindDeviceListEvents: function () {
            this.$el.off('click', 'span.device_access_setting');
            this.$el.off('click', 'span.device_access_delete');

            this.$el.on('click', 'span.device_access_setting', $.proxy(this._onAccessSettingClicked, this));
            this.$el.on('click', 'span.device_access_delete', $.proxy(this._onAccessDeleteClicked, this));
        },

        _onAccessSettingClicked: function (e) {
            e.stopPropagation();

            var self = this,
                $target = $(e.currentTarget),
                id = $target.parents('tr').attr('data-device-id'),
                blocked = $target.hasClass(this.CLASS.BLOCKED);

            var title, subTitle;
            if (!blocked) {
                // 차단시
                title = tmplVal.noti_block;
                subTitle = tmplVal.noti_block_sub;
            } else {
                // 허용시
                title = tmplVal.noti_access;
                subTitle = tmplVal.noti_access_sub;
            }

            this.notiPopup = $.goPopup({
                pclass: "layer_confim layer_colleage",
                modal: true,
                width: "460px",
                closeIconVisible: false,
                contents: this._noticeTmp(title, subTitle).render(),
                buttons: [{
                    'btext': commonLang["확인"],
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': function () {
                        self._accessSettingProc(id, blocked);
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });
        },

        _accessSettingProc: function (id, blocked) {
            var self = this,
                model = this.deviceListCollection.get(id);
            model.set('blocked', !blocked);
            model.save().done($.proxy(function (m) {
                this.notiPopup.close();
                this._deviceRenderList();
            }, this));
        },

        _onAccessDeleteClicked: function (e) {
            e.stopPropagation();

            var self = this,
                id = $(e.currentTarget).parents('tr').attr('data-device-id'),
                title = tmplVal.noti_delete;

            this.delPopup = $.goPopup({
                pclass: "layer_confim layer_colleage",
                modal: true,
                width: "460px",
                closeIconVisible: false,
                contents: this._noticeTmp(title).render(),
                buttons: [{
                    'btext': commonLang["확인"],
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': function () {
                        self._onAccessDeleteProc(id);
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });
        },

        _onAccessDeleteProc: function (id) {
            var model = this.deviceListCollection.get(id);
            model.destroy().done($.proxy(function (m) {
                this.delPopup.close();
                this._deviceRenderList();
            }, this));
        },

        _search: function (e) {
            //e.stopPropagation();
            var searchForm = this.$el.find('.search_wrap input[type="text"]'),
                keyword = searchForm.val();

            var searchParam = {
                "searchType": this.$el.find('.device_search select').val(),
                "keyword": encodeURIComponent(keyword)
            };

            this.deviceListCollection = new DeviceCollectionModel(searchParam);
            this._showMobileDeviceRenderList();
        },

        _searchKeyboardEvent: function (e) {
            if (e.keyCode == 13) {
                this._search();
            }
        },
        
        _mamSave : function(e) {
        	e.stopPropagation();
            var self = this;
            var saveData = {
        		useAppManagement: $('form[name=formMAMConfig] input[type="radio"]:checked').val()
            };
            self.model.save(saveData, {
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        self.render();
                    }
                },
                error: function (model, response) {
                    var responseData = JSON.parse(response.responseText);
                    if (responseData.message != null) {
                        $.goMessage(responseData.message);
                    } else {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                }
            });
        },
        
        _mamCancel: function (e) {
            e.stopPropagation();

            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);
        },
        
	});
	return MobileAccessManagementView;
});