define("admin/views/info_layer", function(require){
    var Backbone = require("backbone");
    var Tmpl = require("hgn!admin/templates/info_layer");

    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require('i18n!nls/commons');
    var BackdropView = require('components/backdrop/backdrop');

    var GroupLayerView = Backbone.View.extend({
        className:'btn_wrap',
        tagName:'span',
        id:'menuDescBtn',
        events: {
        },

        initialize: function (opt) {
            this.title =  opt.title;
            this.title_desc = opt.title_desc;
            this.contents = opt.contents;
            this.target = opt.target;
        },

        render: function () {
            this.$el.html(Tmpl({
                CommonLang: CommonLang,
                AdminLang: AdminLang,
                TimelineLang: TimelineLang,
                title:this.title,
                title_desc:this.title_desc,
                contents:this.contents
            }));
            
            this.target.find('#menuDescBtn').remove();

            this.target.append(this.$el);

            this.appendMenuExample();
        },

        appendMenuExample : function() {
            $('span#menuDescBtn').on('click', this.toggleMenuDesc);
            $("span#menuDescBtn ul.tab_v span.menu").on('mouseover', this.showExampleByDomainCode);

            this.initFirst();
        },

        initFirst: function () {
            this.$el.find('.menu').removeClass('on');
            this.$el.find('div.tab_v_content').hide();

            if( !!this.contents  && this.contents.length > 0 ){
                $(this.$el.find('.menu')[0]).addClass('on');
                $(this.$el.find('div.tab_v_content')[0]).show();
            }
        },

        toggleMenuDesc: function () {
            if(!this.backdropView) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = $("div[el-backdrop]");
                this.backdropView.linkBackdrop($("#menuDescBtn"));
            }
        },

        showExampleByDomainCode : function (e) {
            var $domainCodeExamples = $("span#menuDescBtn ul.tab_v li");
            $domainCodeExamples.find("span.menu").removeClass('on');
            $domainCodeExamples.find("div.tab_v_content").hide();
            $(e.currentTarget).addClass('on');
            $(e.currentTarget).closest('li').find("div.tab_v_content").show();
        },

    });



    return GroupLayerView;
});