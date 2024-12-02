define([
    'backbone'
], function(
    Backbone
) {
	var UserAllDocumentsActionModel = Backbone.Model.extend({
        initialize : function(options){
            this.folderType = options.folderType || 'userdraftfolder';
			this.documentType = options.documentType || 'alldocuments';
			this.action = options.action || 'add';
        },

		url : function(){
			var url = ['/api/approval',this.folderType,this.folderId,this.documentType,this.action].join('/');
			return url + '?' + this._makeParam();
		},
		setSearch: function(searchtype,keyword) {
			this.searchtype = searchtype;
			this.keyword = keyword;
		},
		setDuration: function(options) {
			options = options || {};
			this.duration = options.duration || 'all';
			this.fromDate = options.fromDate || "";
			this.toDate = options.toDate || "";
		},
		_makeParam: function() {
			var params = {
				searchtype : this.searchtype,
				keyword : this.keyword
			};
			if(this.duration == "period"){
				params['fromDate'] = this.fromDate;
				params['toDate'] = this.toDate;
				params['duration'] = this.duration;
			}

			return $.param(params);
		},

		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	return UserAllDocumentsActionModel;
});