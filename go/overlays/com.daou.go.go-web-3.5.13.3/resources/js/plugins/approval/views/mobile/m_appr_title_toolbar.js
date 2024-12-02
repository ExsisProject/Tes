;(function() {
	 define([
	         "jquery",
	         "underscore", 
	         "backbone",
	         'app',
	         "views/mobile/title_toolbar",
	         "hgn!approval/templates/mobile/m_appr_title_toolbar",
	         'i18n!nls/commons',
	         "GO.util"
	     ], 
	     function(
	         $, 
	         _, 
	         Backbone, 
	         GO,
	         TitleToolbar,
	         TitleToolbarTpl,
	         commonLang
	     ) {
		 
		 var ApprTitleToolbar = TitleToolbar.extend({
	         initialize : function(options) {
	        	 TitleToolbar.prototype.initialize.call(this, options);
				_.extend(this.options, options || {});
	         },
	         unbindEvent : function() {
	        	 TitleToolbar.prototype.unbindEvent.call(this)
	         },
	         bindEvent : function() {
	        	 TitleToolbar.prototype.bindEvent.call(this)
	         },

	         render : function() {
            	
	        	 var args = arguments[0];
            	
	        	 this.isIscroll = args.isIscroll != false;
	        	 this.isPrev = args.isPrev || false;
	        	 this.prevCallback = args.prevCallback || null;
	        	 this.isLeftCancelBtn = args.isLeftCancelBtn || false;
	        	 this.leftButton = args.hasOwnProperty('leftButton') ? args.leftButton : true;
	        	 this.btnCallBack = args.rightButton ? args.rightButton.callback : null;
	        	 this.btnCallBack2 = args.rightButton2 ? args.rightButton2.callback : null;
	        	 this.backBtnCallBack = args.isLeftCancelBtn ? args.isLeftCancelBtn.callback : null;
	        	 this.refreshBtnCallBack = args.refreshButton ? args.refreshButton.callback : null;
	        	 
	        	 
	        	/* if(args.isLeftCancelBtn){
	        		 args.isLeftCancelBtn.text = args.rightButton ? args.rightButton.text : null;
	        	 }*/
	        	 
	        	 //툴바 우측버튼
	        	 if(args.rightButton && typeof args.rightButton.callback == 'function') {
	        		 args.rightButton.text = args.rightButton.text || null;
	        		 args.rightButton.id = args.rightButton.id || 'btnToolbarRight';
	        	 } else {
	        		 args.rightButton = false;
	        	 }
	        	 
	        	 //툴바 우측버튼2
	        	 /*if(args.rightButton2 && typeof args.rightButton2.callback == 'function') {
	        		 args.rightButton2.text = args.rightButton2.text || null;
	        		 args.rightButton2.id = args.rightButton2.id || 'btnToolbarRight2';
	        	 } else {
	        		 args.rightButton2 = false;
	        	 }*/
            	
	        	 this.$el = this.$el.empty();
	        	 this.$el.html(TitleToolbarTpl($.extend(args, {
	        		 'cancel' : (args.isLeftCancelBtn.text) ?  args.isLeftCancelBtn.text : commonLang['취소'],
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
            	}else if($targetEl.attr('btn-type') == "rightButton2"){ //두번째 rightButton
            		if(typeof this.btnCallBack2 == 'function') this.btnCallBack2(e);            		
            	}else{
            		if(typeof this.btnCallBack == 'function') this.btnCallBack(e);
            	}
            	return false;
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
		 
		 return ApprTitleToolbar;
	 });
	
}).call(this);