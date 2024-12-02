(function() {
define([
    "jquery",    
    "backbone",
    "app",
    "components/favorite/collections/favorite",
    "hgn!components/favorite/templates/favorite",
    "hgn!components/favorite/templates/favorite_modify_item",
    "hgn!components/favorite/templates/favorite_list_item",
    "i18n!nls/commons",
    "amplify",
    "jquery.ui"
], 
//hgn!components/emailSend/templates/send_mail_layer
function(
    $, 
    Backbone,
    GO,
    FavoriteCollection,
    layoutTpl,
    FavoriteModifyItemTpl,
    FavoriteListItemTpl,
    CommonLang,
    Amplify
) {
    var instance = null,
        lang = {
            'favorite' : CommonLang['관심'],
            'favorite_title' : CommonLang['즐겨찾기'],
            'favorite_edit' : CommonLang['편집'],
            'favorite_edit_title' : CommonLang['즐겨찾기 편집'],
            'save' : CommonLang['수정완료'],
            'collapse' : CommonLang['접기'],
            "outspread" : CommonLang["펼치기"],
            'cancel' : CommonLang['취소']
    };
    
    var CATE_STORE_KEY = "";
    
    var FavoriteView = Backbone.View.extend({
        className : 'lnb',
        events: {
            'click span.ic_list_reorder' : 'edit',
            'click span.ic_cancel' : 'reorderCancel',
            'click span.ic_done' : 'save',
            'mouseover ul>li ' : 'dragOver',
            'mouseout ul>li' : 'dragOut',
            'click h1.star>a.txt, h1.star span.toggle_btn' : 'favoriteToggle'
        },
        
        /*
         * initialize params :
         *    {
         *        (require)
         *        el : replaceEl
         *        type : url 정보,
         *        url : GET/PUT (즐겨찾기 목록, 순서변경)
         *        link : 페이지 이동 (callback)
         *        
         *        (options)
         *        title : (default = 즐겨찾기)
         *        renderFn : item override (callback)
         *        overrideDataSet : data 재정의 (callback)
         *        liClass : li 에 표현해주어야 할 클래스 명
         *        
         *    }
         * 
         */
        
        initialize: function(options) {
        	this.options = options || {};
            this.title = this.options.title || lang.favorite_title;
            this.el = this.options.el;
            this.link = this.options.link;
            this.overrideDataSet = this.options.overrideDataSet;
            this.url = this.options.url;
            this.liClass = this.options.liClass;
            
            this.collection = FavoriteCollection.get({
                url : this.url
            });
            
            CATE_STORE_KEY = GO.session("loginId") + '-'+ this.options.type +'-favorite-toggle';
        },
        
        render : function(isModify) {
            var self = this;
            //TODO : async 처리할 것인가?
            
            this.$el.html(
                layoutTpl({
                    title : this.title,
                    lang : lang,
                    category_is_open : this.getStoredCategoryIsOpen()
                })
            );
            
            if(this.collection.length > 0) {
                var listEl = this.$el.find("ul"),
                    items = [];
                
                this.collection.each(function(model, index){
                    var favoriteItem = new FavoriteItem({
                        model : model,
                        link : self.link,
                        overrideDataSet : self.overrideDataSet,
                        liClass : self.liClass
                    });
                    listEl.append(favoriteItem.render(isModify).$el);
                });
                this.$el.show();
            } else {
                this.$el.hide();
            }
            
            return this;
        },
        
        favoriteToggle : function(e){
            var targetParent = $(e.currentTarget).parents("h1"),
                toggleBtn = targetParent.find("span.toggle_btn"),
                slideTarget = this.$el.find("ul");
            
            if(targetParent.hasClass("folded")){
                targetParent.removeClass("folded");
                toggleBtn.attr("title", CommonLang["접기"]);
                slideTarget.slideDown(200);
            } else {
                targetParent.addClass("folded");
                toggleBtn.attr("title", CommonLang["펼치기"]);
                slideTarget.slideUp(200);
            }
            
            this.storeCategoryIsOpen(!targetParent.hasClass("folded"));
        },
        
        getStoredCategoryIsOpen: function() {
            var savedCate = '';
            if(!window.sessionStorage) {
                savedCate = Amplify.store( CATE_STORE_KEY );
            } else {
                savedCate = Amplify.store.sessionStorage( CATE_STORE_KEY );
            }
            
            if(savedCate == undefined){
                savedCate = true;
            }
            
            return savedCate;
        }, 
        
        storeCategoryIsOpen: function(category) {
            return Amplify.store( CATE_STORE_KEY, category, { type: !window.sessionStorage ? null : 'sessionStorage' } );
        }, 
        
        reload : function(){
            this.collection.fetch({async : false});
            this.render(false);
        },
        
        dragOver : function(e) {
            $(e.currentTarget).addClass('move');
        },
        
        dragOut : function(e) {
            $(e.currentTarget).removeClass('move');
        },
        
        edit : function() {
            console.info("edit !!");
            
            var self = this;
            this.render(true);
            
            this.$el.find("h1 span.btn_wrap").toggle();
            
            this.$el.addClass('lnb_edit').sortable({
                items : 'li',
                opacity : '1',
                delay: 100,
                cursor : 'move',
                hoverClass: 'move',
                containment : "#side_favorite",
                forceHelperSize : 'true',
                helper : 'clone',
                placeholder : 'ui-sortable-placeholder'
            }).sortable('enable');
        },
        
        reorderCancel : function() {
            this.$el.removeClass('lnb_edit').sortable('disable');
            this.render();
        },
        
        save : function(){
            var ids = [],
                models = [],
                self = this;
            
            
            this.$el.find("li").each(function(){
                var id = $(this).attr("data-id"),
                    model = self.collection.get(id);
                
                models.push(model);
            });
            $.go(this.url , JSON.stringify(models), {
                contentType : 'application/json',
                qryType : 'put',
                async : false,
                responseFn : function() {
                    self.$el.removeClass('lnb_edit')
                    self.$el.find("h1 span.btn_wrap").toggle();
                    self.$el.trigger("changeFavorite", [models]);
                    self.reload(false);
                },
                error : function(response){
                    var responseData = JSON.parse(response.responseText);
                    if(responseData.message != null){
                        $.goMessage(responseData.message);
                    }else{
                        $.goMessage(CommonLang["실패했습니다."]);
                    }
                }
            });
        }
    },{
        create : function(opt){
            var instance = new FavoriteView(opt);
            return instance.render();
        }
    });

    
    /*
     * initialize params :
     *    {
     *        (require)
     *        model : model
     *        
     *        (options)
     *        renderFn : li
     *        title : (default = 즐겨찾기)
     *        renderFn : item override (callback)
     *        setData : data 재정의 (callback)
     *        
     *    }
     * 
     */
    
    var FavoriteItem = Backbone.View.extend({
        tagName : 'li',
        events: {
            'click span.ic_list_del' : 'remove',
            'click a' : 'movePage' 
        },
        initialize: function(options) {
        	this.options = options || {};
            this.model = this.options.model;
            this.renderFn = this.options.renderFn;
            this.link = this.options.link;
            this.overrideDataSet = this.options.overrideDataSet;
            this.liClass = this._getLiClass();
            this.$el.addClass(this.liClass);
        },
        _getLiClass : function () {
        	return typeof this.options.liClass == "function" ? this.options.liClass.call(this, this.model) : (this.options.liClass || "report");
        },
        render : function(isModify) {
            var tpl = isModify ? FavoriteModifyItemTpl : FavoriteListItemTpl,
                data = {};
            
            if(this.overrideDataSet){
                data = this.overrideDataSet(this.model);
            }else{
                data = this.model.toJSON();
            }
            
            this.$el.html(
                tpl({
                    data : data,
                    lang : lang,
                    renderFn : this.renderFn,
                })
            );
            
            this.$el.attr("data-id", this.model.get("id"));
            this.$el.attr("data-item", "favorite" + this.model.get("id"));
            
            return this;
        },
        
        remove : function(e){
            this.$el.remove();
        },
        
        movePage : function(){
            var url = this.link(this.model);
            sessionStorage.setItem("sideItem", "favorite" + this.model.id);
            var callback = function() {
            	GO.router.navigate(url, {trigger: true});
            };
            GO.util.editorConfirm(callback);
        }
    });
    
    return FavoriteView;
});
}).call(this);