define([
    "jquery",
    "backbone",
    "app",

    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "hgn!admin/templates/otp_config",

    "jquery.go-grid"
],
function(
    $,
    Backbone,
    App,

    adminLang,
    commonLang,
    layoutTpl
) {

    var instance = null;
    var lang = {
        'label_ok': commonLang['저장'],
        'label_cancel': commonLang['취소'],
        'label_title' : adminLang['기본 설정'],
        'label_otp_login' : adminLang['OTP 로그인'],
        'label_use' : adminLang['사용함'],
        'label_unuse' : commonLang['사용하지 않음'],
        'otp_enabled_users' : adminLang['OTP 사용계정'],
        'otp_disabled_users' : adminLang['OTP 비사용계정'],
        'otp_delete' : adminLang['OTP 기기 삭제'],
        'otp_enable' : adminLang['OTP 사용 계정으로 변경'],
        'otp_disable' : adminLang['OTP 비사용 계정으로 변경'],
        'name' : commonLang['이름'],
        'email' : commonLang['이메일'],
		'ostype' : adminLang["OS타입"],
		'deviceModel' : adminLang["모델명"],        
        'deviceId' : adminLang['DeviceId'],
        'otp_registered_at' : adminLang['OTP 등록일'],
        'empty_user_list' : adminLang['등록된 계정이 없습니다.'],
        'search' : commonLang['검색'],
        'no_selected' : adminLang['선택된 사용자가 없습니다'],
        'otp_exception_ip_title': adminLang['OTP 로그인 제외 IP 설정'],
        'otp_exception_ip_desc' : adminLang['제외IP 설명'],
        'otp_exception_ip_active' : adminLang['사용여부'],
        'ip_address' : adminLang['IP 주소'],
        'add' : commonLang['추가'],
        'remove' : commonLang['제거']
    };

    var OTPConfigModel = Backbone.Model.extend({
        url : function() {
            return GO.contextRoot + 'ad/api/otpconfig';
        }
    },
    {
        IP_RANGE_CONCATOR: '-',
        validateIp: function(ip) {
            var ipv4AddrRegex = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
            if (ip.indexOf(OTPConfigModel.IP_RANGE_CONCATOR) > 0) {
                var ipTo = ip.split(OTPConfigModel.IP_RANGE_CONCATOR)[1];
                if (!ipv4AddrRegex.test(ipTo)) {
                    return false;
                }
            }

            return ipv4AddrRegex.test(ip.split(OTPConfigModel.IP_RANGE_CONCATOR)[0]);
        }
    });

    var OTPConfigView = Backbone.View.extend({

    	initialize: function() {
            this.model = new OTPConfigModel();
            this.pageInfo = {
            	page: 0,
            	offset: 20,
            	search: {
            		type: null,
            		keyword: null
            	}
            }
        },

        render : function(args) {
        	this.searchParams = this._getSearchParams();
            this.model.fetch().done($.proxy(function() {
            	this._renderBase();
                this._setIpInputDisabled();
                this._renderExceptionIpList();
            	this._renderOnOffUserList();
            }, this));
            this._bindEvent();
        },

        _renderBase: function() {
            this.$el.html(layoutTpl({
                data : this.model.toJSON(),
                lang : lang
            }));
        },

        _renderExceptionIpList: function() {
            var $appendTarget = this.$('#exceptionIps');
            var data = { 'ips': this.model.get('exceptionIps') };
            var tmpl = [];

            tmpl.push('{{#ips}}');
            tmpl.push('    <option value="{{.}}">{{.}}');
            tmpl.push('{{/ips}}');

            $appendTarget.html(Hogan.compile(tmpl.join('')).render(data));
        },

        _renderOnOffUserList: function() {
        	var state = this.$('#otp_enabled_users').hasClass('active') ? 'enabled' : 'disabled';
        	var self = this;

			this.dataTable = $.goGrid({
				el : '#otp_user_table',
				method : 'GET',
				bDestroy : true,
				url : GO.contextRoot + 'ad/api/otp/user/' + state,
				emptyMessage : "<p class='data_null'> " +
	                "<span class='ic_data_type ic_no_data'></span>" +
	                "<span class='txt'>"+adminLang["등록된 계정이 없습니다."]+"</span>" +
	                "</p>",
				defaultSorting : [[ 1, "asc" ]],
				sDomType : 'admin',
				checkbox : true,
                checkboxData : 'id',
                displayLength : App.session('adminPageBase'),
				params : this.searchParams,
				columns : [
		            { mData: "userName", sClass:"title", bSortable: true, sWidth : "180px"},
		            { mData: "userEmail", sClass: "align_c" ,sWidth : "200px", bSortable: true },
		            { mData: null, bSortable: true, sWidth : "100px", fnRender: function(obj) {
		    	    	if (obj.aData.osType == null || obj.aData.osType == '') {
		    	    		return commonLang['없음'];
		    	    	}
		    	    	return obj.aData.osType;
		    	    }},
		            { mData: null, bSortable: true, sWidth : "120px", fnRender: function(obj) {
		    	    	if (obj.aData.deviceModel == null || obj.aData.deviceModel == '') {
		    	    		return commonLang['없음'];
		    	    	}
		    	    	return obj.aData.deviceModel;
		    	    }},
		    	    { mData: null, sClass: "title", bSortable: false, fnRender: function(obj) {
		    	    	if (obj.aData.deviceId == null || obj.aData.deviceId == '') {
		    	    		return commonLang['없음'];
		    	    	}
		    	    	return obj.aData.deviceId;
		    	    }},
		    	    { mData: null, sClass: "align_c", sWidth : "200px", bSortable: false, fnRender : function(obj) {
		    	    	if(obj.aData.registeredAt == null || obj.aData.registeredAt == '') {
			        		   return commonLang['없음'];
			        	}
		    	    	return GO.util.basicDate(obj.aData.registeredAt);
		    	    }}
		        ],
		        fnDrawCallback : function(tables, oSettings, listParams) {
		        	var htmls = [];
		        	htmls.push('<a href="#"><span id="otp_enable_disable" class="btn_tool">');
		        	htmls.push(state == 'enabled' ? lang.otp_disable : lang.otp_enable);
		        	htmls.push('</span></a>');
		        	htmls.push('<span class="btn_tool" id="otp_delete_button">');
		        	htmls.push(lang.otp_delete);
		        	htmls.push('</span>');

		        	self.$el.find('.toolbar_top .custom_header').html(htmls.join('\n'));
		        	self._addSearchParam({ 'page' : listParams.page, 'offset' : listParams.offset }, true);
		        }
			});
        },

        _bindEvent: function() {
            this.$el.off('click', 'span#ok');
            this.$el.off('click', 'span#cancel');
            this.$el.off('click', 'input[name="enabled"]');
            this.$el.off('click', 'input[name="exceptionIpsEnabled"]');
            this.$el.off('click', 'li#otp_enabled_users');
            this.$el.off('click', 'li#otp_disabled_users');
            this.$el.off('click', '#otp_enable_disable');
            this.$el.off('click', '#otp_delete_button');
            this.$el.off('click', '#exception_ip_add_button');
            this.$el.off('click', '#exception_ip_remove_button');
            this.$el.off('click', '#user_search_submit');
            this.$el.off('submit', '#user_otp_search_form');

            this.$el.on('click', 'span#ok', $.proxy(this._onSaveButtonClicked, this));
            this.$el.on('click', 'span#cancel', $.proxy(this._onCancelButtonClicked, this));
            this.$el.on('click', 'input[name="enabled"]', $.proxy(this._onEnabledCBClicked, this));
            this.$el.on('click', 'input[name="exceptionIpsEnabled"]', $.proxy(this._onExceptionIpEnabledCBClicked, this));
            this.$el.on('click', 'li#otp_enabled_users', $.proxy(this._onOTPEnabledUserTabClicked, this));
            this.$el.on('click', 'li#otp_disabled_users', $.proxy(this._onOTPDisabledUserTabClicked, this));
            this.$el.on('click', '#otp_enable_disable', $.proxy(this._onOTPOnOffButtonClicked, this));
            this.$el.on('click', '#otp_delete_button', $.proxy(this._onOTPDeleteButtonClicked, this));
            this.$el.on('click', '#exception_ip_add_button', $.proxy(this._onExceptionIpAddClicked, this));
            this.$el.on('click', '#exception_ip_remove_button', $.proxy(this._onExceptionIpRemoveClicked, this));
            this.$el.on('click', '#user_search_submit', $.proxy(this._onSearchSubmit, this));
            this.$el.on('submit', '#user_otp_search_form', $.proxy(this._onSearchSubmit, this));
        },

        _onSaveButtonClicked: function(e) {
            var self = this;
            self.model.save({}, {
                success : function(model, response) {
                    if(response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        self.render();
                    }
                },
                error : function(model, response) {
                    var responseData = JSON.parse(response.responseText);
                    if(responseData.message != null){
                        $.goMessage(responseData.message);
                    }else{
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                }
            });

            e.stopPropagation();
        },

        _onCancelButtonClicked : function(e){
            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);

            e.stopPropagation();
        },

        _onEnabledCBClicked: function() {
            var value = this.$('input[name=enabled]:checked').val();
            this.model.set('enabled', value);
        },

        _onExceptionIpEnabledCBClicked: function() {
            var value = this.$('input[name="exceptionIpsEnabled"]:checked').val() == 'true';
            this.model.set('exceptionIpsEnabled', value);
            this._setIpInputDisabled();
        },

        _setIpInputDisabled: function () {
            var inputDisable = !this.model.get('exceptionIpsEnabled');
            this.$('td.ipAddress > input').prop('disabled', inputDisable);
            this.$('#exceptionIps').prop('disabled', inputDisable);
            if (inputDisable) {
                this._clearIpParts();
            }
        },

        _onExceptionIpAddClicked: function() {
            var $ipFromParts = this.$('td.ipAddress > input[name*="ip_from_"]');
            var $ipToParts = this.$('td.ipAddress > input[name*="ip_to_"]');
            var ipFromParts = this._mapToVal($ipFromParts);
            var ipToParts = this._mapToVal($ipToParts);

            var ip = ipFromParts.join('.');
            if (_.size(_.compact(ipToParts)) > 0) {
                ip = ip.concat('-', ipToParts.join('.'));
            }

            if (!OTPConfigModel.validateIp(ip)) {
                $.goAlert(commonLang['IP 유효하지 않음']);
                return;
            }

            if (_.contains(this.model.get('exceptionIps'), ip)) {
                $.goAlert(commonLang['IP 중복']);
                return;
            }

            this.model.get('exceptionIps').push(ip);
            this._renderExceptionIpList();
            this._clearIpParts();
        },

        _clearIpParts: function () {
            this.$('td.ipAddress > input[name*="ip_from_"]').val('');
            this.$('td.ipAddress > input[name*="ip_to_"]').val('');
        },

        _mapToVal: function($elements) {
            return _.map($elements, function(el) {
                return $(el).val();
            });
        },

        _onExceptionIpRemoveClicked: function() {
            var $selected = $('#exceptionIps option:selected');
            if ($selected.length < 1) {
                $.goAlert(commonLang['IP 선택되지 않음']);
                return;
            }

            var removeTargets = this._mapToVal($selected);
            var result = this.model.get('exceptionIps');
            result = _.reject(result, function(ip) {
                return _.contains(removeTargets, ip);
            });

            this.model.set('exceptionIps', result);
            this._renderExceptionIpList();
        },

        _onOTPEnabledUserTabClicked: function(e) {
        	e.stopPropagation();

        	this.$('#otp_enabled_users').addClass('active');
        	this.$('#otp_disabled_users').removeClass('active');
        	this._renderOnOffUserList();
        },

        _onOTPDisabledUserTabClicked: function(e) {
        	e.stopPropagation();

        	this.$('#otp_enabled_users').removeClass('active');
        	this.$('#otp_disabled_users').addClass('active');
        	this._renderOnOffUserList();
        },

        _onOTPOnOffButtonClicked: function(e) {
        	var self = this;
        	e.stopPropagation();

        	if (this._getCheckedIds().length == 0) {
        		$.goSlideMessage(adminLang['선택된 사용자가 없습니다']);
        		return;
        	}

        	var title = adminLang['OTP 사용 계정으로 변경'];
        	content = adminLang['로그인할 때, OTP가 필요합니다.'];
        	if (this.$('#otp_enabled_users').hasClass('active')) {
        		title = adminLang['OTP 비사용 계정으로 변경'];
        		var content = adminLang['로그인할 때, OTP가 필요하지 않습니다.'];
        	}

        	$.goConfirm(title, content, function() {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data : JSON.stringify({ ids : self._getCheckedIds() }),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/otp/user/' + (self.$('#otp_enabled_users').hasClass('active') ? 'disabled' : 'enabled')
                }).
                done(function(response){
                    $.goMessage(commonLang['저장되었습니다.']);
                    self._renderOnOffUserList();
                });
            });

        	return false;
        },

        _onOTPDeleteButtonClicked: function(e) {
        	var self = this;
        	e.stopPropagation();

        	if (this._getCheckedIds().length == 0) {
        		$.goSlideMessage(adminLang['선택된 사용자가 없습니다']);
        		return;
        	}

        	$.goConfirm(
        		adminLang['OTP 기기 삭제'],
    			adminLang['사용자가 등록한 OTP 기기가 삭제됩니다.'],
    			function() {
	                $.ajax({
	                    type: 'DELETE',
	                    async: true,
	                    data : JSON.stringify({ ids : self._getCheckedIds() }),
	                    dataType: 'json',
	                    contentType : "application/json",
	                    url: GO.config("contextRoot") + 'ad/api/otp/user'
	                }).
	                done(function(response){
	                    $.goMessage(commonLang['삭제되었습니다.']);
	                    self._renderOnOffUserList();
	                });
	            });
        	return false;
        },

        _getCheckedIds: function() {
        	return this._mapToVal(this.$('tbody input[type=checkbox]:checked'));
        },
        
        
        searchParamKeys :  ['page', 'offset'],
		
		_addSearchParam : function(newParams, paramOnly) {
			var getUrl = GO.router.getUrl(),
				searchParams = this.searchParams,
				newParams = newParams;
			
			$.each(this.searchParamKeys, function(k,v) {
				if(newParams.hasOwnProperty(v)) searchParams[v] = newParams[v];
			});
			GO.router.navigate(getUrl.split('?')[0] +'?'+$.param(searchParams));
		},
		
		_getSearchParams : function() {
            var search = GO.router.getSearch(),
                returnParams = search || {};
                
            returnParams['page'] = parseInt(search['page'], 20) || 0;//-1
           	returnParams['offset'] = search['offset'] || 20;
            return returnParams;
        },

        _onSearchSubmit: function() {
        	var searchSelect = this.$('#user_search_select').val();
        	var searchKeyword = this.$('#user_search_keyword').val();
        	this.dataTable.tables.search(searchSelect, searchKeyword, this.$('#user_search_keyword'));
        	return false;
        }
    });
    return OTPConfigView;
});