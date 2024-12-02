(function($) {
    
    module('jquery file upload');

    test("initailize", function() {
        // given
        require("../../../../js/libs/fileupload/jquery-fileupload.js", function(FileUpload){
            ok(FileUpload != undefined, "Passed!!");
        });
    });
}).call(this, jQuery);