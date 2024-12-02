(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/company_manage",
            "welfare/views/title",
            "welfare/views/company_manage_tab",
            "welfare/views/company_manage_config",
            "welfare/views/company_manage_list"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            TitleView,
            TabView,
            BasicConfigView,
            ManageListView
        ) {
            var CONTENT_TYPE = {
                "BASIC_CONFIG" : "basic_config",
                "WELFARE_MANAGE" : "welfare_manage"
            };

            var Manage = Backbone.View.extend({
                events: {},

                initialize: function () {
                    this.$el.off();
                    this.tabView = new TabView();

                    // message event listener
                    this.tabView.on("company_config.tabclick", $.proxy(this.changeTab, this));

                    // default type
                    this.type = CONTENT_TYPE["BASIC_CONFIG"];
                },

                render: function () {
                    this.$el.html(Tmpl());
                    this.$el.find('header.content_top').html(new TitleView().render("전사 복지포인트 관리").el);

                    // TAB render
                    this.$el.find("#manage_tab").html(this.tabView.render().$el);

                    // BasicConfig Content render
                    var basicConfigView = new BasicConfigView();
                    this.$el.find("#manage_content").html(basicConfigView.render().$el);

                    return this;
                },

                renderContent : function(){
                    var $content = this.$el.find("#manage_content");
                    if(this.type == CONTENT_TYPE["BASIC_CONFIG"]){
                        var basicConfigView = new BasicConfigView();
                        $content.html(basicConfigView.render().$el);
                    }else{  //welfare_manage
                        var manageListView = new ManageListView();
                        $content.html(manageListView.render().$el);
                    }
                },

                // 추후 메뉴가 추가되었을때 사용.
                changeTab : function(data){
                    if(this.type == data.type){
                        return;
                    }

                    this.type = data.type;
                    this.renderContent();
                }

            });

            return Manage;

        });

})();