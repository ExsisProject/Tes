//하위부서폴더
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "approval/views/content_top",
    "approval/views/doclist/folderlist_item",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/dept_folder_doclist",
    "approval/views/doclist/dept_reception_doclist",
    
    "views/pagination",
    "views/pagesize",
    
    "approval/models/folderlist_item",
    "approval/collections/dept_folder_doclist",
    "approval/collections/dept_doc_folders",
    "collections/dept_descendants",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/child_dept_folderlist",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	ContentTopView,
	FolderListItemView,
	DocListItemView,
	DeptFolderDocListView,
	DeptReceptionListView,
	
	PaginationView,
    PageSizeView,
	
	FolderListItemModel,
	DeptFolderDocCollection,
	DeptDocFolderCollection,
	DeptDescendantCollection,
	
	DocListEmptyTpl,
	ChildDeptFolderListTpl,
    
	commonLang,
    approvalLang
) {
    
	return Backbone.View.extend({
	    
	    el: '#content',
		columns: {
			'부서명' : approvalLang.부서명,
			'문서함' : approvalLang.문서함, 
			'문서수' : approvalLang.문서수, 
			'생성일' : approvalLang.생성일,
			'count' : 4
		},
		
		events: {
			'change select#childDeptSelect' : 'onDeptSelected',
			'click td.sub_dept_folder_name' : 'onFolderClicked'
    	},
    	
    	initialize: function(deptId) {
    	    this.deptId = deptId;
            this.contentTop = ContentTopView.getInstance();
            this.deptDescendantCollection = new DeptDescendantCollection();
            this.docCollection = null;
        },
    	
    	render: function() {
            this._renderBasic();
            this._renderDeptDescendants();
            
            if (this.deptId) {
                this._renderFolders(this.deptId);
            } else {
                this._renderEmptyFolders();
            }
        },
        
        _renderBasic: function() {
            this.$el.html(ChildDeptFolderListTpl({
                columns: this.columns
            }));
            
            this.contentTop.setTitle(approvalLang['하위 부서 문서함']);
            this.contentTop.render();
            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            
            this.$tbody = this.$el.find('table.list_approval > tbody');
            this.$deptSelect = this.$el.find('div.critical:first');
        },
    	
		_renderDeptDescendants: function() {
		    var $appendTarget = this.$deptSelect,
		        deptId = this.deptId;
		    
		    var renderDeptDescendants = function(data) {
		        var htmls = [];
	            htmls.push('<select id="childDeptSelect" style="margin-top:2px">');
	            htmls.push('{{#hasDeptList}}');
	            htmls.push('    <option style="display:none" selected="selected">{{lang.selectDescendant}}</option>');
	            htmls.push('    {{#deptList}}');
                htmls.push('    <option value={{id}}>{{name}}</option>');
                htmls.push('    {{/deptList}}');
	            htmls.push('{{/hasDeptList}}');
	            htmls.push('{{^hasDeptList}}');
	            htmls.push('    <option>{{lang.noDescendants}}</option>');
	            htmls.push('{{/hasDeptList}}');
	            htmls.push('</select>');
	            
	            $appendTarget.html(Hogan.compile(htmls.join('')).render({
		            'deptList' : data,
		            'hasDeptList' : !_.isEmpty(data),
		            'lang' : {
		                'noDescendants' : commonLang['하위 부서가 없습니다.'],
		                'selectDescendant' : commonLang['하위 부서 선택']
		            }
		        }));
	            
	            if (deptId) {
	                $appendTarget.children().eq(0).val(deptId);
	            }
		    };
		    
		    this.deptDescendantCollection.fetch({
		        success: function(collection) {
		            renderDeptDescendants(collection.toJSON());
		        },
		        error: function() {
		            renderDeptDescendants([]);
		        }
		    })
    	},
    	
    	onDeptSelected: function(e) {
    	    var $target = $(e.currentTarget),
                deptId = $target.val();
    	    
    	    GO.router.navigate("approval/deptfolder/subfolder/" + deptId, {trigger: true, pushState: true});
    	},
    	
    	_renderEmptyFolders: function() {
    	    var htmls = [];
            htmls.push('<tr><td valign="top" class="dataTables_empty align_c" colspan="4">');
            htmls.push('    <p class="data_null">');
            htmls.push('        <span class="ic_data_type ic_no_contents"></span>');
            htmls.push('        <span class="txt">{{lang.selectDept}}</span>');
            htmls.push('        <br>');
            htmls.push('    </p>');
            htmls.push('</td></tr>');
            
            this.$tbody.html(Hogan.compile(htmls.join('')).render({
                lang: {
                    'selectDept' : approvalLang['하위 부서 선택 안내 메시지']
                }
            }));
    	},
    	
    	_renderFolders: function(deptId) {
    	    var $appendTarget = this.$tbody;
    	    var renderWithData = function(folders) {
    	        var htmls = [];
                htmls.push('{{#folders}}');
                htmls.push('<tr data-id="{{id}}" data-type="{{folderType}}" data-deptid="{{deptId}}">');
                htmls.push('    <td class="first"><span class="txt">{{deptName}}</span></td>');
                htmls.push('    <td class="sub_dept_folder_name"><a><span class="txt">{{folderName}}</span></a></td>');
                htmls.push('    <td class=""><span class="txt">{{createdAt}}</span></td>');
                htmls.push('    <td class=""><span class="txt">{{docCount}}</span></td>');
                htmls.push('</tr>');
                htmls.push('{{/folders}}');
                
                $appendTarget.html(Hogan.compile(htmls.join('')).render({
                    'folders' : folders
                }));
    	    };
    	    
    	    new DeptDocFolderCollection(deptId, true).fetch({
    	        success: $.proxy(function(collection) {
    	            renderWithData(_.map(collection.toJSON(), function(model) {
                        return _.extend(model, {
                            'createdAt' : GO.util.shortDate(model['createdAt'])
                        });
                    }));
    	        }, this),
    	        error: function() {
    	            $.goMessage(commonLang['500 오류페이지 타이틀']);
    	        }
    	    });
    	},
    	
    	onFolderClicked: function(e) {
    	    var $target = $(e.target),
    	        $record = $target.parents('tr[data-id]'),
    	        folderType = $record.attr('data-type'),
    	        folderId = $record.attr('data-id'),
    	        deptId = $record.attr('data-deptid'),
    	        url = '';
    	    
    	    switch (folderType) {
    	    case 'DRAFT':
    	        url = 'approval/deptfolder/draft/' + deptId;
    	        break;
    	    case 'RECEPTION':
    	        url = 'approval/deptfolder/receive/' + deptId + '/all';
    	        break;
    	    case 'REFERENCE':
    	        url = 'approval/deptfolder/reference/' + deptId;
    	        break;
    	    case 'OFFICIAL':
    	        url = 'approval/deptfolder/official/' + deptId;
                break;
	        default:
	            url = 'approval/deptfolder/' + folderId + '/documents';
	            break;
    	    }
    	    
    	    GO.router.navigate(url, {trigger: true, pushState: true});
    	},
		
		release: function() {
            this.$el.off();
            this.$el.empty();
        }
	});
});