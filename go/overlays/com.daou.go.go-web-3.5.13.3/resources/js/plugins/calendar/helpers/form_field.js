(function() {

    define([
        "jquery", 
        "underscore", 
        "hogan", 
        "i18n!nls/commons"
    ], 

    function(
        $, 
        _, 
        Hogan, 
        commonLang
    ) {
        var // 상수 정의
            ELEMENT_TYPE = {"input": "input", "textarea": "textarea" }, 
            EDITABLE_CLASSNAME = "txt_form", 
            WMAX_CLASSNAME = "w_max", 
            FormFieldHelper, 
            templates = {
                "view"      : '<span class="{{view_classnames}}"{{#editable?}} data-field="{{attr_name}}"{{/editable?}}>{{&content}}{{#editable?}}<span class="tool_tip">' + commonLang["수정"] + ' <i class="tail"></i></span>{{/editable?}}</span>', 
                "input"     : '<input{{^edit?}} id="form-field-{{attr_name}}"{{/edit?}} class="txt wfix_max{{#edit?}} edit{{/edit?}} {{fix_width_classname}}" type="text" name="{{attr_name}}" value="{{content}}"{{#maxlength}} maxlength="{{maxlength}}"{{/maxlength}} />', 
                "textarea"  : '<textarea name="{{attr_name}}" class="txtarea {{fix_width_classname}}{{#edit?}} edit{{/edit?}}" rows="10">{{content}}</textarea>', 
                "button"    : '<span class="ic_side ic_done" title="' + commonLang["수정"] + '"></span>'
            };

        /**
        클릭시 바로 입력수정가능한 폼 요소 생성 헬퍼

        @class FormFieldHelper 
        @constructor
        **/
        FormFieldHelper = (function() {
            var FormFieldHelper = function(type, name, content, editable) {

                this.options = _.defaults( options || {}, { editable: true, required: false, maxlength: 0 });
                
                this.type = type || "input", 
                this.name = name || "", 
                this.content = content || "";
                this.editable = typeof editable === 'undefined' ? true : editable;
                this.required = false;                
                this.maxlength = 0;
                this.preClassnames = "";
                this.postClassnames = "";
                this.widthFixClassname = "w_max";
                this.changableWidth = true;

                // 변경되기 이전 콘텐츠 기억(원본)
                this.__prevContent__ = "" + this.content;
                // 내용이 변경되었는지 여부 체크
                this.__isChanged__ = false;

                this._compiledTpl = Hogan.compile(this.content ? templates.view: templates[this.type]);

                return this;
            };

            FormFieldHelper.prototype = {
                /**
                최종 HTML 엘리먼트 반환

                @method render
                @return {Object} jQuery 엘리먼트 반환
                **/                
                render: function() {
                    return this._buildViewTemplate();
                }, 

                /**
                현재 엘리먼트 jQuery 객체 반환

                @method render
                @return {Object} jQuery 엘리먼트 반환
                **/
                getJQueryElement: function(parent) {
                    var args = [], 
                        selector = [this.type, "[name=", this.name, "]"].join("");
                    args.push(selector);
                    if(!(typeof parent === "undefined")) args.push(parent);
                    return $.apply($, args);
                }, 

                /**
                최종 content 내용 반환

                @method getContent
                @return {String} 컨텐츠
                **/ 
                getContent: function() {
                    return this.content;
                }, 
                
                setEditable: function( bool ) {
                    this.editable = bool;
                    return this;
                }, 
                
                setRequired: function( bool ) {
                    this.required = bool;
                    return this;
                }, 
                
                setMaxLength: function( length ) {
                    this.maxlength = length;
                    return this;
                }, 

                setPreClassnames: function(newCN) {
                    this.preClassnames = newCN;
                    return this;
                }, 

                setPostClassnames: function(newCN) {
                    this.preClassnames = newCN;
                    return this;
                }, 

                setWidthFixClassname: function(newCN) {
                    this.widthFixClassname = newCN;
                    return this;
                }, 

                setChangableWidth: function(newBool) {
                    this.changableWidth = newBool;
                    return this;
                }, 

                /**
                변경되기 이전 내용 반환

                @method getSourceContent
                @return {String} 이전 내용
                **/ 
                getSourceContent: function() {
                    return this.__prevContent__;
                }, 

                /**
                내용이 변경되었는지 여부 반환

                @method isChanged
                @return {boolean} 이전 내용
                **/
                isChanged: function() {
                    return this.__isChanged__;
                }, 

                /**
                수정모드로 변환

                @method setEditMode
                @return {Object} FormFieldHelper 인스턴스 객체
                @chainable
                **/ 
                setEditMode: function(e) {
                    var $target = (e instanceof $.Event ? $(e.currentTarget) : $(e)), 
                        compiledTpl = Hogan.compile(templates[this.type] + templates["button"]);

                    $target.empty().html(compiledTpl.render({
                        "attr_name": this.name, 
                        "content": this._unescapeContent(this.content), 
                        "fix_width_classname": this.widthFixClassname,
                        "maxlength": this.maxlength > 0 ? this.maxlength : null, 
                        "edit?": true
                    }));
                    $target.removeClass(EDITABLE_CLASSNAME).addClass(this._getTypeClass());
                    if(this.changableWidth) $target.addClass(this.widthFixClassname);
                    return this;
                }, 

                setViewMode: function(e) {
                    var $target = (e instanceof $.Event ? $(e.currentTarget) : $(e)), 
                        $field = $target.find(this.type + '[name="' + this.name + '"]'), 
                        fieldVal = $field.val();

                    // 입력된 내용으로 변경
                    if(!this._validate( $target )) {
                        return false;
                    }

                    this.content = this._escapeContent(fieldVal);
                    this.__isChanged__ = (this.__prevContent__ !== this.content);

                    // 뷰모드로 DOM 구조 변경
                    $target.empty().html(this._buildViewTemplate());
                    $target.removeClass(this._getTypeClass()).addClass(EDITABLE_CLASSNAME);
                    if(this.changableWidth) $target.removeClass(this.widthFixClassname);
                    return true;
                }, 
                
                _unescapeContent: function(str) {
                    str = str.replace(/&lt;/gi, "<");
                    str = str.replace(/&gt;/gi, ">");
                    
                    return str;
                }, 
                
                _escapeContent: function(str) {
                    str = str.replace(/</gi, "&lt;");
                    str = str.replace(/>/gi, "&gt;");
                    
                    return str;
                }, 
                
                _validate: function( $target ) {
                    var $field = $target.find(this.type + '[name="' + this.name + '"]'), 
                        fieldVal = $field.val();
                    
                    // 필수 여부 검증
                    if(this.required && !fieldVal) {
                        $field.val(this.__prevContent__);
                        $target.trigger("required:" + this.name, $field);
                        return false;
                    }
                    
                    // 입력 최대값 검증
                    if(this.maxlength > 0 && fieldVal.length > this.maxlength) {
                        $field.val(fieldVal.slice(0, this.maxlength));
                        $target.trigger("max:" + this.name, $field, this.maxlength);
                        return false;
                    }
                    
                    return true;
                }, 

                /**
                보기용 HTML 코드 반환

                @method _buildViewTemplate
                @return {String} 보기용 HTML 코드
                @private
                **/  
                _buildViewTemplate: function() {
                    var classnames = [], 
                        content = this.content;
                    
                    if(this.preClassnames) classnames.push(this.preClassnames);
                    if(this.editable) classnames.push("txt_form");
                    if(this.postClassnames) classnames.push(this.postClassnames);
                    
                    return this._compiledTpl.render({
                        "attr_name" : this.name, 
                        "content": GO.util.convertRichText(content), 
                        "fix_width_classname": content ? "" : this.widthFixClassname, 
                        "view_classnames": classnames.join(" "), 
                        "editable?": this.editable
                    });
                }, 

                /**
                input/textarea별 에디트용 클래스명 반환

                @method _getTypeClass
                @return {String} 클래스명
                @private
                **/
                _getTypeClass: function() {
                    return {"input": "txt_edit", "textarea": "textarea_edit"}[this.type];
                }, 
            }

            return FormFieldHelper;
        })();

        return FormFieldHelper;
    });

}).call(this);