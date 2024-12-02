/*! 
 * go-gadget - v1.5.0 
 * 그룹 오피스 가젯 프레임워크
 * 
 * Date: 2014-04-18 

 */ 
;(function( $, window, document, undefined ) {

// 네임스페이스 정의
if(!window.GO) {
    window.GO = {};
}

var GO = window.GO;


// 내부 유틸리티 함수들
var utils = {};

// 네임스페이스 생성/확인 함수
utils.namespace = function( nsstr, isNew ) {
    var tok = nsstr.split('.'), 
        isNew = (typeof isNew === 'undefined' ? true: false), 
        parent = window;

    for(var i=0, len=tok.length; i<len; i++) {
        if(typeof parent[tok[i]] === 'undefined') {
            if(isNew) {
                parent[tok[i]] = {};    
            } else {
                throw new Error("해당 모듈이 존재하지 않습니다.");
                break;
            }
        }

        parent = parent[tok[i]];
    }

    return parent;
};

utils.isString = function( obj ) {
    return (typeof obj === "string" || obj instanceof String);
};

utils.require = function( nsstr ) {
    utils.namespace(nsstr, false);
};

utils.extend = function( parent, props ) {
    var subclass = function() {}, 
        klass = function( spec ) {
            this._init.apply( this, arguments );
        };

    if(!parent.prototype._init) {
        parent.prototype._init = function() {};
    }

    subclass.prototype = $.extend( true, {}, parent.prototype, props );
    klass.prototype = new subclass;

    // 단축형
    klass.fn = klass.prototype;
    klass.fn.parent = klass;
    klass._super = klass.__proto__;

    return klass;
};

utils.parseUrl = function( path ) {
    var location = window.location, 
        _ta = document.createElement('a'), 
        parsedHash = {};

    _ta.setAttribute('href', path);

    parsedHash = {
        protocol: /^(http|https)/.test(_ta.protocol) ? _ta.protocol : location.protocol, 
        host: _ta.host ? _ta.host : location.host, 
        hostname: _ta.hostname ? _ta.hostname : location.hostname, 
        port: _ta.port ? _ta.port : location.port, 
        pathname: _ta.pathname[0] === '/' ? _ta.pathname : '/' + _ta.pathname, 
        search: _ta.search ? _ta.search : '',
        href: _ta.href, 
        hash: _ta.hash? _ta.hash : location.hash
    };

    return parsedHash;
};

utils.fixUrl = function( url, contextRoot ) {
    var parsedUrl = utils.parseUrl(url), 
        root = contextRoot || '/', 
        pn = parsedUrl.pathname, 
        pns = pn[0] === '/' ? pn.slice(1) : pn;

    if(root && pn.indexOf(root) !== 0) {
        pn = root + pns;
    }
    return [pn, parsedUrl.search, parsedUrl.hash].join('');
};

utils.serializeForm = function( form, encode ) {
    encode = encode || false;
    var arr = $(form).serializeArray(), 
        h = {};

    $.each(arr, function(index, obj){
        var tval = encode ? encodeURIComponent(obj.value) : obj.value;
        if(obj.name in h) {
            if(!(h[obj.name] instanceof Array)) h[obj.name] = [h[obj.name]];
            h[obj.name].push(tval);
        } else {
            h[obj.name] = tval;
        };
    });

    return h;
};


utils.namespace("GO.gadget");

GO.gadget.dom = {
    select: function( obj ) {
        var $select = $( '<select />' ).attr( 'name', obj.name ), 
            values = obj.value.split('|'), 
            labels = (!!obj['labels'] ? obj['labels'].split('|') : values), 
            defaultValue = obj.defaultValue, 
            options = [];

        for(var i=0, len=values.length; i<len; i++) {
            var val = values[i], 
                $option = $('<option value="'+values[i]+'">' + labels[i] + '</option>');

            if( obj.defaultValue === val ) {
                $option.prop("selected", true);
            }

            options.push($option);
        }

        return $select.append(options);
    }, 

    checkbox: function( obj ) {
        var $el = $( '<input type="checkbox"/>' ), 
            idAttr = 'gadget-opt-cb-' + obj.name + '-' + obj.value;
        
        $el
            .prop( 'id', idAttr)
            .prop( 'name', obj.name )
            .prop( "checked", obj.checked || false )
            .val( obj.value );

        return $el;
    }, 

    text: function( obj ) {
        return $( '<input />' )
            .attr( 'type', 'text' )
            .attr( 'name', obj.name )
            .val( obj.value || '' );
    }, 

    textarea: function( obj ) {
        return $( '<textarea>' )
            .attr( 'name', obj.name )
            .val( obj.value || '' );
    }, 

    parse: function( obj ) {
        return this[obj.type].call( this, obj );
    }
};

utils.namespace("GO.gadget");

GO.gadget.i18n = (function() {

    function i18n( langs, locale ) {
        this.locale = locale;
        this.langs = initLang( langs, locale );
    }

    i18n.prototype = {
        parse: function( key, vars ) {
            vars = vars || {};

            var msg = this.langs[key];
            if(!!msg) {
                msg = i18n.parse(msg, vars);
            }
            
            return msg;
        }
    };

    // Static
    i18n.parse = function( source, vars ) {
        var result;

        result = source.replace(/\{\{([\s\S]+?\}?)\}\}/g, function(m, code) {
            return vars[code] || '';
        });
        
        return result;
    };

    function initLang( langs, locale ) {
        var rootLang = {};
        $.each( langs, function(key, val) {
            if(utils.isString(val)) {
                rootLang[key] = val;
            }
        });

        if( locale ) {
            $.extend(rootLang, langs[locale] || {});
        }

        return rootLang;
    }

    return i18n;
})();

utils.namespace('GO.gadget');

GO.gadget.ContentProvider = (function() {
    utils.require('GO.gadget.i18n');
    utils.require('GO.gadget.dom');

    // 가젯 컨텐츠 제공자
    var GadgetContentProvider = function( el, spec, option ) {
        var self = this, 
        
            option = option || {};

        if( !spec ) {
            throw new Error('gadget spec data error');
        }

        this.el = el;
        this.$el = $(this.el);
        this.locale = option['locale'] || 'ko';
        this.contextRoot = option['contextRoot'] || '/';
        this.methodType = option['methodType'] || 'create';
        this.spec = {
            id: spec.id, 
            name: spec.name || 'Title', 
            version: spec.version || '1.0', 
            description: spec.description || '', 
            author: spec.author || ''
        };

        this.pageTemplate = {
            empty: makeErrorPage, 
            loadError: function() {
                return makeGadgetContentLoadError.call(self);
            }
        };
        
        /**
         * 가젯 개인화 설정 가능 여부(DO 1.5 추가)
         * [조건]
         * 1. 전사 대시보드내
         * 2. 전사 대시보드 운영자여야 함
         * 이 조건은 외부에서 판단되어 전달되는 것임. 여기는 메모 용도로만 기록.
         */
        this.canPersonalize = option['canPersonalize'] || false;

        this.langs = $.extend( true, {
            "refresh": {
                "label": "새로고침", 
                "none": "안함", 
                "unit_minute": "{{time}}분", 
                "unit_hour": "{{time}}시간"
            }, 

            "personalize": {
                "label": "개인화", 
                "editable": "편집 가능", 
                "removable": "삭제 가능"
            }, 

            "highlight": {
                "label": "가젯 테두리", 
                "highlight": "강조"
            }, 

            "msg": {
                "load_error": "요청하신 내용을 불러오지 못했습니다.<br />오류가 지속될 경우, 운영자에게 문의해 주십시오."
            }

        }, option.langs || {});

        // 옵션 설정값
        this.options = {};

        // 가젯 개발자에 의해 정의된 프로퍼티들
        this.extProps = {
            // 가젯 컨텐츠 요청 URL
            url: "", 
            // 새로고침 옵션 사용
            refreshable: false, 
            // 테두리 강조 옵션 사용
            highlightable: false, 

            // 이벤트 정의
            events: {}, 

            // 스타일 정의
            styles: {}, 

            // 다국어 정의
            langs: {}, 

            // 옵션
            options: {}, 

            // 기본 옵션값
            defaultOptions: {refresh : -1}, 

            // 가젯 타이틀 설정
            setTitle: function() {
                return self.spec.name;
            }, 

            // 환경설정 저장시 폼 검증 수행
            // @return Any false가 리턴되면 통과, 그외 문자열 반환이면 오류 메시지 처리
            validate: function( el ) {
                return false;
            }, 
            
            // 환경 설정 옵션 렌더링
            // @return HTML Element 혹은 jQuery 객체
            renderConfig: function( el ) {}, 

            // 이벤트 콜백 함수
            // 이벤트 콜백 함수의 ui는 가젯 컨텐츠 영역의 레퍼 엘리먼트이다.
            // onSuccess: function() {}, 
            onSuccess: function( el, data ) {}, 

            // D&D 이벤트 콜백
            onMoved: function( el, newBoxNumber ) {}, 

            // 렌더링 오류 발생시 에러 처리
            onError: function(el, error) {
                self.getContentContainer()
                    .empty()
                    .append(makeGadgetContentLoadError.call(self));
            }
        };

        // 헬퍼
        this.dom = GO.gadget.dom;

        // HTML 편집기 실행기
        this.editorRunner = {};

        // 요청 파라미터 관리
        this.reqParams = {};
    };

    GadgetContentProvider.prototype = {
        // 가젯 로드 함수
        // 가젯 명세서에서 개발자가 script로 호출하는 부분
        // 실제 역할은 proxy 객체에 프로퍼티를 오버라이드 하는 역할만 한다.
        load: function( param ) {
            var 
                self = this, 
                args = Array.prototype.slice.call(arguments), 
                argsLength = args.length, 
                props = {};

            if(utils.isString(param)) {
                var props = argsLength > 1 ? args[argsLength - 1] : {};

                if(argsLength > 2 && $.isPlainObject(args[1])) {
                    $.extend( true, this.reqParams, args[1] );
                }

                $.extend( props, { url: param } );
            } else if($.isPlainObject( param )){
                props = param;
            }
            
            $.extend( true, this.extProps, props ); 

            if(this.methodType === 'create') {
                $.extend(true, this.options, this.extProps.defaultOptions);
            }

            // 몇몇 프로퍼티 등록(몇몇 키워드를 보하하기 위해 나중에 등록)
            this.extProps.spec = this.spec;
            this.extProps.contextRoot = this.contextRoot;
            this.extProps.locale = this.locale;
            this.extProps.i18n = new GO.gadget.i18n(this.extProps.langs, this.locale);
            this.extProps.dom = GO.gadget.dom;
            this.extProps.template = function(tpl, vars, partial) {
                var compiled = Hogan.compile(tpl);
                return compiled.render(vars || {}, partial || {});
            };
            this.extProps.pageTemplate = this.pageTemplate;
            this.extProps.requestContent = this.requestContent;

            $.extend( true, this.extProps.options, this.options );

            this.init();
        }, 

        /**
         * Private Methods
         */

        // 가젯 초기화
        // 대시보드 생성 후 가젯별 초기화시 명시적으로 호출됨
        init: function() {
            // 이벤트 처리
            this.delegateEvents();
            // 가젯 스타일 로드
            this.loadStyle();
            // 가젯 렌더링
            this.render();
            //
            // 새로고침 간격 적용
            this.setRefresh();
            
        }, 
        
        setRefresh : function(){
            if(this.extProps.refreshable) {
            	
                var $form = this.getOptionForm(),
                	duration = +this.options.refresh;
                
                if(this.intervalId){
                	clearInterval(this.intervalId);
                }
                
                if(duration > 0) {
                    this.intervalId = setInterval($.proxy(function() {
                        this.$el.trigger('gadget:request-content');
                    }, this), duration * 60 * 1000);
                }
            }
        },
        
        loadEditor: function() {            
            this.$el.find("[data-role=editable]").each($.proxy(function(i, el) {
                if(!$(el).data('initstatus')) {
                    this.editorRunner.load( el );    
                    $(el).data('initstatus', true);
                } 
            }, this));
        }, 

        getOptionForm: function() {
            return this.$el.find('.gadget-options-form');
        }, 

        getContentContainer: function() {
            return this.$el.find('.go-gadget-content');
        },

        setLangs: function( langs ) {
            $.extend( true, this.langs, langs );
        }, 

        setOption: function( option ) {
            if( $.isPlainObject(option) ) {
                $.extend( true, this.options, option );
            } else {
                var args = Array.prototype.slice.call(arguments, 1);
                this.options[ option ] = args[0];
            }

            // extProps.options와 options는 동기화 되도록 한다.
            $.extend( true, this.extProps.options, this.options);
        }, 

        setGadgetOptions: function( options ) {
            this.extProps.options = options || {};

            // GO-11463 : 임시 대응
            // 이 부분은 별도의 리팩토링을 수행하고 있기 때문에 임시로 대응한다.
            syncPredefinedOptions.call(this);
            // extProps.options와 options는 동기화 되도록 한다.
            $.extend( true, this.options, this.extProps.options);
        },

        setEditorRunner: function( obj ) {
            $.extend( true, this.editorRunner, obj);
        }, 

        getEditorRunner: function() {
            return this.editorRunner;
        }, 

        getEditorData: function() {
            var results = {};

            this.$el.find("[data-role=editable][id!='']").each($.proxy(function(i, el) { // dext5editor 는 textarea 를 placeholder 로 지원하지 않는다.
                var attrName = $(el).attr("name"),
                    editorData = this.getEditorRunner().getData(el);

                if($.isPlainObject(editorData)) {
                    $.extend(results, editorData);
                } else {
                    results[attrName] = editorData;
                }
            }, this));

            return results;
        }, 

        getOption: function( key ) {
            return typeof key === 'undefined' ? this.options : (this.options[key] || "");
        }, 

        loadStyle: function() {
            var self = this, 
                styleId = 'go-gadget-style-' + this.spec.id;

            this.$el.addClass('go-gadget-' + this.spec.id);

            if($.isEmptyObject(this.extProps.styles) || $('#' + styleId).length > 0) {
                return;
            } else {
                var ns = '.go-gadget-' + this.spec.id + ' .go-gadget-content', 
                    head = document.getElementsByTagName('head')[0], 
                    stylesheet = document.createElement('style');

                stylesheet.type = 'text/css';
                stylesheet.setAttribute('id', styleId);
                head.appendChild(stylesheet);

                $.each(this.extProps.styles, function(selector, property) {
                    addStyleProps(stylesheet, ns + ' ' + selector + ' {' + property + '}');
                });
            }
        }, 

        render: function() {
            // 타이틀 설정
            this.setTitle();
        }, 

        // @deprecated
        setTitle: function() {
        }, 

        getTitle: function() {
            return this.extProps.setTitle();
        }, 

        isRefreshable: function() {
            return !!this.extProps.refreshable;
        }, 

        isHighlightable: function() {
            return !!this.extProps.highlightable;
        }, 

        renderConfig: function() {
            var $form = this.getOptionForm();
            
            $form.html("");
            
            try {
                this.extProps.renderConfig($form.get(0));
            } catch(e) {
                callErrorAfterRender.call(this, $form.get(0), e);
            }

            if(this.isRefreshable()) {
                $form.prepend(makeRefreshOption.call(this));
                $form.find("select[name=refresh]").val(this.options.refresh || '-1');
            }

            if(this.canPersonalize) {
                $form.append(makePersonalizeOption.call(this));
            }

            if(this.isHighlightable()) {
                $form.append(makeHighlightOption.call(this));
            }
        }, 

        reloadConfig: function() {
            this.renderConfig();
            this.setRefresh();
        }, 

        renderContent: function( el, data ) {
            try {
                this.extProps.onSuccess( el, data );
            } catch(e) {
                callErrorAfterRender.call(this, el, e);
            }
        }, 

        renderError: function( el, error ) {
            self.extProps.onError( el, error );
        }, 

        afterMoved: function(newBoxNumber, layout) {
            return this.extProps.onMoved( this.getContentContainer().get(0), newBoxNumber, layout );
        }, 

        serializeForm: function() {
            var formData = utils.serializeForm( this.$el.find('.gadget-options-form') );
            // 에디터 데이터는 따로 추출한다.
            $.extend( true, formData, this.getEditorData() );

            return formData;
        }, 

        validateForm: function( formData ) {
            return this.extProps.validate( this.$el.find('.gadget-options-form').get(0), formData );
        }, 

        // 가젯 컨텐츠 요청 함수
        // 페이징 처리된 가젯 컨텐츠에서 페이지 변경 등의 작업에는 반드시 this.request 객체를 이용하여 수행해야 함.
        requestContent: function() {
            var deferred = $.Deferred(), 
                extProps = this.extProps, 
                el = this.getContentContainer().get(0), 
                reqUrl;
            var ajaxOpts = {
                type: "GET", 
                statusCode: {
                    // 401 요청이 와도 가젯에서는 무시한다.(인하대 이슈 대응으로 처리)
                    "401": function() {}
                }, 
                beforeSend: function(xhr) {
                	xhr.setRequestHeader('TimeZoneOffset', -(new Date().getTimezoneOffset()));
                    deferred.notifyWith( this, [el] );
                }
            };

            if(typeof extProps.url === 'function') {
                reqUrl = extProps.url.call(extProps);
            	
			if (isPromise.call(this, reqUrl)) {
                	reqUrl.done($.proxy(function(url) {
                		ajaxCall.call(this, url);
                	}, this));
                	
                	return deferred;
                }
            } else {
                reqUrl = extProps.url;
            }

            // url이 정의되어 있으면 컨텐츠 요청한다.
            if(reqUrl) {
            	ajaxCall.call(this, reqUrl);
            } else {
                deferred.notifyWith( this, [el] );
                deferred.resolveWith(this, [el, {}]);
            }
            
            function ajaxCall(url) {
            	$.ajax( url, ajaxOpts ).done(function( data, resp, xhr ) {
                    deferred.resolveWith(this, [el, data]);
                }).fail(function( xhr, resp, error ) {
                    deferred.rejectWith(this, [el, resp]);
                });
            };

            return deferred;
        }, 

        delegateEvents: function() {
            var context = this.extProps, 
                $el = this.getContentContainer();

            $.each(this.extProps.events, function( key, callback ) {
                var args = [], 
                    func = callback;

                if(utils.isString(func)) {
                    func = context[func];
                }

                if(key.search(/\s+/) > 0) {
                    var index = key.search( /\s+/ ), 
                        etype = key.slice( 0, index ), 
                        selector = key.slice( index + 1 );

                    args.push( etype, selector );
                } else {
                    args.push( key );
                }
                args.push( $.proxy(func || function() {}, context) );

                $.fn.on.apply( $el, args );
            });
        }
    };
    
    function isPromise(value) {
    	if (!value || typeof value.then !== "function") {
    		return false;
	    }
	    var promiseThenSrc = String($.Deferred().then);
	    var valueThenSrc = String(value.then);
	    
	    return promiseThenSrc === valueThenSrc;
    }

    function syncPredefinedOptions() {
        if(!this.extProps.options.hasOwnProperty('editable')) {
            delete this.options['editable'];
        }

        if(!this.extProps.options.hasOwnProperty('removable')) {
            delete this.options['removable'];
        }

        if(!this.extProps.options.hasOwnProperty('highlight')) {
            delete this.options['highlight'];
        }
    }

    function callErrorAfterRender(el, error) {
        console.warn('[:::Gadget errors:::] : Caused by...');
        console.log(error['stack'] ? error['stack'] : error.message);
        return this.extProps.onError(el, error);
    }

    function isSelectableBox(el) {
        return el.is(":checkbox") || el.is(":radio");
    }

    function addStyleProps( styleEl, props ) {
        if(styleEl.styleSheet) {
            styleEl.styleSheet.cssText += props;
        } else {
            styleEl.appendChild(document.createTextNode(props));
        }
    }

    function makeRefreshOption() {
        var labels = [ 
                this.langs.refresh["none"],
                GO.gadget.i18n.parse(this.langs.refresh["unit_minute"], { "time": 1 }),
                GO.gadget.i18n.parse(this.langs.refresh["unit_minute"], { "time": 5 }),
                GO.gadget.i18n.parse(this.langs.refresh["unit_minute"], { "time": 10 }),
                GO.gadget.i18n.parse(this.langs.refresh["unit_minute"], { "time": 15 }), 
                GO.gadget.i18n.parse(this.langs.refresh["unit_minute"], { "time": 30 }), 
                GO.gadget.i18n.parse(this.langs.refresh["unit_hour"], { "time": 1 }), 
                GO.gadget.i18n.parse(this.langs.refresh["unit_hour"], { "time": 2 })
            ], 
            el;
        
        el = $(makeOptionUlElement(this.langs.refresh["label"]))
                .find('li:first')
                .append(GO.gadget.dom.select({ "name": "refresh", "value": "-1|1|5|10|15|30|60|120", "labels": labels.join('|'), defaultValue: "-1" }))
                .end();

        return el;
    }

    function makePersonalizeOption() {
        var $el = $(makeOptionUlElement(this.langs.personalize["label"])), 
            cbEditable = GO.gadget.dom.checkbox({ "name": "editable", "value": "Y", "checked": this.options.editable || false}), 
            cbRemovable = GO.gadget.dom.checkbox({ "name": "removable", "value": "Y", "checked": this.options.removable || false});

        $el.find('li:first')
            .append(addCheckboxLabel(cbEditable, this.langs.personalize['editable']))
            .append(addCheckboxLabel(cbRemovable, this.langs.personalize['removable']));

        return $el;
    }

    function makeHighlightOption() {
        var $el = $(makeOptionUlElement(this.langs.highlight["label"])), 
            checkbox = GO.gadget.dom.checkbox({ "name": "highlight", "value": "Y", "checked": this.options.highlight || false});

        $el.find('li:first')
            .append(addCheckboxLabel(checkbox, this.langs.highlight['highlight']));

        return $el;
    }

    function addCheckboxLabel($el, text) {
        var $wrap = $('<span class="wrap_option wrap_label"></span>');
        $wrap.append($el, '<label for="'+$el.attr('id')+'">'+text+'</label>');

        return $wrap;
    }

    function makeOptionUlElement(title) {
        var html = [];

        html.push('<ul class="static_style">');
            html.push('<li>');
                html.push('<p class="title">' + title + '</p>');
            html.push('</li>');
        html.push('</ul>');

        return html.join("\n");
    }
	
    //@deprecated
    // makeGadgetContentLoadError를 사용하세요
	function makeErrorPage(msg) {
        var html = [];
    
        html.push('<ul class="type_simple_list">');
            html.push('<li class="null_data">');
                html.push('<span class="ic_data_type ic_error_page"></span>');
                html.push('<p class="desc">' + msg + '</p>');
            html.push('</li>');
        html.push('</ul>');
        
        return html.join("\n");
	}

    function makeGadgetContentLoadError() {
        var html = [];
        
        html.push('<div class="gadget_design_wrap">');
        
        html.push('<div class="go_gadget_header">')
            html.push('<div class="gadget_h1">');
                html.push('<span class="title">'+ this.getTitle() +'</span>');
            html.push('</div>');
        html.push('</div>');
        
        html.push('<ul class="type_simple_list">');
            html.push('<li class="null_data">');
                html.push('<span class="ic_data_type ic_error_page"></span>');
                html.push('<p class="desc">' + this.langs.msg["load_error"] + '</p>');
            html.push('</li>');
        html.push('</ul>');
        
        html.push('</div>');
        
        return html.join("\n");
    }

    return GadgetContentProvider;

})();


})( jQuery, window, document );