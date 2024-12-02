(function() {
    
    define(["underscore", "backbone", "app", "i18n!nls/commons", "i18n!admin/nls/admin"], function(_, Backbone, GO, CommonLang, AdminLang) {
        
        var tvars = {
            "label": {
                "modify": CommonLang["수정"], 
                "remove": CommonLang["삭제"], 
                "add": CommonLang["추가"], 
                "remove_all": CommonLang["모두삭제"]
            }, 
            "classtype": {
                "position": AdminLang["직위"], 
                "grade": AdminLang["직급"], 
                "duty": AdminLang["직책"], 
                "usergroup": AdminLang["사용자그룹"]
            }
        };
        
        var ClassCodePicker = Backbone.View.extend({
            tagName: "div", 
            className: "classcode-picker option_display", 
            
            events: {
                "change select[name=class_type]": "loadClassCode", 
                "click .btn-regist": "_addClassCode", 
                "click .btn-remove-all": "removeAllCode", 
                "click .btn-target-class-remove": "_removeSelectedCode"
            }, 
            
            initialize: function(options) {
            	this.options = options || {};
                this.$el.data('cache', {});
            }, 
            
            render: function() {
                this.$el.empty().append(makeTemplate());
                this.loadClassCode();
            }, 
            
            loadClassCode: function() {
                var type = this.$el.find('select[name=class_type]').val(), 
                    container = this.$el.find('select[name=class_code]');
                
                if(this.isCachedData(type)) {
                    makeClassCodeOptions(container, this.getCacheData(type));
                } else {
                    var self = this;
                    $.ajax( createClassCodeLoadUrl(type, this.options.isAdmin || false) ).done(function(res) {
                        self.setCacheData(type, res.data);
                        makeClassCodeOptions(container, res.data);
                    });
                }
            }, 
                        
            addClassCode: function(id, type, name, code) {
                if(this.$el.find('ul.list_option li[data-id=' + id + ']').length < 1) {
                    this.$el.find('ul.list_option').append(makeSelectedClassList(type, {
                        "id": id, "type": type, "name": name, "code": (code || '')
                    }));
                }
            }, 
            
            removeAllCode: function() {
                this.$el.find('ul.list_option li').remove();
            }, 
            
            isCachedData: function(type) {
                return typeof this.getCacheData(type) !== 'undefined';
            }, 
            
            getCacheData: function(type) {
                return typeof type === 'undefined' ? this.$el.data('cache') : this.$el.data('cache')[type];
            }, 
            
            setCacheData: function(type, obj) {
                var cachedData = this.getCacheData() || {};
                cachedData[type] = obj;
                
                this.$el.data('cache', cachedData);
            }, 
            
            _addClassCode: function(e) {
            	var selectedType = this.$el.find('select[name=class_type] option:selected'), 
                	selectedCode = this.$el.find('select[name=class_code] option:selected'), 
                	codeId = selectedCode.val();
            	
            	if(!!codeId) {
            		this.addClassCode(codeId, selectedType.val(), selectedCode.text(), selectedCode.data('code'));
            	}
            }, 
            
            _removeSelectedCode: function(e) {
                $(e.target).closest('li').remove();
            }
        });
        
        function makeTemplate() {
            var html = [];
            html.push('<div class="wrap">');
                html.push('<span class="wrap_select">');
                    html.push(makeClassTypeSelector());
                html.push('</span>');
                html.push('<span class="wrap_select">');
                    html.push('<select name="class_code"></select>');
                html.push('</span>');
                html.push('<span class="wrap_btn">');
                    html.push('<span class="btn_fn9 btn-regist">'+tvars.label.add+'</span>');
                    html.push('<span class="btn_fn9 btn-remove-all">'+tvars.label.remove_all+'</span>');
                html.push('</span>');
            html.push('</div>');
            html.push('<ul class="list_option"></ul>');
            
            return html.join("\n");
        }
        
        function makeClassTypeSelector() {
            var html = [];
            html.push('<select name="class_type">');
            _.each(tvars.classtype, function(value, key) {
            	if(GO.session("useOrg") || key != "duty") {
            		html.push('<option value="'+ key +'">' + value + '</option>');
            	}
            });
            html.push('</select>');
            
            return html.join("\n");
        }
        
        function makeClassCodeOptions(parent, data) {
            var html = [];
            
            html.push('<option value="">** ' + CommonLang["선택"] + ' **</option>');
            _.each(data, function(obj, idx) {
                html.push('<option value="' + obj.id + '" data-code="' + obj.code + '">' + obj.name + '</option>');
            });
            
            parent
                .empty()
                .append(html.join("\n"));
        }
        
        function makeSelectedClassList(type, data) {
            var html = [],
            	printCodeType = tvars.classtype[type];
            	
            html.push('<li data-id="' + data.id + '" data-type="' + data.type + '" data-name="' + data.name + '" data-code="' + data.code + '">');
                html.push('<span class="major">[' + printCodeType + ' : ' + data.name + ']</span>');
                html.push('<span class="wrap_btn btn-target-class-remove"><span class="ic_side ic_basket_bx" title="' + tvars.label.remove + '" data-btntype="postdelete"></span></span>');
            html.push('</li>');
            
            return html.join("\n");
        }
        
        function createClassCodeLoadUrl(type, isAdmin) {
            isAdmin = isAdmin || false;
            
            return [GO.config('contextRoot'), (isAdmin ? 'ad/' : ''), 'api', '/' + type, '/list'].join(''); 
        }
        
        return ClassCodePicker;
        
    });
    
})();