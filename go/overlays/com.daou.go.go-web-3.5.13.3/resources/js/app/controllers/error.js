;(function() {

    define([
        "underscore", 
        "app", 
        "i18n!nls/commons",
    ], 

    function(
        _, 
        GO, 
        commonLang
    ) {
        var ErrorController = (function() {
            // Constructor
            var Controller = function() {
            };
            
            Controller.prototype = {
                page403: function() {
                    renderPage( "403" );
                }, 
                
                page404: function() {
                    renderPage( "404" );
                }, 
                
                page500: function() {
                    renderPage( "500" );
                }
            };

            return Controller;
        })();
        
        function renderPage( errorcode, desc ) {
            require([
                 "views/layouts/fullpage", 
                 "views/error"
             ], 
             function(
                 FullpageLayout, 
                 ErrorPageView
             ) {
                 var fullLayout = FullpageLayout.create();  
                 
                 fullLayout.render().done(function(layout) {
                     var page = new ErrorPageView({ "code": errorcode });
                     page.render();
                     
                     $(".go_body").html(page.el);
                 });
             });
        };

        return new ErrorController;
    });
}).call(this);