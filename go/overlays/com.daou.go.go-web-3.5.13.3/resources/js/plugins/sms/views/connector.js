;define('sms/views/connector', function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Template = require("hgn!sms/templates/connector");
    var TemplateAdd = require("hgn!sms/templates/connector_add");
    var TemplateAddUser = require("hgn!sms/templates/connector_add_user");
    var TemplateAddGroup = require("hgn!sms/templates/connector_add_group");
    var ConnectorInfoView = require("contact/views/tab_book/main");

	var CommonLang = require("i18n!nls/commons");
	var ContactLang = require("i18n!contact/nls/contact");
	var SmsLang = require("i18n!sms/nls/sms");
	var AdminLang = require("i18n!admin/nls/admin");
	//var placeholder = require("jquery.placeholder");
	
	var TypeManager = require("contact/views/tab_book/components/type_manager");

	var lang = {
		"receiver": ContactLang["받는사람"],
		'contact_desc' : SmsLang['주소록입력안내'],
		"주소록" : ContactLang["주소록"],
		"부서" : ContactLang["부서"],
		"하위부서포함" : CommonLang["하위부서포함"],
		'user_id' : CommonLang['아이디'],
		'phone' : AdminLang['전화'],
		'title' : AdminLang['직책']
	};

    var Connector = Backbone.View.extend({
        events : {
            "click a#add" : "addReceiver",    // 받는사람에 추가하는 이벤트
        },

        initialize : function(options) {
            this.$el.off();

            this.options = options || {};
            
            var typeManager = new TypeManager({localStorageKey : "sms-connector-type"});
            
            this.connectorInfoView = new ConnectorInfoView({
                mode : "SMS",
                tabArea : "#tabArea",
                infoArea : "#infoArea",
                typeManager : typeManager
            });
            this.addView = new ContactAddView();

            var self = this;
            this.addView.on("click.add", function(params){
                try{
                    var listData = self.connectorInfoView.getSelectedUsers();
                }catch(e){
                    if(e.message != "not select users"){
                        throw new Error(e.message);
                    }
                }

                try{
                    var groupData = self.connectorInfoView.getSelectedGroup();
                }catch(e){
                    if(e.message != "not select group"){
                        throw new Error(e.message);
                    }
                }

                var data;
                var dataType;
                var groupType;

                // 리스트에서 선택된 데이터가 우선 없을 경우에는 왼쪽 사이드에 있는 데이터 셋팅
                if(listData){
                    data = listData;
                    dataType = "LIST";
                }else if(groupData){
                    data = groupData.data;
                    groupType = groupData.groupType;
                    dataType = "SIDE"
                }else{
                    $.goSlideMessage(ContactLang['선택된 그룹이 없습니다'],'caution');
                    return;
                }

                params.callback(data, dataType, groupType);
            });
        },

        render : function() {
            var tvars = $.extend(true, {}, { "lang": lang });
            this.$el.empty().append(Template( tvars ));

            // Tab + Info 출력
            this.connectorInfoView.render();

            // 데이터 추가 부분 생성
            this.$el.find("#addArea").html(this.addView.render());

            return this.$el;
        },

        getData : function(){
            return this.addView.getData();
        }
    });


    var ContactAddView = Backbone.View.extend({
        events : {
            "click #add" : "_onClickAdd",
            "click span.ic_list_del" : "_onClickRemove",
            "click input.lowDeptChk" : "_onClickLowDept",
        },

        initialize : function(){

        },

        render : function(){
            var tpl = TemplateAdd({
                lang : lang
            })
            this.$el.html(tpl);
            return this.$el;
        },

        _onClickAdd : function(e){
            this.trigger("click.add", {callback : $.proxy(this.addData, this)});
        },

        _onClickRemove : function(e){
            var $currentEl = $(e.currentTarget);
            $currentEl.closest("li").remove();
        },

        _onClickLowDept : function(e){
            var $currentEl = $(e.currentTarget);
            var $checkGroup = $currentEl.closest("li");
            var dataType;

            if($currentEl.is(":checked")){
                dataType = "subdepartment";
            }else{
                dataType = "department";
            }

            $checkGroup.attr("data-type", dataType);
        },

        /**
         * 선택된 데이터 추가
         * @param data array : 선택된 데이터
         * @param dataType : 선택된데이터의 타입 (SIDE, LIST) - 왼쪽 리스트에 있는 데이터 인가? 리스트 데이터 인가?
         * @param groupType String (GROUP : 그룹타입 , ORG : 조직도타입 )
         */

        addData : function(data, dataType, groupType){
            var $addContainer = this.$el.find("#receivers");
            _.each(data, function(itemData){
                if(isDuplicate.call(this, itemData, dataType, groupType)){
                    return; // continue;
                }

                if(isListType(dataType)){
                    var tpl = TemplateAddUser({
                        data : itemData,
                        summeryInfo : function(){
                            var info = [];
                            if(this.name){info.push(this.name);}
                            if(this.deptName){info.push(this.deptName);}
                            if(this.position){info.push(this.position);}
                            return info.join(" ");
                        }
                    });
                }else{
                    var tpl = TemplateAddGroup({
                        data : itemData,
                        isOrg : isORGType(groupType),
                        lang : lang
                    });
                }

                $addContainer.append(tpl);

                function isListType(dataType){
                    return dataType == "LIST";
                }

                function isGroupType(groupType){
                    return groupType == "GROUP";
                }

                function isORGType(groupType){
                    return groupType == "ORG";
                }

                function isDuplicate(item, dataType, groupType){

                    var dataList = this.$el.find("#receivers li").map(function(){
                        var $item = $(this);

                        if(isListType(dataType)){
                            return $item.data("mobileno");
                        }

                        var type = $item.data("type");

                        if(isGroupType(groupType) ||  type == "group"){
                            return $item.data("id");
                        }else if(isORGType(groupType) ||  type == "department"){
                            return $item.data("id");
                        }
                    }).get();

                    var itemData = isListType(dataType) ? item.mobileNo : item.dataId;

                    if(_.indexOf(dataList, itemData) < 0){
                        return false;
                    }else{
                        return true;
                    }
                }
            }, this);
        },

        /**
         * 추가된 데이터 목록
         * @returns {Array}
         */
        getData : function(){
            var $itemList = this.$el.find("#receivers li");
            var data = [];
            $.each($itemList, function(){
                var $item = $(this);
                var type = $item.data("type");

                data.push({
                    id : $item.data("id"),
                    name : $item.data("name"),
                    nameAddition : function(){
                        var result = "";
                        if(type == "subdepartment"){
                            result = lang.하위부서포함;
                        }

                        return result;
                    }(),
                    type : type,
                    mobileNo : $item.data("mobileno")
                });
            });

            return data;
        }
    });

    return Connector;
});
