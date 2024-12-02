(function() {
define([
    'underscore',
    'backbone',
    "amplify",
    "app",
    "hgn!approval/templates/mobile/m_treeItemList",
    "hgn!approval/templates/mobile/m_treeItemChildList",
    "i18n!approval/nls/approval"
], function(
    _,
    Backbone,
    Amplify,
    GO,
    TreeTpl,
    TreeChildTpl,
    approvalLang
) {
	var TreeCollection  = Backbone.Collection.extend({
	});
	
	var TreeView = Backbone.View.extend({
		
        apiCommonUrl: null,
        isAdmin: false,
        treeElementId : null,
        selectCallback : null,
        disabledSelect : false,
        folderId : null,
        disabledClassName : 'disable',
        ulTagClassName : 'side_depth',
        toggleIconOpenClassName : 'close', //왜인지는 모르겠지만 폴더의 toggleIcon이 ▼이렇게 생긴게 close Class명을 가지고 있음. 나중에 css가 바뀐다면 이 부분을 고쳐야함 
        toggleIconCloseClassName : 'open', // 마찬가지로 ▶ 요렇게 생긴게 className이 open임. 
        
		initialize: function(options) {
		    this.options = options || {};
            if (_.isString(this.options.treeElementId)) { this.treeElementId = this.options.treeElementId; }
            if (_.isString(this.options.apiCommonUrl)) { this.apiCommonUrl = this.options.apiCommonUrl; }
            if (_.isBoolean(this.options.isAdmin)) { this.isAdmin = this.options.isAdmin; }
            if (_.isBoolean(this.options.disabledSelect)) { this.disabledSelect = this.options.disabledSelect; }
            if (_.isFunction(this.options.selectCallback)) { this.selectCallback = this.options.selectCallback; }
            this.folderId = this.options.folderId;
			this.collection = new TreeCollection();
			this.collection.url = this._getCommonUrl();
			this.collection.fetch({async:false});
            this.bindEvents();
			
		},
		
        bindEvents: function() {
        	this._getTreeElement().off('click', 'span[evt-rol=toggle-folder');
        	this._getTreeElement().off('click', 'li.folder a');
            this._getTreeElement().on('click', 'span[evt-rol=toggle-folder]', $.proxy(this._toggleSlide, this));
            this._getTreeElement().on('click', 'li.folder a', $.proxy(this._select, this));
        }, 
		
        _getTreeElement: function() {
            return $('#' + this.treeElementId);
        },
        
        _getTargetElementById: function(id) {
            return $(this._getTreeElement().find('li[data-id='+id+']'));
        },
        
        /**
         * 폴더를 열고 닫는 아이콘을 클릭했을때의 액션
         * @param e
         */
        
        _toggleSlide : function(e){
        	var target = $(e.target);
        	var toggleStatus = target.attr('status');
        	var targetId = target.closest('li').attr('data-id');
        	if(toggleStatus == 'opened'){ //메뉴 슬라이드가 열려있는 상태라면
        		this._closeNode(targetId);
        	}else{ //메뉴 슬라이드가 닫혀있는 상태라면
        		this._openNode(targetId);
        	}
        	
        },
        
        
        /**
         * 하위 폴더가 있지만 아직 load된 상태가 아닐때 하위 폴더의 데이터들을 load함
         * @param id
         */
        
        _loadChildrenData : function(id){
        	if(id){
        		this._getTargetElementById(id).append(this._wrapUltag());
        		this.collection.url = this._getCommonUrl()+'?folderId='+id;
        		this.collection.fetch({async : false});
        		this._drawTreeAppendTarget(id);
            	var targetEl = this._getTargetElementById(id);
            	var targetToggleIcon = $(targetEl.find('> p > span[evt-rol="toggle-folder"]'));
            	targetToggleIcon.attr('childrenLoaded', 1);
        	}
        	
        	
        },
        

		/***
		 * 선택한 값의 parent의 text를 가져옴(root까지) 
		 * @returns {Array}
		 */
        
        getFullPathName : function(){
        	var getSelectedNode = this._getSelectedNode();
        	var parentNames = [];
        	var fullPathName = '';
        	var data = {};
        	var dataObj;
        	if(getSelectedNode.length > 0){
        		var depth = $(getSelectedNode).parentsUntil(this._getTreeElement()).filter('li').length
        		var targetNode = $(getSelectedNode);
        		for(var i = 0; i < depth + 1; i++){
        			data = {
        				name : targetNode.find('span.txt').eq(0).text()
        			}
        			parentNames.push(data);
        			targetNode = $(targetNode).parent().closest('li');
       			
        		}
        		
        		var len = $(parentNames).length
    			$($(parentNames).get().reverse()).each(function(k, v){
    			    if (k === len - 1) {
        				fullPathName += v.name;
    			    } else {
        				fullPathName += v.name + " > ";
    			    }
    			});
        	}
        	return fullPathName;
        },
        
        /***
         * id
         * 해당 id값의 노드 정보를 가져온다
         */
        
        _getData : function(id){
        	var data = {};
			var dataObj = this._getTargetElementById(id);
			
			data = {
				id : $(dataObj).attr('data-id'),
				name : $(dataObj).find('span.txt').eq(0).text(),
				rel : $(dataObj).attr('rel'),
				auth : $(dataObj).attr('data-auth')
			};
			
			return data;
        	
        },
        
        /**
         * 트리에서 선택된(하이라이즈 된)값의 노드를 가져온다
         * 
         */
		
        _getSelectedNode : function(){
        	return $(this._getTreeElement()).find('p.on').closest('li');
        },
        
        /**
         * 트리에서 선택된(하이라이즈 된)값의 노드 정보를 가져온다
         * 
         */
		
        _getSelectedNodeData : function(){
        	var getSelectedId = this._getSelectedNode().attr('data-id');
        	
        	return this._getData(getSelectedId);
        },
                
        /**
         * 해당id값을 갖는 폴더 하위로 폴더를 그림
         * @param id
         * @returns {Boolean}
         */
        
        _drawTreeAppendTarget : function(id){
			var self = this;
			var list = this.collection.toJSON();
			var targetEl = this._getTargetElementById(id).find('ul').eq(0);
			var disabledClassName = this.disabledClassName; 
			var toggleIconCloseClassName = this.toggleIconCloseClassName;
			$(list).each(function(k, v){
				var hasChildren = false;
				(v.metadata.children.length > 0) ? hasChildren = true :  hasChildren = false;
				targetEl.append(TreeChildTpl({
					rel : v.data.attr.rel,
					model : v.metadata,
					hasChildren : hasChildren,
					disabledClassName : disabledClassName,
					toggleIconCloseClassName : toggleIconCloseClassName
				}))
			});
        },

        /**
         * 해당 아이디 값에 해당하는 트리 폴더를 open
         * @param id
         * @returns {Boolean}
         */
        
        _openNode : function(id){
        	var self = this;
        	var targetEl = this._getTargetElementById(id);
        	var targetToggleIcon = $(targetEl.find('> p > span[evt-rol="toggle-folder"]'));
        	if(targetEl.length == 0 || targetToggleIcon.length == 0){
        		console.log('no exist');
        		return false;
        	}
        	var status = targetEl.find('> p > span[evt-rol="toggle-folder"]').attr('status');
        	var childrenLoaded = targetEl.find('> p > span[evt-rol="toggle-folder"]').attr('childrenLoaded');
        	if(status == 'opened'){ //이미 열려있는 상태라면
        		return false;
        	}else{ //status == 'closed'
        		if(childrenLoaded == 0){
        			this._loadChildrenData(id, targetToggleIcon);
        			this._targetOpenStyle(targetToggleIcon);
        		}else{
        			this._targetOpenStyle(targetToggleIcon);        			
        		}
        		targetEl.children('ul').show();
        	}
        },
        
        /**
         * 트리의 모든 폴더를 펼침
         */
        
        _openNodeAll : function(){
        	var self = this;
        	var ids = [];
        	var toggleIcons = this._getTreeElement().find('span[evt-rol="toggle-folder"]');
        	$(toggleIcons).each(function(k, v){
        		if($(v).attr('status') == 'closed'){
        			ids.push($(v).closest('li').attr('data-id'))
        		}
        	});
        	
        	$(ids).each(function(k, v){
        		self._openNode(v);
        	});
        	
        	var isExist =this._checkStatusAllToggleIcon('closed');
        	if(isExist){
        		this._openNodeAll();
        	}
        },
        
        /**
         * 모든 toggle 아이콘의 상태값을 체크하여 입력받은 파라미터의 상태가 있는지를 검사 
         * @param status(opened or closed)
         * @returns {Boolean}
         */
        
        _checkStatusAllToggleIcon : function(status){
        	var isExist = false;
        	var toggleIcons = this._getTreeElement().find('span[evt-rol="toggle-folder"]');
        	$(toggleIcons).each(function(k, v){
        		if($(v).attr('status') == status){
        			isExist = true;
        		}
        	});
        	return isExist;
        },
        
        /***
         * 해당 아이디 값에 해당하는 폴더를 닫음
         * @param id
         * @returns {Boolean}
         */
        
        _closeNode : function(id){
        	var self = this;
        	var targetEl = this._getTargetElementById(id);
        	var targetToggleIcon = $(targetEl.find('> p > span[evt-rol="toggle-folder"]'));
        	if(targetEl.length == 0 || targetToggleIcon.length == 0){
        		return false;
        	}
        	var status = targetEl.find('> p > span[evt-rol="toggle-folder"]').attr('status');
        	var childrenLoaded = targetEl.find('> p > span[evt-rol="toggle-folder"]').attr('childrenLoaded');
        	if(status == 'closed'){ //이미 닫혀있는 상태라면
        		return false;
        	}else{ //status == 'opened'
    			this._targetCloseStyle(targetToggleIcon);
        		targetEl.children('ul').hide();
        	}
        },
        
        /***
         * toggle아이콘의 open close의 이미지를 변경
         * @param obj
         */
        
        _targetOpenStyle : function(obj){
        	obj.removeClass(this.toggleIconCloseClassName).addClass(this.toggleIconOpenClassName);
        	obj.attr('status', 'opened');
        },
        
        _targetCloseStyle : function(obj){
        	obj.removeClass(this.toggleIconOpenClassName).addClass(this.toggleIconCloseClassName);
        	obj.attr('status', 'closed');
        },
        
        /****
         * 사용자가 폴더를 클릭했을때 조회가 가능한지에 대한 여부
         */
        _isSelectAble : function(obj){
		    if (!this.disabledSelect && obj.hasClass(this.disabledClassName)){
		    	return false;
		    }else{
		    	return true;
		    }        	
        },
               
        /***
         * 노드를 선택할떄의 Action. option값으로 selectCallback을 주었다면 return 값으로 data를 넘겨줌
         * @param e
         */
        
        _select: function(e){
        	var self = this;
        	obj = $(e.currentTarget);
        	if(!this._isSelectAble(obj)){
        		return false;
        	}
        	
        	
            if (obj && _.isFunction(this.selectCallback)) {
            	var id = obj.closest('li').attr('data-id');
            	var data = self._getData(id);
                this.selectCallback(data);
            }
        	
        	this._highlightStyle(obj.closest('li').attr('data-id'));

        },
        
        _highlightStyle : function(id){
        	this._removeAllHighlightStyle();
        	this._getTargetElementById(id).find("p:first").addClass('on');
        },
        
        _removeAllHighlightStyle : function(){
        	this._getTreeElement().find('p.on').removeClass('on');
        },
       
        
		_getCommonUrl: function() {
			if(!_.isEmpty(this.apiCommonUrl)){
		        return GO.contextRoot + this.apiCommonUrl;				
			}else{
			    if (this.isAdmin) {
			        return GO.contextRoot + 'ad/api/approval/manage/companyfolder';
			    } else {
			        return GO.contextRoot + 'api/approval/companyfolder/tree';
			    }				
			}
		},
		
		render : function(){
			this._init_load();
			this._openNodeAll();
        	var folderId = this.folderId
        	if(folderId){
            	this._highlightStyle(folderId);
        	}
		},
		
		/***
		 * 처음 트리가 로드할때의 액션. 최초 폴더 목록을 가져옴
		 */
		
		_init_load : function(){
			var self = this;
			var list = this.collection.toJSON();
			var disabledClassName = this.disabledClassName;
			this._getTreeElement().append(this._wrapUltag());
			$(list).each(function(k, v){
				var hasChildren = false;
				(v.metadata.children.length > 0) ? hasChildren = true :  hasChildren = false;
				self._getTreeElement().find('ul').eq(0).append(TreeTpl({
					rel : v.data.attr.rel,
					model : v.metadata,
					disabledClassName : disabledClassName, 
					hasChildren : hasChildren
				}))
			});
			
		},
		
		_wrapUltag : function(){
			return "<ul class='"+this.ulTagClassName+"'></ul>";
		},
		
        /**
         * 노드 선택시 호출되는 콜백메서드의 기본값 입니다.
         */
        selectCallback: function() {

        },
		
		
	});
	
	return TreeView;
});	
}).call(this);


