define([
	"jquery",
	"underscore", 
    "backbone", 
    "app", 
    "approval/views/apprform/appr_company_folder_searchTree",
    "hgn!approval/templates/document/doc_foldertype",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-validation"
], 

function(
    $,  
	_, 
    Backbone, 
    App, 
	CompanyFolderSearchTreeView,
    DocFormTypeTpl,
    commonLang,
	approvalLang
) {	
	
	var DocCompanyFolderList = Backbone.Collection.extend({
		initialize: function(docId) {
			this.docId = docId;
		},
		model: Backbone.Model.extend(),
		url: function() {
			return '/api/approval/document/' + this.docId + "/folder";			
		}
	});
	
	var lang = {
        '문서함' : approvalLang['문서함'],
        'empty_folder' : approvalLang['문서함을 추가해 주세요'],
        '부서' : approvalLang['부서'],
		'이름' : commonLang['이름'],
		'부서명' : commonLang['부서명'],
		'이메일' : commonLang['이메일'],
        '확인' : commonLang['확인'],
        '취소' : commonLang['취소'],
        '삭제' : commonLang['삭제'],
        '검색' : commonLang['검색']
    };
	
	var FolderListView = Backbone.View.extend({
	    
	    initialize: function(options) {
	        this.$el = options.el;
	        this.defaultFolder = options.defaultFolder;
	        this.collection = options.collection;
	        this.collection.each(function(model) {
	            model.set('modifiable', false);
	        });
	    },
	    
	    events: {
	        'click .ic_basket' : 'deleteFolder'
	    },
	    
	    render: function() {
	        var tmpl = this._compileTemplate(),
	            list = this.collection.toJSON();
	        
	        list = _.map(list, function(element, idx, list) {
	            element['modifiable'] = (this.defaultFolder['id'] != element['id']);
	            return element;
	        }, this);
	        
	        this.$el.html(tmpl.render({
	            lang: lang,
	            folders: list
	        }));
	        
	        return this.$el;
	    },
	    
	    addFolder: function(data) {
	        this.collection.add({
	            'id' : data['id'],
	            'name' : data['parentName'],
	            'modifiable' : true
	        });
	        
	        this.render();
	        return this.$el;
	    },
	    
	    deleteFolder: function(e) {
	        var targetId = $(e.currentTarget).parent().parent().attr('data-id');
	        var targetModel = this.collection.find(function(model) {
	            return model.get('id') == targetId;
	        });
	        
	        if (targetModel) {
	            this.collection.remove(targetModel);
	        }
            
	        this.render();
	    },
	    
	    _compileTemplate: function() {
	        return Hogan.compile([
	             '{{#folders}}',
                 '    <tr>',
                 '        <td class="name">{{name}}</td>',
                 '        <td class="func" data-id={{id}} data-folderid="{{id}}" data-folderName="{{name}}">',
                 '        {{#modifiable}}',
                 '            <span class="btn_bdr" title="{{lang["삭제"]}}"><span class="ic_classic ic_basket"></span></span>',
                 '        {{/modifiable}}',
                 '        </td>',
                 '    </tr>',
                 '{{/folders}}',
                 '{{^folders}}',
                 '    <tr>',
                 '        <td class="name">{{lang.empty_folder}}</td>',
                 '    </tr>',
                 '{{/folders}}'
             ].join('\n'));
	    }
	});
	
	var DocumentAddFormTypeView = Backbone.View.extend({
	    
		el: '.layer_normal .content',
        searchTreeView: null,
        listView: null,
        
		initialize: function(options) {
		    this.options = options || {};
			this.docId = this.options.docId;
			this.defaultFolder = options.defaultFolder;
			this.collection = new DocCompanyFolderList(this.docId);
			this.collection.fetch({ 
			    async:false 
		    });
		},

		events: {
			'click .btn_langth' : 'addFolder'
		},
		
    	render : function(){
    	    this.$el.html(DocFormTypeTpl({
                lang: lang
            }));
    	    
			this.searchTreeView = new CompanyFolderSearchTreeView({
                isAdmin: false,
                elId : "company_Folder_searchTree",
                treeElId : "formTree",
                searchInputId : 'searchInput',
                apiCommonUrl : 'api/docfolder/sidetree',
                searchResultElId : 'searchResult'
			});
			
			this.listView = new FolderListView({
			    el: this.$el.find('#folder_list'), 
			    defaultFolder: this.defaultFolder,
			    collection: this.collection
			});
			
			this.searchTreeView.render();
			this.listView.render();
        },
        
        addFolder: function() {
        	var selectedData = this.searchTreeView.getSelectedNodeData();
        	var selectedFullName = selectedData['parentName'];
        	var selectedID = selectedData['id'];

        	if ( !selectedID ) {
        		$.goMessage(approvalLang["선택된 대상이 없습니다."]);
        		return false;
        	}
        	
        	if ( this.isExistFolder(selectedID) ) {
        		$.goMessage(approvalLang["중복된 대상입니다."]);
        		return false;
        	}
        	
        	this.listView.addFolder(selectedData);
        	this.listView.render();
        },
        
        isExistFolder: function(selectFolderId){
        	var rtn = false;
        	var folderPart = $('#addDocFolder').find('.func[data-folderid]');
        	folderPart.each(function(){
        		if ( $(this).attr("data-folderid") == selectFolderId ) {
        			rtn = true;
        		    return false;
        		}
        	});
        	return rtn;
        },
        
        getFolderIds: function() {
            return this.collection.map(function(m) {
                return m.get('id');
            });
        },
        
    	release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return DocumentAddFormTypeView;
});