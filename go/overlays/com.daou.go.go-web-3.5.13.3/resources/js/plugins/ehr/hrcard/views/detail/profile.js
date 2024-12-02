define([
        "backbone",
        "app",
        "hgn!hrcard/templates/detail/profile",
        "i18n!hrcard/nls/hrcard"
        ],
function(
		Backbone,
		GO,
		ProfileTpl,
		Lang
		) {
	var lang = {
		label_name 				: Lang["이름"],
		label_group 			: Lang["소속"],
		label_employeeNumber 	: Lang["사번"],
		label_telephone			: Lang["내선번호"],
		label_email				: Lang["이메일"],
		label_mobile			: Lang["휴대번호"],
		label_rank				: Lang["직위직책"],
		label_phone				: Lang["대표전화"]
	};
	
	
	var BasicView = Backbone.View.extend({
		
		initialize : function(options) {
			this.options = options || {};
       		this.userid = this.options.userid; 
		},
		
		render : function() {
			var _this = this;
			
			var ProfileModel = Backbone.Model.extend({
       			url : GO.contextRoot + "api/ehr/hrcard/info/profile/" + this.userid
       		});
			
			this.profileModel = new ProfileModel();    
			this.profileModel.fetch().done(function(){
				_this.$el.html(ProfileTpl({
					lang : lang,
					data : _this.profileModel.toJSON()
				}));
			});
			
			return this;
		}
	});
	
	return BasicView;
	
});