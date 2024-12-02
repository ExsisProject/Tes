;(function() {

    define([
        "app",
    ],

    function(GO) {
        var ErrorController = (function() {
            // Constructor
            var Controller = function() {
            };

            Controller.prototype = {
                page403: function() {
                    window.location.href = GO.contextRoot + 'error/403';
                },
                
                page500: function() {
                    window.location.href = GO.contextRoot + 'error/500';
                }
            };

            return Controller;
        })();

        return new ErrorController;
    });
}).call(this);