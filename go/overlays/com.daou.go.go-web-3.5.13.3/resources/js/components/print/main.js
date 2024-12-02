//;(function() {
//    define([
//        'jquery',
//        'backbone',
//        'app',
//        'i18n!nls/commons',
//        "components/print/views/print",
//    ],
//    function(
//        $,
//        Backbone,
//        GO,
//        CommonLang,
//        PrintView
//    ) {
//
//        var PrintAppView = Backbone.View.extend({
//            initialize: function() {
//                this.printView = new PrintView(this.options);
//            },
//
//            render : function(){
//                this.$el = this.printView.render().$el;
//                return this;
//            },
//
//            setContent : function(content){
//                return this.printView.setContent(content);
//            },
//
//            print : function(){
//                return this.printView.print();
//            },
//
//            cancel : function(){
//                this.printView.cancel();
//            }
//        });
//
//        return PrintAppView;
//    });
//}).call(this);