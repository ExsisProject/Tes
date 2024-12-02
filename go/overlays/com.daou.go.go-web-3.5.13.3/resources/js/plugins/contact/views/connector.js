define(function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");

    var Template = require("hgn!contact/templates/connector");
    var TemplateAdd = require("hgn!contact/templates/connector_add");
    var TemplateAddGroup = require("hgn!contact/templates/connector_add_group");
    var TemplateAddUser = require("hgn!contact/templates/connector_add_user");

    var ConnectorInfoView = require("contact/views/tab_book/main");
    
    var TypeManager = require("contact/views/tab_book/components/type_manager");

    require("jquery.jstree");

    var lang = {
        "receiver": ContactLang["받는사람"],
        "mail_cc": ContactLang["참조"],
        "private_cc": ContactLang["숨은참조"],
        "use_help": ContactLang["주소록 사용 설명"],
        "user": CommonLang["사용자"],
        "group": CommonLang["그룹"],
        "lowDeptInclude" : CommonLang["하위부서포함"]
    };

    var ContactConnector = Backbone.View.extend({
        className: "content layer_address",
        events : {

        },

        initialize: function(options) {
            this.options = options || {};
            this.target =  this.options.target;

            var typeManager = new TypeManager({localStorageKey : "contact-connector-type"});
            
            this.connectorInfoView = new ConnectorInfoView({
                mode : "MAIL",
                tabArea : "#tabArea",
                infoArea : "#infoArea",
                typeManager : typeManager
            });

            this.addView = new ContactAddView({
                typeManager : typeManager
            });

            this.$el.off();

            var self = this;
            this.addView.on({
                "click.addGroup" : addGroup,
                "click.addUser": addUser
            });

            function addGroup(params){
                try{
                    var data = self.connectorInfoView.getSelectedGroup();
                }catch(e){
                    $.goSlideMessage(ContactLang['선택된 그룹이 없습니다'],'caution');
                    return;
                }
                params.callback(data.data, params.target, data.groupType);
            };

            function addUser(params){
                try {
                    var data = self.connectorInfoView.getSelectedUsers();
                } catch (e) {
                    $.goSlideMessage(ContactLang['선택된 사용자가 없습니다.'], 'caution');
                    return;
                }

                params.callback(data, params.target);
            }
        },

        render : function() {
            //GO-41158 일본요청 이슈
            if (!_.isUndefined(window.GO_Notification) && !_.isUndefined(window.GO_Notification.disconnect)) {
                window.GO_Notification.disconnect();
            }

            var tvars = $.extend(true, {}, { "lang": lang });
            this.$el.empty().append(Template( tvars ));

            // Tab + Info 출력
            this.connectorInfoView.render();

            // 데이터 추가 부분 생성
            this.$el.find("#addArea").html(this.addView.render());

            this.setGlobalMethod();

            // TODO : 모든 부분이  target 이 all 이기 때문에 필요 없는 분기문.
            if(this.target == "all"){
                if(_.isFunction(parent.removeProcessLoader)){
                    parent.removeProcessLoader();  //mail쪽 로딩이미지 닫기 호출
                }

                $("#mailReceive").css('overflow','auto'); //GO-19171
            }

            return false;
        },

        // mail 쪽에서 사용하기 위한 global method 설정
        setGlobalMethod : function(){
            var self = this;
            window.getAddrRcptList = function(){
                var param ={};
                param.toList = self.addView.getRecevieList();
                param.ccList = self.addView.getCCList();
                param.bccList = self.addView.getHiddenCCList();
                return param;
            };
        }
    });

    // 받는 사람, 참조, 숨은 참조 정보 추가
    var ContactAddView = Backbone.View.extend({
        events : {
            "click span.addGroup" : "_onClickAddGroup",
            "click span.addUser" : "_onClickAddUser",
            "click span.ic_list_del" : "_onClickDelete",
            "click input.lowDeptChk" : "chkLowDeptInclude"
        },

        // 추가되는 li 부분에 대해서 최소 숫자를 정의
        ITEM_MIN_LENGTH : 4,

        initialize : function(options){
        	this.typeManager = options.typeManager;
        },

        render : function(){
            var tpl = TemplateAdd({
                lang : lang
            })
            this.$el.html(tpl);
            return this.$el;
        },

        _onClickAddGroup : function(e){
            var target = $(e.currentTarget).data("target");
            this.trigger("click.addGroup", {callback : $.proxy(this.addGroup, this), target : target});
        },

        _onClickAddUser : function(e){
            var target = $(e.currentTarget).data("target");
            this.trigger("click.addUser", {callback : $.proxy(this.addUsers, this), target : target});
        },

        /**
         * 그룹 추가 (_onClickAddGroup 의 callback 인자로 쓰임)
         * @param data object
         * @param target String (RECEVIE : 받는사람, MAIL_CC : 참조, HIDDEN_CC : 숨은참조)
         * @param groupType String (GROUP : 그룹타입 , ORG : 조직도타입 )
         */
        addGroup : function(data, target, groupType){
            var addContainer = this.$el.find("div[data-target='" + target + "']");

            _.each(data, function(itemData){

                if(isDuplicate.call(this, target, itemData, groupType)){
                    return; // continue
                }

                var tpl = TemplateAddGroup({
                    data : itemData,
                    isOrg : function(){
                        return groupType == "ORG";
                    },
                    lang : lang,
                    dataKey : function(){
                    	if(groupType == "ORG") {
                    		return '\"' + this.dataName + '\" <#' + this.dataId + '_1>'                    		
                    	} else {
                    		return '\"' + this.dataName + '\" <$' + this.dataId + '>'
                    	}
                    }
                });

                // 추가된 사항이 4개 이하면 빈 li 값을 치환
                if(this._isReplaceAdd(target)){
                    var index = this._findEmptyIndex(target);
                    var items = addContainer.find("li");
                    $(items[index]).replaceWith(tpl);
                }else{
                    addContainer.find("ul").append(tpl);
                }

                function isDuplicate(target, data, groupType){
                    var dataList = this.$el.find("div[data-target='" + target + "'] li").map(function(){
                        return $(this).data("id");
                    }).get();

                    var convertId;
                    if(groupType == "GROUP"){
                        convertId = "$"
                    }else{ // ORG
                        convertId = "#"
                    }

                    convertId += data.dataId;

                    if(_.indexOf(dataList, convertId) < 0){
                        return false;
                    }else{
                        return true;
                    }
                }
            }, this);
        },

        /**
         * 사용자 추가 (_onClickAddUser 의 callback 인자로 쓰임)
         * @param data Array
         * @param target String (RECEVIE : 받는사람, MAIL_CC : 참조, HIDDEN_CC : 숨은참조)
         */
        addUsers : function(data, target){
            var addContainer = this.$el.find("div[data-target='" + target + "']");
            _.each(data, function(itemData){

                if(isDuplicate.call(this, target, itemData)){
                    return; // continue
                }
                
                var info = [];
                if(itemData.name){info.push(itemData.name);}
                if(itemData.position){info.push(itemData.position);}
                if(itemData.deptName){info.push(itemData.deptName);}
                var summeryInfo = info.join("/");

                var tpl = TemplateAddUser({
                    data : itemData,
                    summeryInfo : summeryInfo,
                    dataKey : '\"' + summeryInfo + '\" <' + itemData.email + '>',
                    mailExposure : GO.config('mailExposure') || this.typeManager.getType() != "ORG"
                });

                if(this._isReplaceAdd(target)){
                    var index = this._findEmptyIndex(target);
                    var items = addContainer.find("li");
                    $(items[index]).replaceWith(tpl);
                }else{
                    addContainer.find("ul").append(tpl);
                }

                function isDuplicate(target, data){
                    var dataList = this.$el.find("div[data-target='" + target + "'] li").map(function(){
                        return $(this).data("email");
                    }).get();

                    if(_.indexOf(dataList, data.email) < 0){
                        return false;
                    }else{
                        return true;
                    }
                }

            }, this);
        },

        chkLowDeptInclude : function(e){
            var target = $(e.currentTarget);
            var currentDataId = target.parents('li').first().attr('data-id');
            var currentDataName = target.parents('li').first().attr('data-deptname');
            var lowDept = "0";
            var addressData = "";
            //하위부서 체크한 경우
            if(target.is(':checked')){
                lowDept = "1";
            }else{
                lowDept = "0";
            }
            addressData = '"'+currentDataName+'" <'+currentDataId+'_'+lowDept+'>';
            target.parents('li').first().find('label:first').html(addressData);
            target.parents('li').first().attr('data-key', addressData);
        },

        /**
         * 추가하려는 영역의 비어있는 index 위치 확인
         * @param target
         * @returns {*}
         * @private
         */
        _findEmptyIndex : function(target){
            var items = this._getItems(target);
            for(var index = 0 ; index < items.length ; index++){
                if($(items[index]).html() == ""){
                    return index;
                }
            }

            return items.length; // 방어 코드
        },

        _isReplaceAdd : function(target){
            var items = this._getItems(target);
            var emptyIndex;
            for(var index = 0 ; index < items.length ; index++){
                if($(items[index]).html() == ""){
                    emptyIndex = index;
                    break;
                }
            }

            if(emptyIndex < this.ITEM_MIN_LENGTH){
                return true;
            }else{
                return false;
            }
        },

        /**
         * target 의 items 을 반환
         * @param target
         * @returns {*}
         * @private
         */
        _getItems : function(target){
            var addContainer = this.$el.find("div[data-target='" + target + "']");
            var items = addContainer.find("li");addContainer.find("li");
            return items;
        },

        _onClickDelete : function(e){
            var $item = $(e.currentTarget).closest("li");
            var $itemContainer = $item.closest("ul");
            $item.remove();
            var lengthAfterRemove = $itemContainer.find("li").length;

            // 리스트가 4개 이하일 경우 4개 채우기(항상 4개 이상이여야 함)
            for(var index = lengthAfterRemove ; index < this.ITEM_MIN_LENGTH ; index++){
                $itemContainer.append("<li></li>")
            }
        },

        /**
         * 받는사람 목록
         */
        getRecevieList : function(){
            return this._getTypeList("RECEVIE");
        },

        /**
         * 참조 목록
         */
        getCCList : function(){
            return this._getTypeList("MAIL_CC");
        },

        /**
         * 숨은참조 목록
         */
        getHiddenCCList : function(){
            return this._getTypeList("HIDDEN_CC");
        },

        /**
         * 타입별 목록 반환
         * @param type (RECEVIE, MAIL_CC, HIDDEN_CC)
         * @private
         */
        _getTypeList : function(type){
            var list = this.$el.find("div[data-target='" + type + "'] li label.mailInfo").map(function(){
                return $(this).parent().attr('data-key');
            }).get();

            return list;
        }
    });

    return ContactConnector;
});
