;(function() {
	 define([
	         "jquery",
	         "underscore", 
	         "backbone",
	         'app',
	         "hgn!templates/mobile/title_toolbar",
	         'i18n!nls/commons',
	         "GO.util"
	     ], 
	     function(
	         $, 
	         _, 
	         Backbone, 
	         GO,
	         TitleToolbarTpl,
	         commonLang
	     ) {
		 
		 var TitleToolbar = Backbone.View.extend({
			 el : '#titleToolbar',
	         initialize : function() {	            
	        	this.$sideEl = $('#side');
	           	this.$contentEl = $('.go_content');
	         },
	         unbindEvent : function() {
				this.$el.off('vclick.side', '#btnSideMenu');
				this.$el.off('vclick', '#btnPrev');
				this.$el.off('vclick', 'a[data-role]');
//				this.$el.off('vclick');
	         },
	         bindEvent : function() {
	        	 if(this.isPrev) {
	        		 this.$el.on('vclick', '#btnPrev', $.proxy(this.customButton, this));
	        	 } else {
	        		 this.$el.on('vclick.side', '#btnSideMenu', $.proxy(this.showSideMenu, this));
	        	 }
	        	 this.$el.on('vclick', 'a[data-role]', $.proxy(this.customButton, this));
//	        	 this.$el.on('vclick', '', $.proxy(this.blurEl, this));
	         },
	         blurEl : function(e) {
	        	 $(e.currentTarget).blur().trigger('focusout');
	        	 return false;
	         },
	         render : function() {
            	
	        	 var args = arguments[0];
            	
	        	 this.isIscroll = args.isIscroll != false;
	        	 this.isPrev = args.isPrev || false;
	        	 this.prevCallback = args.prevCallback || null;
	        	 this.isLeftCancelBtn = args.isLeftCancelBtn || false;
	        	 this.leftButton = args.hasOwnProperty('leftButton') ? args.leftButton : true;
	        	 this.btnCallBack = args.rightButton ? args.rightButton.callback : null;
	        	 this.btnCallBackOther = args.rightButtonOther ? args.rightButtonOther.callback : null;
	        	 this.backBtnCallBack = args.isLeftCancelBtn ? args.isLeftCancelBtn.callback : null;
	        	 this.refreshBtnCallBack = args.refreshButton ? args.refreshButton.callback : null;
	        	 
	        	 
	        	 if(args.isLeftCancelBtn){
	        		 args.isLeftCancelBtn.text = args.rightButton ? args.rightButton.text : null;
	        	 }
	        	 
	        	 //툴바 우측버튼
	        	 if(args.rightButton && typeof args.rightButton.callback == 'function') {
	        		 args.rightButton.text = args.rightButton.text || null;
	        		 args.rightButton.id = args.rightButton.id || 'btnToolbarRight';
	        	 } else {
	        		 args.rightButton = false;
	        	 }
            	
	        	 this.$el = this.$el.empty();
	        	 this.$el.html(TitleToolbarTpl($.extend(args, {
	        		 'cancel' : commonLang['취소'],
	        		 'name' : arguments[0].name || ' ',
	        		 'leftButton' : this.leftButton
	        	 })));
	        	 $('#titleToolbar').show();
	        	 if(!this.$contentEl.find(this.el).length) {
        			 this.$contentEl.prepend(this.el);
        		 }
            	
	        	 this.unbindEvent();
	        	 this.bindEvent();
	        	 this.$sideEl.css('visibility','hidden');
	        	 //this.$sideEl.css('display','none');
	        	 return this.el;
            },
            
            setTitle: function(title) {
            	this.$el.find('h2').html(title);
            }, 
            
            scrollToTop : function() {
            	e.stopPropagation();
            	GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
            	return false;
            },
            showSideMenu : function(e) {
            	$(e.currentTarget).blur().trigger('focusout');
            	GO.EventEmitter.trigger('common', 'layout:showSideMenu', this);
            	e.stopPropagation();
            	return false;
            },
            customButton : function(e) {
            	var $targetEl = $(e.currentTarget);
            	
            	$targetEl.blur().trigger('focusout');
            	e.preventDefault();
            	e.stopPropagation();
            	
            	if($targetEl.attr('data-role') == "refresh"){
            		if(typeof this.refreshBtnCallBack == 'function') this.refreshBtnCallBack();
            	}else if($targetEl.attr('btn-type') == "btnprev"){
            		if(typeof this.backBtnCallBack == 'function') {
            			this.backBtnCallBack();
            		}else{
            			this.routePrev(e);
            		}
            	}else if($targetEl.attr('data-role') == "buttonOther"){
            		//주소록 삭제버튼일경우 사용함.
            		if(this.btnCallBackOther && typeof this.btnCallBackOther == 'function') this.btnCallBackOther(e);
            	}else{
            		if(typeof this.btnCallBack == 'function') this.btnCallBack(e);
            	}
            	return false;
            },
            routePrev : function(e) {
            	
            	$(e.currentTarget).blur();
            	e.stopPropagation();
            	
            	if (this.disagreeContentLoss()) return;
            	
            	if($("#startDate").length){
            		$('#startDate').datepicker('hide');
            		$('#endDate').datepicker('hide');
            	}
            	
            	if($("#birthdayDate").length) {
            		$('#birthdayDate').blur();
        			$('#birthdayDate').datepicker('hide');
            	}
            	
            	if($("#anniversaryDate").length) {
        			$('#anniversaryDate').blur();
					$('#anniversaryDate').datepicker('hide');
            	}
            	
            	if(typeof this.prevCallback == 'function') {
            		this.prevCallback();
            	} else {
        			if(window.history.length == 1){
        				GO.util.goHome();	
        			}else{
        				window.history.back();
        			}
            	}
            	return false;
            },
            
            disagreeContentLoss : function() {
            	return $("textarea:visible").val() && !confirm(GO.util.br2nl(commonLang["내용 작성 중 이동 경고 메시지"]));
            }
		 }, {
			__instance__: null, 
			create: function() {
				//if(this.__instance__ === null)  this.__instance__ = new this.prototype.constructor();//
                //return this.__instance__;
				return new this.prototype.constructor();
            },
            render : function() {
            	 var instance = this.create(),
	                args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];     
	            return this.prototype.render.apply(instance, args);
            }
		 });
		 
		 return TitleToolbar;
	 });
	
}).call(this);