(function() {
    define(["jquery", "underscore", "jquery.go-popup"], function($, _) {
        function makeWrapOption(type, name, value, options) {
            var html = [], 
                id = [type, name, value].join('-'), 
                attrBuff = [], attrStr;
            
        	_.each(options.attrs || {}, function(v, k) {
        		attrBuff.push(k + '="' + v + '"');
        	});
        	
        	attrStr = attrBuff.length > 0 ? ' ' + attrBuff.join(' '): '';
            
            html.push('<span class="wrap_option">');
                html.push(['<input id="', id, '" type="', type,'" name="', name, '" value="', value, '"', (options.checked ? ' checked="checked"' : ''), attrStr , '>'].join(''));
                html.push('<label for="' + id + '">' + _.escape(options.label) + '</label>');
            html.push('</span>');
            
            return html.join("\n");
        }
        
        function showErrorMsg(target, msg) {            
            $.goError(msg, target);
            target.addClass('enter error').focus();
        }
        
        return {
            radio: function(name, value, options) {
                _.defaults(options || {}, { "checked": false, "label": value });
                return makeWrapOption('radio', name, value, options);
            },
            
            radiogroup: function(name, values, selected, postfix) {
                var rg = [];
                _.each(values, function(item) {
                    rg.push(makeWrapOption('radio', name, item.value, { "label": item.label || item.value, "checked": item.value === (selected || '') }));
                });
                return rg.join(postfix || '' + "\n");
            },
            
            checkbox: function(name, value, options) {
                _.defaults(options || {}, { "checked": false, "label": value });
                return makeWrapOption('checkbox', name, value, options);
            }, 
            
            select: function(name, options, selected) {
                var html = [];
                html.push('<span class="wrap_select">');
                    html.push('<select name="' + name + '">');
                    _.each(options, function(opt) {
                        html.push(['<option value="', opt.value, '"', opt.value === selected ? ' selected="selected"': '', '>', opt.label || opt.value, '</option>'].join(''));
                    });
                    html.push('</select>');
                html.push('</span>');
                
                return html.join("\n");
            }, 
            
            printError: function($target, msg) {
                $.goError(msg, $target);
                
                if($target.is('input[type=text], textarea')) {
                    $target.addClass('enter error').focus();
                }
            }
        };
    });
})();