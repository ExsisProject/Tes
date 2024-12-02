define(function(require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Hogan = require('hogan');
    var GO = require('app');
    var when = require('when');
    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');
    var renderTemplate = require('hgn!system/templates/display_config_model');

    require('jquery.go-popup');
    require('jquery.go-grid');

    var lang = {
        label_company_name: adminLang["회사명"],
        label_add: adminLang["추가"],
        label_mod: commonLang["수정"],
        label_perfomance: commonLang["수행"],
        label_delete: commonLang["삭제"]
        
    };

    function convertMapToArray(map) {
        var returnArr = [];
        _.each(map || {}, function(v, k) {
            returnArr.push({"key": k, "value": v});
        });

        return returnArr;
    }

    var _sentReq = false;

    var DisplayConfigModelView = Backbone.View.extend({

        events: {
            "click .btn-cmd": '_onClickAddAttr',
            "change #companyList": '_onChangeCompany',
            "click span.ic_delete" : 'onClickDeleteDisplayConfig'
        },

        initialize: function(options) {
        },

        render: function() {
        	$('.breadcrumb .path').html(adminLang['DisplayConfigModel 관리']);
            this._renderTemplate();

            this._getCompanyList()
                .then(this._initSelectCompany)
                .then(_.bind(this._loadDisplayConfigList, this))
                .then(_.bind(this._renderList, this))
                .otherwise(function(error) {
                    console.log(error.stack);
                });
        },

        _renderTemplate: function(data) {
            this.$el.html(renderTemplate({
                lang : lang
            }));
        },

        _renderList: function(data) {
            $('#displayConfigList tbody').empty();

            var $tbody = this.$el.find('#displayConfigList tbody');
            var rowTpl = '{{#rows}}' +
                '<tr class="odd">' +
                '<!--td><input name="key" type="checkbox" value="{{key}}"></td-->' +
                '<td class="display_config_key" style="text-align: left;">{{key}}</td>' +
                '<td><input type="text" name="{{key}}" class="input txt display_config_value" value="{{value}}" style="width: 95% !important;"/></td>' +
                '<td><div class="critical"><span class="btn_tool btn-cmd" data-key="{{key}}" data-role="update">{{lang.label_mod}}</span> </div></td>' +
                '<td><span class="btn_border display_config_delete_btn_wrap"><span class="ic ic_delete" title={{lang.label_delete}}></span></span></td>'+
                '</tr>' +
                '{{/rows}}';

            var compiled = Hogan.compile(rowTpl);

            $tbody.empty().append(compiled.render({
                "rows": data,
                "lang": lang
            }));
        },

        _reloadList: function(data) {
            this._resetCreateForm();
            this._renderList(data);
        },

        _resetCreateForm: function() {
            $('#newAttrKey').val('');
            $('#newAttrValue').val('');
        },

        _getCompanyList : function(){
            return when.promise(function(resolve, reject) {
                var url = GO.config('contextRoot') + "ad/api/system/companies?offset=999";

                $.ajax(url, {
                    type : 'GET',
                    success : function(response) {
                        $.each(response.data, function(i, item){
                            $('#companyList').append('<option value="' +item.id+ '">' + item.name +'</option>');
                        });
                        resolve(response.data)
                    },
                    error: function(response){
                        var responseData = JSON.parse(response.responseText);
                        $.goMessage(responseData.message);
                        reject();
                    }
                });
            });
        },

        _initSelectCompany: function() {
            $('#companyList').val(GO.session("companyId"));
            return when.resolve();
        },

        _loadDisplayConfigList: function() {
            return when.promise(_.bind(function(resolve, reject) {
                var companyId = this._getSelectedCompanyId();

                if(!companyId) {
                    $.goSlideMessage(adminLang['회사를 선택해주세요'], 'caution');
                    return;
                }

                $.ajax(GO.config('contextRoot') + 'ad/api/company/displayconfig', {
                    type : 'GET',
                    data : {companyId: companyId, includePreservedKey:false},
                    success : function(resp) {
                        if(resp && resp.code == '200') {
                            resolve(convertMapToArray(resp.data));
                        } else {
                            reject();
                        }
                    },
                    error: function(resp){
                        var responseData = JSON.parse(resp.responseText);
                        $.goSlideMessage(responseData.message, 'caution');
                        reject();
                    }
                });
            }, this));
        },

        _getSelectedCompanyId: function() {
            return $('#companyList').val();
        },

        _onClickAddAttr: function(e) {
            e.preventDefault();
            var self = this;
            var $target = $(e.currentTarget);
            var $row = $target.closest('tr');
            var comanyId = this._getSelectedCompanyId();

            var reqData = {};
            var role = $target.attr('data-role');
            var method = 'POST';
            var key = '';
            var value = '';

            if(_sentReq) {
                $.goSlideMessage(adminLang['요청 중입니다.']);
                return;
            }

            if(role === 'create') {
                key = $.trim($row.find('input[name=key]').val());
                value = $row.find('input[name=value]').val();
            } else if(role === 'update') {
                key = $target.attr('data-key');
                value = $row.find('input[name='+key+']').val();
            } else {
                $.goSlideMessage(adminLang['허용되지 않은 요청입니다.']);
                return;
            }

            if(!key || key && key.length < 1) {
                $.goSlideMessage(adminLang['Key 미지정 경고']);
                $('#newAttrKey').trigger('focus');
                return;
            }

            if(!value || value && value.length < 1) {
                $.goSlideMessage(adminLang['Value 미지정 경고'], 'caution');
                $('#newAttrValue').trigger('focus');
                return;
            }
            
            reqData = {
                companyId: comanyId,
                key: key,
                value: value,
                includePreservedKey:false
            };

            _sentReq = true;

            $.ajax(GO.config('contextRoot') + 'ad/api/company/displayconfig', {
                type : method,
                data: reqData,
                success: function(resp) {
                    $.goSlideMessage(commonLang['저장되었습니다.']);
                    self._reloadList(convertMapToArray(resp.data));
                },
                error: function(resp) {
                	var errorMessage = resp.responseJSON.message;
                	if (errorMessage != null) {
                		$.goSlideMessage(errorMessage, 'caution');
                	} else {
                		$.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                	}
                	$('#newAttrKey').trigger('focus');
                },
                complete: function() {
                    _sentReq = false;
                }
            });
        },

        _onChangeCompany: function(e) {
            e.preventDefault();
            this._loadDisplayConfigList()
                .then(_.bind(this._reloadList, this))
                .otherwise(function(error) {
                    console.log(error.stack);
                });

            e.stopImmediatePropagation();
        },
        
        onClickDeleteDisplayConfig : function(e) {
        	var self = this;
        	var $target = $(e.currentTarget).closest('tr');
        	
        	if(_sentReq) {
                $.goSlideMessage(adminLang['요청 중입니다.']);
                return;
            }
        	
        	var param = $.param({
        		"companyId": self._getSelectedCompanyId(),
        		"key": $target.find('.display_config_key').text()
        	});
        	
        	$.ajax({
        		url : GO.config('contextRoot') + 'ad/api/company/displayconfig?' + param, 
        		type : 'DELETE',
        		success : function(resp) {
        			$(e.currentTarget).closest('tr').remove()
        			$.goSlideMessage(commonLang['삭제되었습니다.']);
        		},
        		error : function(resp) {
        			var errorMessage = resp.responseJSON.message;
                	if (errorMessage != null) {
                		$.goSlideMessage(errorMessage, 'caution');
                	} else {
                		$.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                	}
        		},
        		complete: function() {
                    _sentReq = false;
                }
        	});
        }
    },{
        __instance__: null
    });

    return DisplayConfigModelView;
});