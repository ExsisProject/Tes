(function(){
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!templates/user/user_config",
            "models/user_config",
            "models/time_zone",
            "models/site_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!nls/user"
    ],
    function(
        $,
        Backbone,
        App,
        ConfigTmpl,
        UserConfigModel,
        TimeZone,
        SiteConfigModel,
        CommonLang,
        AdminLang,
        UserLang
    ){
        UserConfig = Backbone.View.extend({
            type : {
                ko : CommonLang["한국어"],
                en : CommonLang["영어"],
                ja : CommonLang["일본어"],
                vi : CommonLang["베트남어"],
                zh_cn : CommonLang["중국어 간체"],
                zh_tw : CommonLang["중국어 번체"],
                saveFail : CommonLang["저장에 실패 하였습니다."],
                saveSuccess : CommonLang["저장되었습니다."],
                save : CommonLang["저장"],
                cancel : CommonLang["취소"],
                title : UserLang["환경설정"],
                language : UserLang["언어설정"],
                timezone : UserLang["시간설정"],
                notification : UserLang["알림설정"],
    			use_abbroad_ip_check : UserLang["해외 로그인 차단"],
    			help_use_abbroad_ip_check : UserLang["해외 로그인 차단 도움말"],
    			use : UserLang["사용함"],
    			not_use : UserLang["사용하지 않음"],
    			skin : AdminLang["스킨 설정"],
    			basic : AdminLang['기본'],
                theme : CommonLang["메뉴 테마 설정"],
                themeClassicDesc : UserLang["기본형 메뉴 설명"],
                themeAdvancedDesc : UserLang["2.6 메뉴 설명"]
            },
            el : "#content",
            delegateEvents: function(events) {
                this.undelegateEvents();
                Backbone.View.prototype.delegateEvents.call(this, events);
                this.$el.on("click.userconfig", "#save", $.proxy(this.save, this));
                this.$el.on("click.userconfig", "#cancel", $.proxy(this.cancel, this));
                return this;
            },
            undelegateEvents: function() {
                Backbone.View.prototype.undelegateEvents.call(this);
                this.$el.off(".userconfig");
                return this;
            },
            initialize : function(){
                $(this.el).removeClass("go_home");
                this.model = UserConfigModel.read(GO.session().id);
                this.time_zone = TimeZone.read();
                this.siteConfigModel = SiteConfigModel.read().toJSON();
            },
            save : function(){
                var locale = $("#configForm [name=locale]").val(),
                    timeZone = $("#configForm  [name=timeZone]").val(),
                    noti = $("#configForm [type=radio][name=noti]:checked").val(),
                    useAbbroadIpCheck = $('#configForm [type=radio][name=useAbbroadIpCheck]:checked').val(),
                    style = $("#configForm [name=style]").val(),
                    theme = $('input[name="theme"]:checked').val(),
                    self = this,
                    saveCallBack = $.proxy(self.reload, self);
                
                this.model.set({
                    locale: locale,
                    timeZone : timeZone,
                    noti : noti,
                    useAbbroadIpCheck : useAbbroadIpCheck,
                    style : style,
                    theme : theme
                });
                this.model.save(null, {
                    success:function(){
                        $.goAlert(self.type.saveSuccess,"",saveCallBack);
                    },error:function(model, error){
                        $.goAlert(self.type.saveFail);
                    }
                });
                return false;
            },
            cancel : function(){
                $.goAlert(CommonLang["취소되었습니다."], "", $.proxy(this.render, this));
                return false;
            },
            reload : function(){
                window.location.reload(true);
            },
            render : function(){
                var locale = [
                      {value:"ko", text: this.type.ko}, 
                      {value:"en", text: this.type.en}, 
                      {value:"ja", text: this.type.ja},
                      {value:"zh_CN", text: this.type.zh_cn},
                      {value:"zh_TW", text: this.type.zh_tw},
                      {value:"vi", text: this.type.vi}
                      ],
                    noti = [
                      {value:"enable", text: "받음"},
                      {value:"disable", text: "받지 않음"}
                    ],
                    useAbbroadIpCheck = [
                      {value:true, text: this.type.use},
                      {value:false, text: this.type.not_use}
                    ],
                    skinStyle = [
                      {value: "basic", text: this.type.basic}, {value: "blue", text: "BLUE"}, {value: "orange", text: "ORANGE"}, 
		              {value: "red", text: "RED"}, {value: "yellow", text: "YELLOW"}, {value: "green", text: "GREEN"}
                    ],
                    timeZone = $.extend(true, [], this.time_zone.toJSON()),
                    useAbbroadIpCheckConfigOn = false,
                    useSkinStyleOn = true;
                
                    
                this.__setTimeZone(timeZone);
                this.__setLocale(locale);
                this.__setNoti(noti);
                this.__setUseAbbroadIpCheck(useAbbroadIpCheck);
                this.__setStyle(skinStyle);
                
                if(this.siteConfigModel.useAbbroadIpCheck == "on"){
                	useAbbroadIpCheckConfigOn = true;
                }
                
                if(this.model.toJSON().style == null || this.model.toJSON().style == 'undefind'){
                	useSkinStyleOn = false;
                }
                
                this.$el.html(ConfigTmpl(
                    {
                        timeZone : timeZone,
                        locale : locale,
                        noti : noti,
                        useAbbroadIpCheck : useAbbroadIpCheck,
                        skinStyle : skinStyle,
                        type : this.type,
                        useAbbroadIpCheckConfigOn : useAbbroadIpCheckConfigOn,
                        useSkinStyleOn : useSkinStyleOn,
                        isAdvancedTheme : this.model.get('theme') == 'THEME_ADVANCED'
                    }
                ));
                this._renderBrowserTitle();
            },
            _renderBrowserTitle : function(){
            	$(document).attr('title', this.type['title'] + ' - ' + GO.config('webTitle'));
            },
            __setNoti : function(noti){
                for(var i=0 ; i< noti.length; i++){
                    if(this.model.get("noti") == noti[i].value){
                        noti[i]["isNoti?"] = true;
                    }
                }
            },
            __setTimeZone : function(timeZone){
                for(var i=0 ; i< timeZone.length; i++){
                    if(this.model.get("timeZone") == timeZone[i].location){
                        timeZone[i]["isTimeZone?"] = true;
                    }
                }
            },
            __setLocale : function(locale){
                for(var i=0 ; i<locale.length; i++){
                    if(this.model.get("locale") == locale[i].value){
                        locale[i]["isLocale?"] = true;
                        break;
                    }
                }
            },
            __setUseAbbroadIpCheck : function(useAbbroadIpCheck){
            	for(var i=0 ; i< useAbbroadIpCheck.length; i++){
                    if(this.model.get("useAbbroadIpCheck") == useAbbroadIpCheck[i].value){
                    	useAbbroadIpCheck[i]["isUseAbbroadIpCheck?"] = true;
                    }
                }
            },
            __setStyle : function(style) {
            	for(var i=0; i<style.length; i++){
            		if(this.model.get("style") == style[i].value) {
            			style[i]["isStyle?"] = true;
            		}
            	}
            }
        });
        
        return {
            render: function() {
                var userConfig = new UserConfig();
                return userConfig.render();
            }
        };
        
    });
    
}).call(this);