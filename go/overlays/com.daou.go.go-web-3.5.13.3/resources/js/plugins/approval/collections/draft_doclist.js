    define([
        "jquery",
        "approval/collections/appr_base_doclist"
    ], 
    function(
        $,
        ApprBaseDocList
    ) {

        var DraftDocList = ApprBaseDocList.extend({

            url: function() {
                return '/api/approval/doclist/draft/' + this.type + '?' + this._makeParam();
            },
            
            getCsvURL: function() {
                return '/api/approval/doclist/draft/all/csv?' + this._makeParam();
            }
        });

        return DraftDocList;
        
    });