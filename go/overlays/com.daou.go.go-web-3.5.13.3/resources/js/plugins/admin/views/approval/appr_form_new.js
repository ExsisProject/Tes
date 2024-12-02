define([
    "backbone",
    "app",
    "admin/models/appr_form",
    "admin/views/appr_form",
    "jquery.go-sdk"
], 

function(
    Backbone,
    App,
    ApprFormModel,
    ApprFormView
) {

    /**
    * 결재 양식 생성 뷰
    */
    var ApprFormNewView = Backbone.View.extend({

        apprFormView: null,

        initialize : function(){
            this.apprFormView = new ApprFormView({
                model: new ApprFormModel({
                    folder: {
                        id: this._getFolderId()
                    }
                })
            });
        },
        
        render : function() {
            this.apprFormView.render();
        },

        _getFolderId: function() {
            var pathSplit = GO.router.getUrl().split('/');
            return pathSplit[_.indexOf(pathSplit, 'formfolder') + 1];
        }
    }, {
    	render: function() {
            var instance = new ApprFormNewView();
            return instance.render();
        }
    });

    return ApprFormNewView;
});