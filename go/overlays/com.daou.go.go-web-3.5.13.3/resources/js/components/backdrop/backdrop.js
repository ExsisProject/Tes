/**
 * 사용법 1.
 * 1. backdrop 기능을 사용 하고 싶은 element wrapper 를 backboneView el 속성으로 지정하여 BackdropView 인스턴스 생성.
 * 2. 인스턴스의 linkBackdrop 메소드에 연결하고 싶은 버튼 $element 을 넘겨 링크.
 *
 * 사용법 2. // 1번은 el 속성을 사용하므로 초심자의 경우 위험 부담이 있음.
 * 1. 인자 없이 인스턴스를 만들고, instance.backdropToggleEl 에 element wrapper 를 할당.
 * 2. 인스턴스의 linkBackdrop 메소드에 연결하고 싶은 버튼 $element 을 넘겨 링크.
 *
 * backdropToggleEl => 실제로 backdrop event 에 의해 toggle 이 되는 영역. 일반적으로 layer 를 지정. el-backdrop 으로 마킹.
 * backdropToggleElSelector => toggle layer 를 지정 해야 하는데, element 가 먼저 생성되지 않는 경우 selector 를 지정하여 나중에 element 를 지정 할 수 있다.
 * links: [] => layer 를 toggle 하는 button 의 $el 을 links 에 담아 event 가 일어났을때 toggle 여부를 판단한다.
 */
define('components/backdrop/backdrop', function(require) {
	
	return Backbone.View.extend({

		initialize: function() {
			this.$el.attr('el-backdrop', this.cid); // 마킹용. 기능에 관여하지 않음.
			this.backdropToggleEl = this.$el;
			this.bindBackdrop();
		},

		setBackdropElement: function($el) {
			this.backdropToggleEl = $el;
		},

		linkBackdrop : function($el) {
			$el.attr('el-backdrop-link', this.cid); // 마킹용. 기능에 관여하지 않음.
			if (!this.links) this.links = [];
			this.links.push($el);	
		},

		bindBackdrop : function() {
			if (this.alreadyBind) return;
			this.alreadyBind = true;
			$(document).on("backdrop." + this.cid, $.proxy(function(e) {
				this._onBackdrop(e);
			}, this));
		},
		
		unBindBackdrop : function() {
			$(document).off("backdrop." + this.cid);
		},
		
		toggle : function(toggleFlag) {
			var isChangeToggleState = toggleFlag != this._isVisible();
			
			if (!this.backdropToggleEl) {
				this._setBackdropToggleEl();
			}
			
			this.backdropToggleEl.toggle(toggleFlag);
			
			if (isChangeToggleState) {
				toggleFlag ? this.afterShow() : this.afterHide();
			}
		},
		
		afterShow : function() {},

		afterHide : function() {},
		
		remove : function() {
			$(document).off("backdrop." + this.cid);
			Backbone.View.prototype.remove.apply(this, arguments);
		},
		
		_onBackdrop : function(e) {
			if ($(e.relatedTarget).closest(this.backdropToggleEl).length > 0) { // backdrop 영역인경우.
				this.toggle(true);
				return;
			}
			
			var toggleFlag = false;
			var isLinkedTarget = false; 
			_.each(this.links, function($link) {
				
				
				//화면에 없는 jquery객체를 미리 linkBackdrop 한경우 (달력레이어의 왼쪽,오른쪽버튼)
				if($link.length == 0){
					$link = $link.selector;
				}else{
					if ($link.attr('disabled') === 'disabled') return;
					if (!$link.is(":visible")) return; // ghost 를 찾아야 할까
				}
				
				if ($(e.relatedTarget).closest($link).length > 0) {
					isLinkedTarget = true;
					if(typeof $link == "string"){
						toggleFlag = $($link).attr("backdrop-toggle");
					}else{
						toggleFlag = $link.attr("backdrop-toggle");
					}
					return false;
				}
			});
			if (isLinkedTarget) { // 링크된 영역인경우 : 유지시켜줘야 하는 경우.
				toggleFlag = toggleFlag ? !this._isVisible() : true; 
				this.toggle(toggleFlag);
				return;
			}
			
			this.toggle(false); // 바깥 영역인경우
		},
		
		_isVisible : function() {
			if (!this.backdropToggleEl) {
				this._setBackdropToggleEl();
			}
			
			return this.backdropToggleEl.is(":visible");
		},
		
		_setBackdropToggleEl : function() {
			if (!this.backdropToggleElSelector) {
				console.warn("backdropToggleElSelector is not specified.");
				return;
			}
			this.backdropToggleEl = typeof(this.backdropToggleElSelector) == "object" ? 
					this.backdropToggleElSelector : this.$(this.backdropToggleElSelector);
		}
	});
});