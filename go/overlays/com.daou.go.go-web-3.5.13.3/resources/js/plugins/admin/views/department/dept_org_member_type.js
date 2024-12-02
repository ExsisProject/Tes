(function(){
define([
	"jquery",
	"backbone", 	
	"app",
    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "jquery.go-sdk"
], 

function(
	$, 
	Backbone,
	App,
	adminLang,
	commonLang
) {
	var deptMemberType = null,
		tplVar = {
		'save' : commonLang['저장'],
		'cancel' : commonLang['취소'],
		'none' : adminLang['미지정'],
		'MASTER' : adminLang['부서장'],
		'MODERATOR' : adminLang['부부서장'],
		'MEMBER' : adminLang['부서원']
	};	

	var MemberType = Backbone.View.extend({
		events : {
			"click .ic_edit_done" : "saveType",
			"click .ic_edit_cancel" : "cancelType"
		},
		
		initialize: function(options) {
			this.options = options || {};
			this.typeData = ['MASTER', 'MODERATOR', 'MEMBER'];
			this.baseTpl = [ '<span class="table_editable" style="margin-top:-4px;margin-bottom:-5px">','<select><options></options></select>&nbsp;',
	           '<span class="btn_wrap"><span class="ic ic_edit_done" title="', tplVar['save'], '"></span><span style="margin-left:2px" class="ic ic_edit_cancel" title="',tplVar['cancel'],'"></span></span></span>'
	   		];
			this.$el.html(this.baseTpl.join(''));
		},
		
		render : function() {
			var self = this;
			this.typeSelect = this.$el.find('select');
			$.each(this.typeData, function(k,v) {
				self.typeSelect.append('<option value="'+v+'">'+tplVar[v]+'</option>');
			});
			this.typeSelect.val(this.options.type);
			
			return this;
		},
		
		getBaseTag : function(data) {
			var tpl = ['<span class="btn_wrap btn_member_type table_editable" id="memType', this.options.memberId, '" data-id="', this.options.memberId ,'" data-type="', data.type ,'"><span class="txt">',
		           		tplVar[data.type], '</span><span class="ic ic_select"></span></span>'];
			
			return tpl.join('');
		},
		cancelType : function() {
			this.$el.html(this.getBaseTag({ type : this.options.type || 'MEMBER' }));
		},
		saveType : function() {
			var self = this,
				url = [GO.contextRoot + 'ad/api/deptmember', this.options.memberId, 'type'],
				type = this.$el.find('select').val();
			$.go(url.join('/'), JSON.stringify({ type  :  type}), {
				qryType : 'PUT',
				contentType : 'application/json',
				responseFn : function(rs) {
					if(rs.code == 200) {
						if(rs.data.type == 'MASTER') {
							GO.EventEmitter.trigger('department', 'changed:memberType', 'MASTER');
						} else {
							self.$el.html(self.getBaseTag(rs.data));
						}
					} else {
						
					}
				}
			});
		}
	});
	
	return MemberType;
});
}).call(this);