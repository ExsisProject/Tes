//결재 통계
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "hogan",
    "hgn!admin/templates/manage_security_level",
    "hgn!admin/templates/manage_security_level_list",
    "i18n!approval/nls/approval",
    "i18n!nls/commons",    
    "i18n!admin/nls/admin",
    "jquery.ui",
    "jquery.go-validation"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,
    Hogan,
    ManageSecurityLevelTpl,
    ManageSecurityLevelListTpl,
    approvalLang,
    commonLang,
    adminLang
) {
    
    var AdminSecurityLevelModel = Backbone.Model.extend({
        
        url: GO.contextRoot + 'ad/api/approval/securitylevel',
        validate : function(attr, options){
            var levels = [];
            $(attr.securityLevel).each(function(k, v){
                levels.push(v.attributes.level);
            });
            
            var isUnique = ($.unique(levels).length == attr.securityLevel.length);
            if (!isUnique){
                return 'isNotUnique';
            }
        }
        
    });
    
    var AdminSecurityLevelItemModel = AdminSecurityLevelModel.extend({
        
        validate : function(attr, options){
            //id값이 존재하지만 name이 없는 경우(이미 한번 insert된 데이터 였으면) 
            //수정만 할 수 있으므로 name이 필요로 한다. name이 없으면 vali error
            var chktext = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi; //특수문자는 제외한다.
            if(!_.isEmpty(attr.id) && (_.isEmpty(attr.name))){ 
                return 'name_required';
            }       
            else if ( !_.isEmpty(attr.name) && attr.name.length >= 20)   {
                return 'name_invalid_length';
            }else if (chktext.test(attr.name)){
                return 'name_invalid_string';
            }
        },
        
        haveIdAndName : function(){
            if(_.isEmpty(this.attributes.id) && _.isEmpty(this.attributes.name)){
                return false;
            }else{
                return true;
            }
        }
    });
    
    var AdminSecurityLevelCollection = Backbone.Collection.extend({
        url: GO.contextRoot + 'ad/api/approval/securitylevel',
        model : AdminSecurityLevelItemModel
    });
    
    var lang = {
        'name_required' : adminLang['이름을 입력하세요.'],
        'name_invalid_length' : adminLang['이름은 20자 미만입니다.'],
        'isNotUnique' : adminLang['중복된 값이 있습니다.'],
        'name_invalid_string' : adminLang['보안등급 이름에 공백이나 특수문자는 사용할수 없습니다'],
        "저장" : commonLang["저장"],
        "취소" : commonLang['취소'],
        "보안등급 이름" : commonLang['보안등급 이름'],
        "보안등급 관련 헤더" : adminLang['보안등급 관련 헤더'],
        "보안등급" : adminLang['보안등급'],
        "보안등급 이름" : adminLang['보안등급 이름'],
        "사용여부" : adminLang['사용여부']
    };
    
    var ManageSecurityLevelView = Backbone.View.extend({
        
        /**
         * SecurityLevelModel의 컬렉션
         */
        securityLevels: null,
        model : null,
        listOffset : 10, //현재 관리자 보안등급 페이지는 10개의 리스트가 fix되어 있음. 앞으로 list갯수가 변한다면 이 값을 변경할 것
        el: '#layoutContent',
        
        initialize: function() {
            this.collection = new AdminSecurityLevelCollection();
            this.collection.fetch({
                async:false,
                statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
            });
            this.model = new AdminSecurityLevelModel();
        },
        
        delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.securityLevel", "#btn_securityLevel_save", $.proxy(this._doSave, this));
            this.$el.on("click.securityLevel", "#btn_securityLevel_cancel", $.proxy(this._doCancel, this));   
        },
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".securityLevel");
            return this;
        },
        
        render: function() {
            this.$el.html(ManageSecurityLevelTpl({
                lang: lang              
            }));
            
            this.renderItemList();
        },

        renderItemList : function(){
            this._renderEmptyList(this.listOffset);
            this._renderDBListReplaceWithEmptyList();
            this.$el.find('tr:last').addClass('last');
        },
        
        /***
         * offset만큼 emptylist 템플릿을 그린다.(level값만 가지고 있음)
         * @param listOffset
         */
        _renderEmptyList : function(listOffset){
            var self = this;
            this._makeOptionsTag();
            var start = 1, end = listOffset, level, optionsTag;
            if(start <= end){
                for(start ; start <= end ; start++){
                    level = start;
                    optionsTag = self._makeOptionsTag(level);
                    this.$el.find('tbody').append(ManageSecurityLevelListTpl({
                        level : level,
                        optionsTag : optionsTag
                    }));
                }
            }
        },
        
        _makeOptionsTag : function(selected){
            var listOffset = this.listOffset;
            var start = 1, end = listOffset, level;
            var html = '';
            if(start <= end){
                for(start ; start <= end ; start++){
                    level = start;
                    if(selected == level){
                        html += '<option value="'+level+' " selected>'+level+'</option>';
                    }else{
                        html += '<option value="'+level+' ">'+level+'</option>';                        
                    }
                }
            }
            return html;
            
        },
        
        /**
         * collection의 list의 seq값을 읽어서 empty리스트의 해당하는 seq위치의 엘리먼트를 replace한다.
         */
        _renderDBListReplaceWithEmptyList : function(){
            var self = this;
            targetEl = this.$el.find('#securityLevel_tbody > tr');
            _.each(this.collection.models, function(model, index){
                this.$el.find('tr[data-level='+model.get('level')+']').replaceWith(ManageSecurityLevelListTpl(
                    _.extend({optionsTag : self._makeOptionsTag(model.get('level'))}, model.toJSON())
                ));
            }, this);
        },
        
        /***
         * api에 넘겨줄 list값을 만듬
         * @returns
         */
        _makeData : function(){
            var targetEl, models = [];
            for(var i = 0; i < this.listOffset ; i++){
                targetEl = this.$el.find('#securityLevel_tbody > tr').eq(i);
                this.securityLevels = new AdminSecurityLevelItemModel();
                this.securityLevels.set('id', $(targetEl).attr('data-id'));
                this.securityLevels.set('level', $(targetEl).find('td select option:selected').val());
                this.securityLevels.set('name', $(targetEl).find('input[name=securityName]').val());
                this.securityLevels.set('useFlag',  $(targetEl).find('input[name=useFlag]').is(':checked'));
                
                if (!this.securityLevels.isValid()) { //id가 있는 경우(기존에 등록되어 있는 리스트) name이 없으면 valid error 및 name의 글자수 체크
                    $.goMessage(lang[this.securityLevels.validationError]);
                    $(targetEl).find('input[name=securityName]').select();
                    return false;
                }
                
                if(!this.securityLevels.haveIdAndName()){ //id와 name이 없으면 list에 포함하지 않는다.
                    continue;
                }
                
                models.push(this.securityLevels);
            }
            
            return models;
        },
        
        _doSave : function(){
            var securityLevelList = this._makeData(), 
                self = this;
            
            if (!securityLevelList) {
                return false;
            }
            
            this.model.set('securityLevel', securityLevelList);
            if (!this.model.isValid()) { //id가 있는 경우(기존에 등록되어 있는 리스트) name이 없으면 valid error 및 name의 글자수 체크
                $.goMessage(lang[this.model.validationError]);
                return false;
            }
            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            this.model.save({},{
                type : 'POST',
                async: false, 
                success: function(data, response) {
                    if(response.code == '200') {
                    	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        $.goAlert(commonLang["저장되었습니다."], "", function() {
                        	self.collection.fetch({
                        		asnyc : false,
                        		success: function() {
                        			self.render();
                        		}
                        	});
                        });
                    }
                },
                error : function(model, rs) {
                    var responseObj = JSON.parse(rs.responseText);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    if (responseObj.message) {
                        $.goError(responseObj.message);
                        return false;
                    } else {
                        $.goError(commonLang['저장에 실패 하였습니다.']);
                        return false;
                    }
                }
            });
        },
        
        _doCancel : function(){
            this.render();
        },
        
        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        }
    });
    
    return ManageSecurityLevelView;
});