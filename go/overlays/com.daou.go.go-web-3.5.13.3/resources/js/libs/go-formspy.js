(function() {
	var global = this, 
		aslice = Array.prototype.slice, 
		FormSpy;


	var // 상수 정의
		SOURCE_DATA_ATTR = "data-fspy-source", 
		CHANGE_ATTR_EVENTNAME = "changed:attribute",
		RESTORED_ATTR = "restored:attribute", 
		RESTORED_ALL = "restored:all";

	/**
	폼 하위 요소의 데이터 변경사항을 감지하기 위한 클래스

	@class FormSpy
	**/
	FormSpy = (function() {
		/**
		@class FormSpy 
		@constructor
		**/
		var constructor = function(form) {
			if(!$(form).is("form")) throw new Error("Invaild Form Object");

			this.el = form;
			this.$el = $(form);

			this._prepareForm();
			this.__changedAttributes__ = {};
		};

		constructor.prototype = {
			/**
			대상 폼 오브젝트

			@property form 
			@type Object
			**/
			form: null, 

			/**
			이벤트 맵

			@property events 
			@type Object
			**/
			events: {
			    "input[type=text]:not([data-fspy-bypass])"           : "change",
			    "input[type=text]:not([data-fspy-bypass][readonly])" : "keyup paste",
				"input[type=hidden]:not([data-fspy-bypass])"	     : "change", 
				"textarea:not([data-fspy-bypass])" 				     : "keyup paste",
				"select:not([data-fspy-bypass])" 				     : "change", 
				"input[type=checkbox]" 							     : "change", 
				"input[type=radio]" 							     : "click"
			}, 

			/**
			스파이 대상 수동 등록
				- 폼에 원래 있는 요소가 아니라 스크립트로 인해 새로 생성된 요소를 스파잉하기 위해 수동 등록

			@method registry
			@chainable
			**/
			registry: function(element, source) {
                var $el = $(element), 
                    srcdata = this._getSourceData(element), 
                    tsource = source || srcdata;
				$el.attr(SOURCE_DATA_ATTR, tsource);

                if(srcdata !== tsource) this.registChangedAttr($el.attr("name"), srcdata);
			}, 

			/**
			스파이 대상 삭제

			@method unregistry
			@chainable
			**/
			unregistry: function(element) {
				var $el = $(element);

				this.unregistChangedAttr($el.attr("name"));
				$(element).removeAttr(SOURCE_DATA_ATTR);
			}, 

			/**
			변경된 엘리먼트 등록
				formspy 대상이 아니더라도 변경관리 필요한 데이터를 수동으로 등록

			@method registChangedAttr
			@param {String} attrName 엘리먼트 name 속성 값
			@param {String} val 엘리먼트의 입력 혹은 선택된 값
			@return {Object} FormSpy 객체
			@chainable
			**/
            registChangedAttr: function(attrName, val) {
            	this.__changedAttributes__[attrName] = val;

            	// 변경이 발생하면 변경 이벤트 발생(FormSpy 객체, 변경발생한 요소 name 및 value값 전달);
            	this.$el.trigger(CHANGE_ATTR_EVENTNAME, [attrName, val, this]);

            	return this;
            }, 

			/**
			변경된 엘리먼트 캐시에서 삭제

			@method unregistChangedAttr
			@param {String} attrName 엘리먼트 name 속성 값
			@return {Object} FormSpy 객체
			@chainable
			**/
            unregistChangedAttr: function(attrName) {
                delete this.__changedAttributes__[attrName];
				// 변경점이 모두 사라지면 복구 이벤트 발생
                
                this.$el.trigger(RESTORED_ATTR, [attrName]);
            	if(!this.hasChangedAttrs()) this.$el.trigger(RESTORED_ALL, [attrName]);

                return this;
            }, 

			/**
			변경된 속성값 반환

			@method getChangedAttrs
			@return {Object} 변경된 값에 대한 해시 값
			**/
			getChangedAttrs: function(key) {
				return (!!key ? this.__changedAttributes__[key] : this.__changedAttributes__);
			}, 
			
			/**
            해당 속성이 변경되었는지 검사

            @method hasChanged
            @return {Boolean} 변경 여부
            **/
			hasChanged: function( key ) {
			    return _.has(this.__changedAttributes__, key);
			}, 

			/**
			감시하는 폼 객체의 데이터가 변경되었는지의 여부 반환

			@method hasChangedAttrs
			@return {Boolean} 폼 객체 데이터 변경 여부
			**/
			hasChangedAttrs: function() {
				return !!(_.keys(this.__changedAttributes__).length > 0);
			}, 

			/**
			FormSpy에서 발생하는 이벤트 감시

			@method on
			**/
			on: function(eventname, callback, context) {			    
				return this.$el.on(eventname, $.proxy(callback, context || this));
			}, 

			/**
			FormSpy에서 발생하는 이벤트 감시 해제

			@method off
			**/
			off: function(eventname) {
			    var result;
			    if(typeof eventname === "undefined") {
			        result = this.$el.off();
			    } else {
			        result = this.$el.off(eventname, $.proxy(callback, context || this));
			    }
				return result;
			}, 

			/**
			폼 초기화 작업

			@method _prepareForm
			@private
			**/
			_prepareForm: function() {
				var self = this;
				this._findSpyElements().attr(SOURCE_DATA_ATTR, function() {
					return self._getSourceData(this);
				});
				// 이벤트 초기화
				this._unbindEvent()._bindEvent();
			}, 

			/**
			이벤트 바인딩

			@method _bindEvent
			@return {Object} FormSpy 객체
			@private
			@chainable
			**/
			_bindEvent: function() {
				_.each(this.events, function(eventname, selector) {
				    var en = eventname + ".formspy";
					this.$el.on(en, selector, $.proxy(this._changeAttribute, this));
				}, this);
				return this;
			}, 

			/**
			이벤트 바인딩 해제

			@method _unbindEvent
			@return {Object} FormSpy 객체
			@private
			@chainable
			**/
			_unbindEvent: function() {
			    this.$el.off(".formspy");
				return this;
			}, 

			/**
			spy 대상 엘리먼트 반환
				- 폼 엘리먼트 내의 데이터를 가진 요소들(input, textarea, select)을 찾는다.
				- 엘리먼트에 data-fspy-bypass 속성이 지정되어 있는 경우는 대상에서 제외시킨다.

			@method _findSpyElements
			@return {Objet} HTML 엘리먼트 객체 배열
			@private
			**/
			_findSpyElements: function() {
				return this.$el.find("*:not([data-fspy-bypass])").filter(function(index) {
					var $this = $(this);
					return $this.is("input") || $this.is("textarea") || $this.is("select");
				});
			}, 

			/**
			대상 엘리먼트에서 원본 데이터 추출

			@method _getSourceData
			@return {String} 원본 데이터 문자열
			@private
			**/
			_getSourceData: function(telement) {
				var source = "", 
					$this = $(telement);

				if($this.is("select")) {
					source = $this.find("option:selected").val();
				} else if($this.is("input[type=checkbox]") || $this.is("input[type=radio]")) {
					source = "" + $this.is(":checked");
				} else {
					source = $this.val();
				}

				return source; 
			}, 

			/**
			엘리먼트 속성 변경 감지 후 이벤트 발생
				- 변경점이 발생하면 changed:attributes 이벤트 발생하고 FormSpy 객체와 변경 요소 name/value 값을 전달
				- 변경점이 모두 사라지면 restored:attributes 이벤트 발생

			@method _changeFieldState
			@return {String} 원본 데이터 문자열
			@private
			**/
            _changeAttribute: function(e) {
            	console.log("[FormSpy#_changeAttribute]");
                var $target = $(e.currentTarget), 
                    attrName = $target.attr("name"), 
                    curdata = this._getSourceData(e.currentTarget), 
                    isChanged = !($target.attr("data-fspy-source") === curdata) || (e.type == "paste");
				
				// data-fspy-source 속성이 없는 요소는 제외시킨다.
				if($target.is(":not([data-fspy-source])")) return this;

                if(isChanged) {
                	this.registChangedAttr(attrName, curdata);
                } else {
                	this.unregistChangedAttr(attrName, curdata);
                }
                return this;
            }
		};

		return constructor;
	})();

	// 글로벌 객체에 등록
	global.FormSpy = FormSpy;

}).call(this);