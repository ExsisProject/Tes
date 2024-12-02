(function(){
define([
    "backbone", 
    "app", 
    "jquery",
    "models/dept_profile",
    "hgn!templates/dept_profile_card",
    "i18n!nls/commons", 
    "jquery.go-popup",
    "jquery.fancybox"
], 
function(
    Backbone, 
    App, 
    $,
    DeptProfileCardModel,
    tplDeptProfileView,
    commonLang
) {
    var instance = null,
        lang = {
            'send_mail' : commonLang['메일 보내기'],
            'show_calendar' : commonLang['일정 보기'],
            'dept_manager' : commonLang['부서장'],
            'dept_member' : commonLang['부서원'],
            'sendmail_to_dept' : commonLang['부서원 전체에게 메일 보내기'],
            'none' : commonLang['없음'],
            'count' : commonLang['명']
    };
    
    var DeptProfileView = Backbone.View.extend({
        el : "#gpopupLayer",
        initialize: function(options) {
        	this.options = options || {};
        	this.isAvailableMail = GO.isAvailableApp('mail');
        	if(this.el) this.unbindEvent();
        },
        bindEvent : function() {
            $(this.el)
            	.on("click", "li.mail", $.proxy(this.moveToSendMail, this));
        },
        unbindEvent : function() {
            $(this.el)
            	.off("click", "li.mail");
        },
        moveToSendMail : function() {
        	var data = this.model.toJSON(),
        		url = GO.router.getSendMailUrl({
        			name : data.name,
        			email : data.email
        		});
        	
            if(url) window.open(url,"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=1280,height=760");
            	//window.location.href = url;
            return false;
        },
        render: function(){
            this.model = DeptProfileCardModel.read(this.options.deptId);
            
            var data = this.model.toJSON(),
                ancestorsName = this.__makeAncestorsDeptsName(data);
            
            data["ancestorsName"] = ancestorsName;
            data["email"] = (data["emailId"] != "" ? data['email']:false) || false;
            
            this.__setIsExistMaster(data);
            var tpl = tplDeptProfileView($.extend(data, {
            	lang : lang,
            	isAvailableMail : this.isAvailableMail,
            	hasChildren : (data.childrenCount <= 0 || data.memberCount <= 0) ? false : true,
            	isRootDept : data.parentCode == undefined ? true : false
            }));
            var popupOptions = {
                "pclass" : "layer_card",
                "modal" : false,
                "width" : 220,
                "contents" :  tpl
            };
            if(this.options.offset) {
                popupOptions.offset = this.options.offset;
            } 
            else if (this.targetEl) {
            	var targetEl = $(this.targetEl) , 
					targetOffset = targetEl.offset(), 
					windowWidth = $(window).width(), 
					upperRightLeft = targetOffset.left + targetEl.width() + popupOptions.width;
				
				popupOptions.offset = {
					top : targetOffset.top + targetEl.height()+5,
					left : targetOffset.left + targetEl.width()+5
				};
				
				// 오른쪽 영역밖을 벗어났을 경우 보정...(추후 go-popup 자체서 보정하도록 변경)
				if(windowWidth < upperRightLeft) {
					// 둥근 모서리 만들기 위해 좌우상하 12px씩 마진을 줘야 함....
					var roundFix = 32, 
						delta = upperRightLeft - windowWidth + roundFix;
					popupOptions.offset.left -= delta;
				}
            }
            this.el = $.goPopup(popupOptions);
            this.el.draggable({
				handle : '.handle',
				cursor: "move",
				start : function( event, ui ) {
					$(this).css('bottom', '');
				}
				
			});
			//if($.browser.mozilla){
            $('div.layer_card').css('top', '50%');
			//}else{
			//	$('div.layer_card').css('top', 'initial');
			//}

            this.bindEvent();
        },
        __setIsExistMaster : function(data){
            if(data.masterName == ""){
                data["isExistMaster"] = false;
            }else{
                data["isExistMaster"] = true;
            }
        },
        __makeAncestorsDeptsName : function(data){
            var ancestors = data.ancestors;
            var ancestorsName = ancestors[0];
            
            for(var i = 1 ; i < ancestors.length ; i++){
                ancestorsName += " > " + ancestors[i];
            }
            return ancestorsName;
        }
    });
    return {
        render: function(deptId, targetEl, offset) {
            if(instance == null) {
                instance = new DeptProfileView({ deptId : deptId, targetEl : targetEl, offset : offset });
            } else {
                instance.options.deptId = deptId;
                instance.options.targetEl = targetEl;
                instance.options.offset == offset;
            }
            instance.render();
        }
    };
});
})(jQuery);