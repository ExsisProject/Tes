define('admin/views/account/domain_code_sample', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var DomainCodeSampleTpl = require('hgn!admin/templates/domain_code_sample');
    var DomainCodeSampleListTpl = require('hgn!admin/templates/domain_code_sample_list');

    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var sample_data = require("admin/constants/domain_code_sample_data");

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var lang = {
        template : adminLang["템플릿"],
        name : adminLang["명칭"],
        code : adminLang["코드"]
    };


    var DomainCodeSampleView = Backbone.View.extend({
        el : '#sampleArea',

        events : {
            "change select#selectCategory" : "renderSampleList",
            "click input#sampleCheckAll" : "checkAllSample",
            "click input.sampleCheckbox" : "checkSample"
        },

        initialize: function (companyLocale) {
            this.companyLocale = companyLocale;
        },

        render: function (type) {
            this.type = type;
            var targetSample = this.getTargetSample();

            this.$el.html(DomainCodeSampleTpl({
                lang: lang,
                targetSample : targetSample
            }));

            this.renderSampleList(targetSample);
        },

        renderSampleList : function (sample) {
            this.selectedCategoryVal = this.$el.find("#selectCategory option:selected").val();

            this.$el.find("#codeSampleList").empty().html(DomainCodeSampleListTpl({
                data : _.findWhere(Array.isArray(sample) ? sample : this.getTargetSample(), {category: this.selectedCategoryVal}),
                isKoLocale : this.companyLocale == 'ko',
                isEnLocale : this.companyLocale == 'en',
                isJpLocale : this.companyLocale == 'jp',
                isZhcnLocale : this.companyLocale == 'zhcn',
                isZhtwLocale : this.companyLocale == 'zhtw',
                isViLocale : this.companyLocale == 'vi'
            }));
        },

        getTargetSample : function() {
            switch (this.type) {
                case 'position':
                    return sample_data.positionSample;
                case 'grade':
                    return sample_data.gradeSample;
                case 'duty':
                    return sample_data.dutySample;
                case 'usergroup':
                    return sample_data.usergroupSample;
            }
        },

        checkAllSample : function() {
            if(this.$el.find("#sampleCheckAll").prop("checked")){
                this.$el.find("#codeSampleList input:checkbox").prop("checked", true);
            } else {
                this.$el.find("#codeSampleList input:checkbox").prop("checked", false);
            }
        },

        checkSample : function(e) {
            if(!$(e.currentTarget).prop("checked")){
                this.$el.find("#sampleCheckAll").prop("checked", false);
            }
        },

        setSampleItem : function () {
            var self = this;
            var checkedCodes = this.$el.find("#codeSampleTable input.sampleCheckbox:checked");
            if(checkedCodes.size() == 0) {
                $.goSlideMessage(adminLang["템플릿에서 가져올 항목을 선택하세요."]);
                return;
            }

            var selectedSampleItems = [];
            var categorySample = _.findWhere(this.getTargetSample(), {category: this.selectedCategoryVal});

            $.each(checkedCodes, function(k,v){
                var targetItem = _.findWhere(categorySample.data, {code : $(v).attr('id')});
                selectedSampleItems.push(targetItem);
            });

            $.ajax({
                type: 'POST',
                data : JSON.stringify(selectedSampleItems),
                dataType: 'json',
                contentType : "application/json",
                async : false,
                url: GO.config("contextRoot") + 'ad/api/domaincodes/' + self.type,
                success: function() {
                    $.goSlideMessage(adminLang["선택한 항목을 모두 가져왔습니다"]);
                    checkedCodes.attr("checked", false);
                    self.$el.find("#sampleCheckAll").attr("checked", false);
                },
                error: function(resp) {
                    self.alertErrorMsg(resp.responseJSON);
                }
            });
        },

        alertErrorMsg : function(responseJSON) {
            var responseMsg = responseJSON.message;
            if(responseJSON.code == '400') {
                $.goError(responseMsg);
            } else {
                $.goError(commonLang["실패"], responseMsg != null ? responseMsg : commonLang["실패했습니다."]);
            }
        }
    });

    return DomainCodeSampleView;
});