(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/security_level",
        "approval/collections/security_levels",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ], 
    function(
        $,
        Backbone,
        App,
        SecurityLevelModel,
        SecurityLevelCollection,
        commonLang,
        approvalLang
    ) {
        
        var SecurityLevelListView = Backbone.View.extend({
            
            /**
             * SecurityLevelModel의 json 형태 데이터
             */
            selected: null,
            
            /**
             * SecurityLevelModel의 컬렉션
             */
            securityLevels: null,
            
            /**
             * @options.selectedData 선택되어져야 할 SecurityLevelModel의 json 데이터
             */
            initialize: function(options) {
                if (options.selectedData) {
                    this.selected = options.selectedData;
                }
                this.securityLevels = new SecurityLevelCollection();
            },
            
            /**
             * 보안등급 뷰 렌더링
             */
            render: function() {
                this.securityLevels.fetch({
                    success: $.proxy(function(collection) {
                        this._markSelectedSecurityLevel(collection, this.selected);
                        this.$el.append(this._renderTmpl({
                            securityLevels: collection.toJSON()
                        }));
                    }, this)
                });
            },
            
            /**
             * 현재 셀렉트박스에서 선택된 보안등급 데이터를 json 형태로 반환한다. 
             * @returns
             */
            getSelectedData: function() {
                var selectedId = this.$el.val();
                var model = this.securityLevels.get(selectedId);
                return model.toJSON();
            },
            
            _markSelectedSecurityLevel: function(collection, selected) {
                if (selected && selected['id']) {
                    collection.each(function(m) {
                        if (m.get('id') == selected['id']) {
                            m.set('isSelected', true);
                        }
                    });
                } else {
                    var first = collection.at(0);
                    if (first) {
                        first.set('isSelected', true);
                    }
                }
            },
            
            _renderTmpl: function(data) {
                var tmpl = [];
                var lang = {
                		'noUse' : approvalLang['미사용']
                };
                _.extend(data, {
                	lang : lang
                });
                tmpl.push('{{#securityLevels}}');
                tmpl.push('    <option value="{{id}}" {{#isSelected}}selected{{/isSelected}}>{{name}}{{^useFlag}}({{lang.noUse}}){{/useFlag}}</option>');
                tmpl.push('{{/securityLevels}}');
                var compiled = Hogan.compile(tmpl.join('\n'));
                return compiled.render(data);
            }
        });
        
        return SecurityLevelListView;
    });
}).call(this);
