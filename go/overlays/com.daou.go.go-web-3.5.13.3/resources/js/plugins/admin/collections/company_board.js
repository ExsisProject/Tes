/**
 * @Deprecated
 * 삭제 예정
 */
define([
    "backbone" 
],

function(
		Backbone
) {	
	var CompanyBoard = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/ad/api/company/board/'+this.status;
		},
		setStatus : function(companyId,status){
			this.companyId = companyId;
			this.status = status;
		}
	}); 
	
	return {
		getCollection: function(companyId,status) {
			var companyBoard = new CompanyBoard();
			var data = { 'page' : '0' , 'offset' : '1000'};
			companyBoard.setStatus(companyId,status);
			companyBoard.fetch({data:data,async:false});
			return companyBoard;
		}		
	};
});