    define([
        "jquery",
        "approval/collections/appr_base_doclist"
    ], 
    function(
        $,
        ApprBaseDocList
    ) {

        var UserOfficialDocList = ApprBaseDocList.extend({

            url: function() {
                return '/api/approval/doclist/userofficial/' + this.type + '?' + this._makeParam();
            },
            
            getCsvURL: function() {
                return '/api/approval/doclist/userofficial/all/csv?' + this._makeParam();
            }
        });

        return UserOfficialDocList;
    });