(function (root, $) {

    var EDITOR_WIDTH = "100%";
    var EDITOR_MIN_HEIGHT = 300;
    var EDITOR_HEIGHT = 400;
    var defaultContextRoot = GO.contextRoot || '/';
    var TO_STANDARD_LOCALE = { // ko, en, ja, zh_CN, zh_TW 로 변환. 케이스가 더 있다면 추가 하면 됨.
        'ko': 'ko', 'en': 'en', 'ja': 'ja',
        'jp': 'ja', 'cn': 'zh_CN', 'tw': 'zh_TW', // 메일
        'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', // DO
        'zh_CN': 'zh_CN', 'zh_TW': 'zh_TW', 'vi' : 'vi',
        'zh': 'zh_CN'
    };
    var TO_DEXT_LOCALE = { // ko-kr, en-us, ja-jp, zh-cn, zh-tw 로 변환. 케이스가 더 있다면 추가 하면 됨.
        'ko': 'ko-kr', 'en': 'en-us', 'ja': 'ja-jp',
        'jp': 'ja-jp', 'cn': 'zh-cn', 'tw': 'zh-tw', // 메일
        'zh-cn': 'zh-cn', 'zh-tw': 'zh-tw', // DO
        'zh_CN': 'zh-cn', 'zh_TW': 'zh-tw', 'vi' : 'vi'
    };
    var instanceType = GO.instanceType || 'mail';
    var isMsie = (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (navigator.userAgent.toLowerCase().indexOf("msie") != -1);
    var UPLOAD_HANDLER = {
        app: isMsie ? 'api/dextUpload/file' : 'api/dextUpload',
        admin: isMsie ? 'ad/api/dextUpload/file' : 'ad/api/dextUpload',
        mail: 'api/mail/image/upload'
    };
    $.getJSON(defaultContextRoot + "resources/js/conf/editor/editor.config.json", function (data) {
        EDITOR_HEIGHT = data['config'].height;
    }).fail(function () {
        console.warn('height 설정이 없습니다.');
    });

    GO.Editor.registry('Dext5Editor', {
        type: GO.Editor.TYPE_DEXT5,
        contentSetter: setBodyValue,
        contentGetter: getBodyValue,

        defaults: function () {
            return {
                contextRoot: defaultContextRoot,
                onLoad: function () {
                },
                onUnload: function () {
                },
                content: ''
            }
        },

        oEditor: null,

        initialize: function (ctx, options) {
            this.checkCount = 0;
            this.__super__.initialize.call(this, ctx, options);
            this.isFormEditor = options.isFormEditor;
            this.basePath = [location.protocol, '//', location.hostname, location.port ? ':' + location.port : '', this.options.contextRoot].join('');
        },

        /**
         * Dext5 에디터는 ghost element 에 대한 개념이 없는 것으로 보인다.
         * ghost element 에 에디터를 그릴경우 에디터가 body 를 잠식하는 버그가 있다.
         * ghost 상태가 해제될때 까지 기다리자.
         */
        render: function () {
            if (this.$el.parents('body').length) {
                var elHeight = this.$el.outerHeight(); // wrapper 의 height 를 미리 caching
                this.$el.css('height', ''); // wrapper 의 height 속성 제거. dext5 에디터는 wrapper 에 height 가 있는 경우 resize 시 동적으로 height 를 조절하지 못한다.
                if (this.$el.is('textarea')) { // dext 5는 textarea placeholder 로 지원하지 않음. DO 에선 메일이 textarea를 placeholder 로 사용중.
                    var $div = $('<div></div>');
                    _.each(this.$el.prop('attributes'), function (key) {
                        $div.attr(key.name, key.value);
                    });
                    this.$el.attr('id', '');
                    this.$el.after($div);
                    this.$el.hide();
                    $div.show();
                }
                
                var standardLocale = TO_STANDARD_LOCALE[this.options.lang] || this.options.lang || 'ko';
                DEXT5.config.InitXml = this.basePath + (instanceType === 'admin' ? 'ad/' : '') + 'api/dextconfig/' + standardLocale + (this.options.useImage !== false ? '' : '?image=false');
                DEXT5.config.EditorHolder = this.idAttr;
                DEXT5.config.Width = this.options.width || EDITOR_WIDTH;
                DEXT5.config.Lang = TO_DEXT_LOCALE[this.options.lang];
                DEXT5.config.RootPath = [this.basePath, 'resources/js/vendors/dext5editor/'].join('');
                DEXT5.config.HandlerUrl = this.options.contextRoot + UPLOAD_HANDLER[instanceType];

                DEXT5.config.UseRecentlyFont = "1";
                var dextRecentlyFont = localStorage.getItem('dextRecentlyFont');
                if(dextRecentlyFont){
                    DEXT5.config.DefaultFontFamily = dextRecentlyFont.split(',')[0];
                }

                /**
                 * GO-23856 Dext5 에디터에서 편집중 Ctrl + S 키로 저장을 누룰 때 에러페이지로 이동하는 현상 방지하기 위해 SAVE 기능 제거
                 */
                var removeItem = 'save';
                if(GO.util.isMobile()){
                    removeItem = 'save,separator,table_insert,insert_row_down,delete_column,insert_column_right,table_delete,merge_cell,' +
                        'split_cell,table_same_width,table_same_height,cell_bg_color,c_inline_image,c_inline_html,formatting,font_family,' +
                        'font_size,line_height,superscript,subscript,remove_format,remove_css';
                }
                DEXT5.config.RemoveItem = removeItem;

                DEXT5.config.UserCssUrl = [this.basePath, 'resources/css/fonts/fonts_asset.css'].join('');
                if (instanceType === 'mail') DEXT5.config.ImageCustomPropertyDelimiter = '0';
                /**
                 * dext5 에서는 wrapper dom 의 동적 height 변화에 따른 처리가 되어 있지 않기 때문에
                 * 이러한 경우 height 를 직접 넘겨 줘야 한다.
                 * @type {*|string}
                 */
                DEXT5.config.Height = this.options.height || (elHeight < EDITOR_MIN_HEIGHT ? EDITOR_HEIGHT + 'px' : elHeight + 'px');
                DEXT5.config.InitFocus = '0'; // 에디터가 화면 하단 보이지 않는 부분에 있는 경우, 그곳 까지 자동으로 스크롤되는 현상에 대한 업체측 대응.

                this._bindEvents();

                new Dext5editor(this.idAttr);
            } else {
                var timer = setTimeout($.proxy(function () {
                    console.log(this.$el.parents('body').length);
                    if (this.checkCount >= 20) {
                        clearTimeout(timer);
                        return;
                    }
                    this.checkCount++;
                    this.render();
                }, this), 200);
            }
        },

        /**
         * 에디터 자체 이슈. firefox bug 대응.
         * iframe 에 정의되어 있는 CSS가 적용이 되지 않는 현상이 있다.
         * href 속성을 touch 하여 브라우저가 다시 적용 할 수 있도록 해주자.
         */
        _fixFireFox: function () {
            var bodyElement = DEXT5.getDext5BodyDom(this.idAttr);
            var docEditorCSS = _.filter($(bodyElement).siblings().find('link'), function (link) {
                return link.href.indexOf('doc_editor.css') > -1;
            })[0];
            setTimeout(_.bind(function () {
                if (docEditorCSS) docEditorCSS.href = this.options.contextRoot + 'resources/css/doc_editor.css';
            }, this), 100);
        },

        _bindEvents: function () {
            if (!window.dext_editor_loaded_event) {
                window.dext_editor_loaded_event = $.proxy(function (dextEditor) {
                    var editor = GO.Editor.getInstance(dextEditor.ID);
                    editor.oEditor = editor;
                    editor.setContent(editor.options.content);
                    editor.options.onLoad();

                    if (this.isFormEditor) {
                        DEXT5.addUserCssUrl(this.basePath + 'resources/css/doc_editor.css', this.idAttr);
                        var bodyElement = DEXT5.getDext5BodyDom(dextEditor.ID);
                        bodyElement.setAttribute('id', 'dext_body');
                        bodyElement.ondragstart = function () {
                            return false;
                        };
                        bodyElement.ondrop = function () {
                            return false;
                        };
                    }
                    //this.$el.trigger('loaded');
                    $(window).trigger('dext_editor_loaded');

                    if ($.browser.mozilla && this.isFormEditor) {
                        this._fixFireFox();
                    }
                }, this);
            }
            /**
             * dext_editor_afterchangemode_event
             * 메뉴얼에 없는 이벤트.
             * 에디터 코어 소스에서 찾아서 사용중이다.
             * 해당 이벤트가 없어졌다면 다시 넣어 달라고 요청해야 한다.
             * 탭 전환을 못하게 막아도 된다.
             */
            if (!window.dext_editor_afterchangemode_event && this.isFormEditor) {
                window.dext_editor_afterchangemode_event = $.proxy(function (beforeMode, afterMode, editorId) {
                    var editor = GO.Editor.getInstance(editorId);
                    editor._bindDbClickEvent(editorId);
                    if (afterMode === 'source') {
                        $(window).trigger('dext_editor_afterchangemode_event', arguments);
                        if ($.browser.mozilla) this._fixFireFox();
                    }
                }, this)
            }

            if (!window.dext_editor_custom_action) {
                window.dext_editor_custom_action = $.proxy(function (command, editorId) {
                    if (command == 'c_inline_image') {
                        window.inlineImgUploadLayer(editorId);
                    }
                    if (command == 'c_inline_html') {
                        if (GO.util.isIE8() || GO.util.isIE9()) {
                            alert('지원하지 않는 브라우저입니다.');
                            return;
                        }
                        var fileReader = $('#dextFileReader');
                        if (!fileReader.length) {
                            fileReader = $('<input id="fileReader" style="display: none;" type="file">');
                            $('body').append(fileReader);
                            fileReader.on('change', function(e) {
                                var file = e.target.files[0];
                                if (!file) return;
                                if (file.type !== 'text/html') {
                                    alert('html 파일만 가능합니다.');
                                    return;
                                }
                                if (file.size / 1024 > 512) {
                                    alert('512 KB 이하 파일만 가능합니다.');
                                    return;
                                }
                                var reader = new FileReader();
                                reader.onload = function(e) {
                                    var contents = e.target.result;
                                    var editor = GO.Editor.getInstance(editorId);
                                    editor.setContent(contents);
                                };
                                reader.readAsText(file);
                            });
                        }
                        fileReader.trigger('click');
                    }
                }, this);
            }
        },

        /**
         * 양식 편집기용 컴포넌트 편집 이벤트. 탭이 전환되면 동작하지 않는다.
         */
        _bindDbClickEvent: function (idAttr) {
            var dextDom = DEXT5.getDext5Dom(idAttr);
            DEXT5.util.addEvent(dextDom, 'click', _.bind(function (e) {
                this.$el.trigger('clickEditorContent', e);
                if (e.stopPropagation) e.stopPropagation(); // ie8 에서는 event 객체가 dext 에서 임의 생성한 객체이다.
            }, this));
            DEXT5.util.addEvent(dextDom, 'keypress', _.bind(function (e) {
                console.log('keypress');
                this.$el.trigger('keypressEditorContent', e);
                if (e.stopPropagation) e.stopPropagation(); // ie8 에서는 event 객체가 dext 에서 임의 생성한 객체이다.
            }, this));
        },

        validate: function () {
            return encodeURIComponent(DEXT5.getBodyValue(this.idAttr)).length < 1024 * 1024 * 15;
        },

        getHTMLContent: function () {
            return this.getContent();
        },

        getContent: function () {
            return DEXT5.getBodyValue(this.idAttr);
        },

        getDocument: function () {
            return DEXT5.getDext5Dom(this.idAttr);
        },

        setContent: function (content, isAppend) {
            if (isAppend) {
                DEXT5.setInsertHTML(content, this.idAttr);
            } else {
                DEXT5.setBodyValue(content, this.idAttr);
                if (this.isFormEditor) this._bindDbClickEvent(this.idAttr);
            }
        },

        setHeight: function (height) {
            DEXT5.config.Height = height;
        },

        destroy: function () {
            if ($(this.ctx).parents('body').length) {
                if (DEXT5) DEXT5.destroy(this.idAttr);
            }
        },

        isAccessible: function () {
            return DEXT5.getEditor(this.idAttr)._currentMode !== 'source';
        },
    });

    function setBodyValue(content, isAppend) {
        if (isAppend) {
            this.oEditor.setContent(getBodyValue.call(this) + content);
        } else {
            this.oEditor.setContent(content);
        }
    }

    function getBodyValue() {
        return this.oEditor ? this.oEditor.getContent() : "";
    }
})(this, jQuery);
