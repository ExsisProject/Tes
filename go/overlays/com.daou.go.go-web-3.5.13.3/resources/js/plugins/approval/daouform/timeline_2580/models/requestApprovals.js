define(function(require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var RequestApprovalModel = require('approval/daouform/timeline_2580/models/requestApproval');
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var commonLang = require('i18n!nls/commons');

    var RequestApprovalCollection = Backbone.Collection.extend({

        model : RequestApprovalModel,

        initialize : function(options) {
        },

        add : function(model, options) {
            if( !(validateReason() && validateName()) ) {
                return;
            }

            function validateName() {
                if (!model.get('name')) {
                    $.goSlideMessage(TimelineLang["근무 구분을 선택하여 주십시오."]);
                    return false;
                }
                return true;
            }
            function validateReason() {
                if (!model.get('reasons')) {
                    $.goSlideMessage(TimelineLang["사유를입력해주세요"]);
                    return false;
                }
                //oracle 한글 한자 3byte로 취급 4000/3
                var descriptionDBColumnMaxLength = 1333;
                var maxLength = model.get('reasonsMaxLength') ? parseInt(model.get('reasonsMaxLength')) : descriptionDBColumnMaxLength;
                if(maxLength > descriptionDBColumnMaxLength) {
                    maxLength = descriptionDBColumnMaxLength;
                }
                var isOverMaxLength = model.get('reasons')
                    && (model.get('reasons').length > maxLength);
                if (isOverMaxLength) {
                    if(maxLength === descriptionDBColumnMaxLength) {
                        maxLength = "(4000byte)1333";
                    }
                    $.goSlideMessage(GO.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], "arg1", maxLength));
                    return false;
                }
                return true;
            }

            Backbone.Collection.prototype.add.call(this, model, options);
        },

        convertJsonToCollection : function(data) {
            var self = this;
            if (!data.data) {
                return;
            }

            var models = $.parseJSON(data.data);
            _.each(models, function(model) {
                self.add(new RequestApprovalModel(model));
            })
        },

        convertCollectionToJson : function() {
            return JSON.stringify(this);
        }
    });



    return RequestApprovalCollection;
})
