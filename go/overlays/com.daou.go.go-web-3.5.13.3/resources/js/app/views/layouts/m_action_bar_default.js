define([
        "jquery",
        "underscore",
        "backbone",
        "app",
        "hgn!templates/layouts/m_action_bar_default"

    ],
    function(
        $,
        _,
        Backbone,
        GO,
        LayoutTpl
    ) {

        return Backbone.View.extend({

            initialize : function(options){
                this.options = options || {};
                this.menu = options.useMenuList;
                this.hasTitle = options.hasTitle;
            },

            render : function(){
                this.$el.html(LayoutTpl());
                this.renderToolbar();
                return this;
            },

            renderToolbar : function(){
                this.renderToolbarMenu(this.menu);
            },

            renderToolbarMenu : function(useMenuList){
                if(!useMenuList) {
                    return;
                }
                var itemsWidth = 0; //시작(8) 끝(10) 여백
                var expectedBtnWidth = 48; //버튼의 width 는 그려주기 전까진 알 수 없어서 어림잡은 width
                var needMore = false;
                var deviceWidth = $(window).width();
                var titleWidth = this.hasTitle ? $("h1#appTitle").width() : 0;
                var emptyWidth = (deviceWidth - titleWidth) / 2; //title 있으면 그 옆 빈공간, 없으면 화면의 반에 메뉴넣기
                useMenuList.forEach($.proxy(function(menu){
                    var $item = $(this.makeMenuItemTemplate(menu));
                    itemsWidth += expectedBtnWidth;
                    if(emptyWidth > itemsWidth && !menu.inMoreBtn) {
                        this.$el.find("#moreItemLi").before($item, '\n');
                    }else{
                        this.$el.find("#moreMenuItem").append($item, '\n');
                        needMore = true;
                    }
                    if(needMore){
                        $("#moreItemLi").show();
                    }
                }),this);
                if(needMore){
                    this.$el.find("#moreItemLi").show();
                }

            },

            menuBarAllowWidthPolicy : function(context, curWidth){
                var MORE_BTN_WIDTH = 34;
                return (curWidth - context.$el.width() + MORE_BTN_WIDTH > 0);
            },

            isSelectType: function (menu) {
                return !_.isUndefined(menu.selectId);
            },
            isCommentType: function (menu) {
                if(menu.id == 'show_comment_list'){
                    return true;
                }else if(menu.id == 'calendar-comment') {
                    return true;
                }else if(menu.id == 'docs-reply'){
                    return true;
                }else if(menu.cls == 'btn_comments'){
                    return true;
                }
                return false;
            },
            isActivityCommentType: function (menu) {
                if(menu.id == 'show_activity_comment_list'){
                    return true;
                }
                return false;
            },
            makeMenuItemTemplate: function(menu) {
                var html = [];

                if(this.isSelectType(menu)){
                    html = this._makeSelectTemplate(html, menu);
                }else {
                    html = this._makeButtonTemplate(html, menu);
                }
                return html.join('');
            },

            makeMoreMenuItemTemplate: function(menu) {
                var html = [];
                var btnClass = _.isUndefined(menu.cls) ? "" : menu.cls;
                html.push('<li><a id="' + menu.id + '" name="' + menu.name +'" class="'+ btnClass +'">');
                html.push('<span class="txt">' + menu.text + '</span>');
                html.push('</a></li>');

                return html.join('');
            },

            _makeSelectTemplate: function (html, menu) {
                var selectBox = this.$el.find("#"+menu.selectId);
                if(selectBox.length > 0){
                    selectBox.append('<option value="' + menu.id + '">' + menu.text + '</option>');
                }else{
                    html.push('<li><a href="javascript:;" class="btn_tool btn_slt">');
                    html.push('<span class="txt">' + menu.text + '</span>');
                    html.push('<span class="ic_cmm ic_dropdown_small"></span>');
                    html.push('<select class="slt_move" id="' + menu.selectId + '" select-trigger="'+menu.selectTriggerFunc+'">');
                    html.push('<option value="' + menu.id + '">' + menu.text + '</option>');
                    html.push('</select>');
                    html.push('</a></li>')
                }
                return html;
            },

            _makeButtonTemplate: function (html, menu) {
                var btnClass = _.isUndefined(menu.cls) ? "btn_tool" : "btn_tool " + menu.cls;

                if(_.isUndefined(menu.url)){
                    html.push('<li><a style="'+menu.style+'" data-trigger="'+menu.triggerFunc+'" data-role="button" id="' + menu.id + '" name="' + menu.name + '">');
                }else{
                    html.push('<li><a style="'+menu.style+'" data-trigger="'+menu.triggerFunc+'" data-role="button" id="' + menu.id + '" name="' + menu.name + '" href="'+menu.url+'">');
                }
                /*if(menu.id == "previous"){
                    html.push('<span class="ic ic_arrow3_t"></span>\n');
                }else if(menu.id == "next"){
                    html.push('<span class="ic ic_arrow3_d"></span>\n');
                }*/
                html.push('<span>'+menu.text+'</span>');
                if (this.isCommentType(menu)) {
                    if(_.isUndefined(menu.commentsCount)){
                        html.push('<span class="count" id="commentCount"></span>');
                    }else{
                        html.push('\n');
                        html.push('<span class="num" id="commentCount">' + menu.commentsCount + '</span>');
                    }
                }
                if (this.isActivityCommentType(menu)) {
                    html.push('<span class="count" id="activityCommentCount"></span>');
                }
                html.push('</a></li>');
                return html;
            }
        });
    });