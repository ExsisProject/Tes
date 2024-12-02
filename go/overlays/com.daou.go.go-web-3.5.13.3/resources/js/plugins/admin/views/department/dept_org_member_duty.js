(function(){
define([
	"jquery",
	"backbone", 	
	"app",
	"admin/collections/duty_list",
    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "jquery.go-sdk"
], 

function(
	$, 
	Backbone,
	App,
	dutyCollection,
	adminLang,
	commonLang
) {
	var tplVar = {
		'save' : commonLang['저장'],
		'cancel' : commonLang['취소'],
		'none' : adminLang['미지정']
	};	
	
	var MemberDuty = Backbone.View.extend({
		baseTpl : [ '<span class="table_editable" style="margin-top:-4px;margin-bottom:-5px;text-overflow: ellipsis;min-width: 10px;">','<select style="width:100px"><options></options></select>&nbsp;',
		           '<span class="btn_wrap"><span class="ic ic_edit_done" title="', tplVar['save'], '"></span><span class="ic ic_edit_cancel" title="',tplVar['cancel'],'" style="margin-left:2px"></span></span>'
		],
		
		events : {
			"click .ic_edit_done" : "saveDuty",
			"click .ic_edit_cancel" : "cancelDuty"
		},
		
		initialize: function(options) {
			this.options = options || {};
			this.dutyCollection = dutyCollection.getCollection();
			this.dutyData = this.dutyCollection.toJSON();
			
			this.$el.html(this.baseTpl.join(''));
		},
		
		render : function() {
			var dutySelect = this.$el.find('select');
			dutySelect.append('<option value="">'+tplVar['none']+'</option>');
			$.each(this.dutyData, function(k,v) {
				dutySelect.append('<option style="text-overflow: ellipsis;" value="'+v.id+'">'+v.name+'</option>');
			});
			if(this.options.dutyCode != 0) {
				dutySelect.val(this.options.dutyCode);
			}
			
			return this;
		},
		getBaseTag : function(data) {
			var dutyData = null;
			if(data.dutyId)  dutyData = this.dutyCollection.get(data.dutyId);
			var tpl = ['<span class="btn_wrap btn_member_job table_editable" id="memDuty', this.options.memberId, '" data-id="', this.options.memberId, '" data-code="' ];
			tpl.push( data.dutyId ,'"><span class="txt">', dutyData ? dutyData.attributes.name : tplVar['none']);
			tpl.push('</span><span class="ic ic_select"></span></span>');
			return tpl.join('');
		},
		cancelDuty : function() {
			this.$el.html(this.getBaseTag({ dutyId : this.options.dutyCode }));
		},
		saveDuty : function() {
			var self = this,
				url = [GO.contextRoot + 'ad/api/deptmember', this.options.memberId, 'duty'],
				dutyId = this.$el.find('select').val();
			
			$.go(url.join('/'), JSON.stringify({ dutyId :  dutyId}), {
				qryType : 'PUT',
				contentType : 'application/json',
				responseFn : function(rs) {
					if(rs.code == 200) {
			        	self.$el.html(self.getBaseTag(rs.data));
					}
				}
			});
		}
	});
	
	return MemberDuty;
});
}).call(this);