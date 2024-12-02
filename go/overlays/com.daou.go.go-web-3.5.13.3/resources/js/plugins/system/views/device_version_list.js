define([
    "jquery", 
    "backbone", 
    "app",  
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "hgn!system/templates/device_version_list",
    "hgn!system/templates/list_empty",
    "jquery.go-sdk",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.ui",
    "GO.util",
    "jquery.go-validation"
], 

function(
	$, 
	Backbone,
	App, 
	commonLang,
	adminLang,
	deviceVersionListTmpl,
	emptyTmpl
) {
	var tmplVal = {
			label_add : commonLang["추가"],
			label_delete : commonLang["삭제"],
			label_desc : adminLang["디바이스관리 목록 설명"],
			label_device : adminLang["디바이스"],
			label_importance : adminLang["중요도"],
			label_version : adminLang["버전"],
			label_linkinfo : adminLang["링크정보"],
			label_createdAt : adminLang["등록일"],
			label_default : adminLang["기본"],
			label_messenger_type : adminLang["메신저 타입 설정"],
			select_type : [
			               {text : adminLang["전체분류"], value : "all"},
				           {text : adminLang["PC"], value : "pc"},
				           {text : "PC - Electron", value : "pc_electron"},
				           {text : "PC - MAC", value : "pc_mac"},
			               {text : "PC - XP", value : "pc_xp"},
			               {text : adminLang["iPhone"], value : "iphone"},
			               {text : adminLang["Android"], value : "android"}
			 ]
	};
	var instance = null;
	var deviceVersionList = Backbone.View.extend({
		el : '#layoutContent',
		initialize: function() {
			this.$el.off();
			this.$el.empty();

			this.listEl = '#deviceVersionList';
            this.dataTable = null;
            this.bindEvent();
		},
		bindEvent : function() {
			this.$el.on("click", "span#btn_add", $.proxy(this.addDeviceVersion, this));
			this.$el.on("click", "span#btn_delete", $.proxy(this.deleteDeviceVersion, this));
			this.$el.on("change", "#deviceType", $.proxy(this.categoryNameFilter, this));
			this.$el.on("change", "input[name='messengerType']", $.proxy(this.changeMessengerType, this));
		},
		changeMessengerType : function(e) {
            var messengerText = $(e.currentTarget).parent().find('label').text();
			var messengerType = $('input[name="messengerType"]:radio:checked').val();
            $.goPopup({
                title : adminLang["메신저 타입 설정"],
                message : GO.i18n(adminLang['타입 저장'], {"arg1":messengerText}),
                modal : true,
                allowPrevPopup : true,
                closeIconVisible : false,
                buttons : [{
                    'btext' : '확인',
                    'btype' : 'confirm',
                    'callback' : function() {
                        var url = GO.contextRoot + "ad/api/system/messenger/type/" + messengerType;
                        $.go(url, "", {
                            qryType : 'PUT',
                            contentType : 'application/json',
                            responseFn : function(response) {
                                $.goMessage(commonLang["저장되었습니다."]);
                            },
                        error: function(response){
                            var responseData = JSON.parse(response.responseText);
                            var message = responseData.message;
                            $.goMessage(commonLang["실패했습니다."] + message);
                        }
                        });
					}
                }, {
                    'btext' : '취소',
                    'btype' : 'normal',
                    'callback' : function() {
                        var cancelValue = messengerType == 'electron' ? 'default' : 'electron';
                        //취소를 누르면 기존 값으로 돌아간다.
                        $('input[name="messengerType"][value="'+cancelValue+'"]').prop('checked', true);
                        // $('#'+selector).prop("checked", true);
					}
                }]
            });

            e.stopPropagation();
		},
		categoryNameFilter : function(e) {
			var value = $(e.currentTarget).val();
            if(typeof this.dataTable.tables.setParam == 'function') {
                this.dataTable.tables.setParam("deviceType",value);
            }
		},
		addDeviceVersion : function() {
			App.router.navigate('system/device/create', true);
		},
		deleteDeviceVersion : function() {
			var self = this,
            	checkedEls = $("#deviceVersionList input[type=checkbox]:checked");
        
	        if(checkedEls.length == 0){
	            return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
	        }
	        
	        $.goConfirm("",adminLang["삭제경고"], function(){
	            var url = GO.contextRoot+"ad/api/system/device/version",
	            options = {
	                ids : []
	            };
	            
	            for(var i=0 ; i < checkedEls.length ; i++){
	                if(checkedEls[i].value == "on"){
	                    continue;
	                }
	                options.ids.push(parseInt(checkedEls[i].value));
	            }
	            
	            if(options.ids.length == 0){
	                return;
	            }
	            
	            $.go(url,JSON.stringify(options), {
	                qryType : 'DELETE',
	                contentType : 'application/json',
	                responseFn : function(response) {
	                    $.goMessage(commonLang["삭제되었습니다."]);
	                    self.render();
	                },
	                error : function(error){
	                	$.goMessage(commonLang["실패했습니다."]);
	                }
	            });
	        });
		},
		render : function() {
			$('#mobilty').addClass('on');
			$('.breadcrumb .path').html(adminLang["모빌리티 > 모바일 앱 버전 관리"]);
			this.$el.empty();
            this.$el.html(deviceVersionListTmpl({
                lang : tmplVal,
            }));
            this.renderMessengerType();
            this.renderDeviceVersionList();
		},
		renderMessengerType : function() {
            var url = GO.contextRoot + "ad/api/system/messenger/type";
            $.go(url, "", {
                qryType : 'GET',
                contentType : 'application/json',
                responseFn : function(response) {
                    $('input[name="messengerType"][value="'+response.data+'"]').prop('checked', true);
                }
            });

		},
		renderDeviceVersionList : function() {
			var self = this;
            this.dataTable = $.goGrid({
                    el : this.listEl,
                    method : 'GET',
                    url : GO.contextRoot + 'ad/api/system/device/version/all',
                    emptyMessage : emptyTmpl({
                            label_desc : adminLang["표시할 데이터 없음"]
                    }),
                    defaultSorting : [[ 5, "desc" ]],
                    checkbox : true,
                    sDomType : 'admin',
                    checkboxData : 'id',
                    displayLength : App.session('adminPageBase'),
                    columns : [
                               { mData: "deviceType", sWidth: "120px", bSortable: false, fnRender : function(obj) {
                            	   var deviceType = obj.aData.deviceType;
                            	   if(deviceType == 'pc') {
                            		   return adminLang["PC"];
                            	   } else if(deviceType == 'pc_electron') {
                            		   return "PC - Electron";
                            	   } else if(deviceType == 'pc_mac') {
                            		   return "PC - MAC";
                            	   } else if(deviceType == 'pc_xp') {
                            		   return "PC - XP";
                            	   } else if(deviceType == 'iphone') {
                            		   return adminLang["iPhone"];
                            	   } else if(deviceType == 'android') {
                            		   return adminLang["Android"];
                            	   } else{
                            		   return deviceType;
                            	   }
                               }},
                               { mData: "importance", sWidth: "100px", bSortable: false, fnRender : function(obj) {
                            	   var importance = obj.aData.importance;
                            	   if (importance == 'urgent') {
                            		   return adminLang['긴급'];
                               	   } else if(importance == 'high') {
                            		   return adminLang["상"];
                            	   } else if(importance == 'medium') {
                            		   return adminLang["중"];
                            	   } else if(importance == 'low') {
                            		   return adminLang["하"];
                            	   } else {
                            		   return importance;
                            	   }
                               }},
                               { mData: "version", sWidth: "100px", bSortable: false, fnRender : function(obj) {
                            	   return obj.aData.version;
                               }},
                               { mData: null, bSortable: false, fnRender : function(obj) {
                                       if (obj.aData.linkType == 'upload') {
                                           if (obj.aData.deviceVersionAttach == null) {
                                               return "-";
                                           } else {
                                               return GO.util.escapeToLtGt(obj.aData.linkUrl);
                                           }
                                       } else {
                                           return GO.util.escapeToLtGt(obj.aData.linkUrl);
                                       }
                               }},
                               { mData: "createdAt", sClass: "align_c", sWidth: '150px', bSortable: true, fnRender : function(obj) {
                                   return GO.util.basicDate(obj.aData.createdAt);
                               } }
                    ],
                    fnDrawCallback : function(obj) {
                        self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controllButtons').show());
                        self.$el.find(this.el + ' tr>td:not(:first-child)').css('cursor', 'pointer').click(function(e) {
                            App.router.navigate('system/device/'+$(e.currentTarget).parent().find('input').val() + "/modify", {trigger: true});
                        });
                    }
                
                });
		}
	},{
		create: function() {
			instance = new deviceVersionList({el:'#layoutContent'});
			return instance.render();
		}
	});
	
	return {
		render: function() {
			var layout = deviceVersionList.create();
			return layout;
		}		
	};
});