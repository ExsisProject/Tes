define('docs/models/docs_doc_item', function(require){

	var _ = require('underscore');
	var Backbone = require('backbone');
	var docsLang = require('i18n!docs/nls/docs');
	
	var BaseModel = require('models/base_model');

	var DocListItemModel = BaseModel.extend({

        url: function() {
            return this._urlMap()[this.type ? this.type : "base"];
        },

        _urlMap: function() {
            return {
                base: GO.config('contextRoot') + 'api/docs' + (this.id == null ? '' : '/' + this.id),
                folderType: GO.config('contextRoot') + 'api/docs/'+this.id+'?folderType=' + this.folderType
            }
        },

        initialize : function(data) {
        	BaseModel.prototype.initialize.apply(this, arguments);
            this.id = data ? data.id : null;
        },
        getDocsStatusClass: function() {
			var docsStatus = this.get("docsStatus");
			if (docsStatus == 'APPROVEWAITING') {
				return 'wait';
			} else if (docsStatus == 'TEMPSAVE') {
				return 'temp';
			} else if (docsStatus == 'REJECT') {
				return 'notyet';
			} else if (docsStatus == 'COMPLETE' || docsStatus == 'DELETE') {
				return 'finish';
			}
		},
		getCompleteDate: function() {
			var completeDate = this.get("completDate");
			if ( completeDate ) {
				return GO.util.shortDate(completeDate);
			} else {
				return '-';
			}
		},
		getReadDate: function() {
			var readDate = this.get("readDate");
			if ( readDate ) {
				return GO.util.shortDate(readDate);
			} else {
				return '-';
			}
		},
		getRequestDate: function() {
			var requestDate = this.get("requestDate");
			if ( requestDate ) {
				return GO.util.shortDate(requestDate);
			} else {
				return '-';
			}
		},
		getDocsCount: function() {
			return this.get("docsCount");
		},
		getDocsInfoId: function() {
			return this.get("docsInfoId");
		},
		getTitle: function() {
			return this.get("title");
		},
		getDocsId: function() {
			return this.get("docsId");
		},
		getFolderId: function() {
			return this.get("folderId");
		},
		getAttachCount: function() {
			return this.get("attachCount");
		},
		getCommentCount: function() {
			return this.get("commentCount");
		},
		hasComment : function() {
			return this.get("commentCount") > 0;
		},
		getReadCount: function() {
			return this.get("readCount");
		},
		hasAttach : function() {
			return this.get("attachCount") > 0 ;
		},
		getAttaches: function(){
			return this.get("attaches");
		},
		getFolderName: function() {
			return this.get("folderName");
		},
		getFolderPath: function() {
			return this.get("folderPath");
		},
		getCreatorName: function() {
			return this.get("creatorName");
		},
		getCreatorPositionName: function() {
			return this.get("creatorPositionName");
		},
        getCreatorPosition: function() {
			return this.get("creatorPosition");
		},
		getCreatorId: function() {
			return this.get("creatorId");
		},

		getDocsStatus: function(){
            return this.get("docsStatus");
        },

		getPrevDocsId: function(){
            return this.get("prevDocsId");
        },
		getNextDocsId: function(){
            return this.get("nextDocsId");
        },

		getDocsYear: function(){
            return this.get("docsYear");
        },
        
        getDocNum : function(){
        	return this.get("docNum");
        },
        
		getVersion: function(){
            return this.get("version");
        },

		getReason: function(){
            return this.get("reason");
        },

		getThumbnail: function(){
            return this.get("thumbnail");
        },

		getDocsStatusName: function() {
			var docStatus = this.get("docsStatus");

			if (docStatus == "DELETE") {
				return docsLang['삭제'];
			} else if (docStatus == "COMPLETE") {
				return docsLang['등록완료'];
			} else if (docStatus == "REJECTE") {
				return docsLang['반려'];
			} else if (docStatus == "TEMPSAVE") {
				return docsLang['임시저장'];
			} else if (docStatus == "APPROVEWAITING") {
				return docsLang['승인대기'];
			} else if(docStatus == "REJECT"){
				return docsLang['반려']
			}
		},

        getFiles : function() {
            return _.filter(this.parsedAttaches(), function(attach) {
                return !GO.util.isImage(attach.extention);
            });
        },

        getImages : function() {
            return _.filter(this.parsedAttaches(), function(attach) {
                return GO.util.isImage(attach.extention);
            });
        },
        parsedAttaches : function() {
            return _.each(this.get("attaches"), function(attach) {
                attach["icon"] = GO.util.getFileIconStyle(attach);
                attach["fileSizeString"] = GO.util.getHumanizedFileSize(attach.size);
            });
        },

		isCreateModel : function(){
            return (this.getVersion() == 0 && this.getDocsStatus() == "TEMPSAVE");
        },

		isNeedState : function(){
            return (this.getDocsStatus() == "REJECT" || this.getDocsStatus() == "APPROVEWAITING");
        }
	});

	return DocListItemModel;
});