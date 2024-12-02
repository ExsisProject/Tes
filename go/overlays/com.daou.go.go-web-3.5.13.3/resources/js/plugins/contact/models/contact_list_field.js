(function() {
    define([
        "jquery",
        "backbone",
        "app",

		"i18n!contact/nls/contact",
		"i18n!nls/commons"
    ],
    function(
        $,
        Backbone,
        App,

		contactLang,
		commonLang
    ) {

		var FIELDLIST = [
			{'fieldCode' : 'NAME', 'displayName':contactLang['이름(표시명)'], 'disabled':true, 'checked':true},
			{'fieldCode' : 'POSITION', 'displayName':contactLang['직위'], 'disabled':false, 'checked':false},
			{'fieldCode' : 'MOBILE', 'displayName':contactLang['휴대폰'], 'disabled':true, 'checked':true},
			{'fieldCode' : 'EMAIL', 'displayName':commonLang['이메일'], 'disabled':false, 'checked':true},
			{'fieldCode' : 'DEPARTMENT', 'displayName':contactLang['부서'], 'disabled':false, 'checked':false},
			{'fieldCode' : 'COMPANY', 'displayName':contactLang['회사'], 'disabled':false, 'checked':true},
			{'fieldCode' : 'COMPANY_PHONE', 'displayName':contactLang['회사전화'], 'disabled':false, 'checked':true},
			{'fieldCode' : 'COMPANY_ADDRESS', 'displayName':contactLang['회사주소'], 'disabled':false, 'checked':false},
			{'fieldCode' : 'MEMO', 'displayName':contactLang['메모'], 'disabled':false, 'checked':false},
			{'fieldCode' : 'GROUP', 'displayName':contactLang['그룹'], 'disabled':false, 'checked':true}
		];


    	var ContactListFieldModel = Backbone.Model.extend({
    		initialize: function(options) {
    		    this.options = options || {};
    		    this.isGetFieldList = this.options.isGetFieldList;
    		},

    		url : function(){

				return GO.config('contextRoot') + 'api/contact/fields';
    		},

			parse: function(parsemodel){

				if(parsemodel.data == null){
					return parsemodel;
				}

				var data = parsemodel.data;
				var fieldList = FIELDLIST;
				if(data.length == 0){
					parsemodel.data = FIELDLIST;
				}else{

					//check 설정 초기화
					_.each(fieldList, function(field){
						field.checked = false;
					});

					//check 설정
					_.each(data, function(item){
						_.each(fieldList, function(field){
							if(field.fieldCode == item.fieldCode){
								field.checked = true;
							}
						});
					});
					parsemodel.data = FIELDLIST;
				}

				return parsemodel;
			},

			getContactListFields : function(){
				return this.get('data');

			}
		});

    	return ContactListFieldModel;
    });
}).call(this);