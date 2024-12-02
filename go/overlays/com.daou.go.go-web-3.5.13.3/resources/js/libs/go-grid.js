/**
 * @version    0.0.1
 * @require     jQuery, data-tables, go-style.css
 * TODO - 옵션 정리 , 가이드 문서 작성
 */
(function ($) {

    var GG = $.goGrid = function () {
            return GG.render(arguments[0]);
        },
        searchMinLength = 2,
        searchMaxLength = 64;

    $.extend(GG, {
        version: '0.0.1',
        lang: {},
        defaults: {
            lengthMenu: [20, 40, 60, 80],//[ 15, 30, 50 ],
            adminLengthMenu: [20, 40, 60, 80],
            numbersShowPages: 10,
            sAjaxDataProp: 'data',
            sAjaxRecordTotalProp: 'page.total',
            emptyMessage: 'null',
            defaultSorting: [['4', 'desc']],
            method: 'GET',
            checkbox: false,
            sDom: '<"tool_bar"<"critical custom_header">l>rt<"tool_bar tool_absolute"<"critical custom_bottom">lp>',//tool_absolute
            sDomType: {
                none: 'rt',
                admin: '<"toolbar_top header_tb"<"critical custom_header">l>rt<"tool_bar"<"critical custom_bottom">lp>'
            },
            sDomSelectFalse: '<"tool_bar"<"critical custom_header">>rt<"tool_bar"<"critical custom_bottom">p>',
            defaultLocale: 'ko',
            lang: {
                'ko': {
                    '검색어를 입력하세요.': '검색어를 입력하세요.',
                    "0자이상 0이하 입력해야합니다.": searchMinLength + "자 이상, " + searchMaxLength + "자 이하를 입력해야합니다.",
                    '맨앞': '맨앞',
                    '맨뒤': '맨뒤',
                    '다음': '다음',
                    '이전': '이전',
                    '검색결과가 없습니다.': '검색결과가 없습니다.'
                },
                'ja': {
                    "검색어를 입력하세요.": "検索語を入力してください。",
                    "0자이상 0이하 입력해야합니다.": searchMinLength + "文字以上、 " + searchMaxLength + "文字以下で入力してください。",
                    "맨앞": "最前",
                    "맨뒤": "最後",
                    "다음": "次へ",
                    "이전": "前へ",
                    "검색결과가 없습니다.": "検索結果がありません。"
                },
                'en': {
                    "검색어를 입력하세요.": "Please enter a keyword.",
                    "0자이상 0이하 입력해야합니다.": "You have to enter " + searchMinLength + " character(s) or more and " + searchMaxLength + " character(s) or below.",
                    "맨앞": "First",
                    "맨뒤": "Last",
                    "다음": "Newer",
                    "이전": "Older",
                    "검색결과가 없습니다.": "No search result."
                },
                'zh_CN': {
                    "검색어를 입력하세요.": "请输入搜索词语。",
                    "0자이상 0이하 입력해야합니다.": "请输入" + searchMinLength + "以上、" + searchMaxLength + "以下的字符。",
                    "맨앞": "最前",
                    "맨뒤": "最后",
                    "다음": "下一页",
                    "이전": "前一页",
                    "검색결과가 없습니다.": "没有搜索结果"
                },
                'zh_TW': {
                    "검색어를 입력하세요.": "請輸入搜索詞語。",
                    "0자이상 0이하 입력해야합니다.": "請輸入" + searchMinLength + "以上、" + searchMaxLength + "以下的字符。",
                    "맨앞": "最前",
                    "맨뒤": "最後",
                    "다음": "下一頁",
                    "이전": "前一頁",
                    "검색결과가 없습니다.": "沒有搜索結果"
                },
                'vi': {
                    "검색어를 입력하세요.": "Hãy nhập từ khóa tìm kiếm.",
                    "0자이상 0이하 입력해야합니다.": "Phải nhập trên " + searchMinLength + " ký tự, dưới " + searchMaxLength + " ký tự.",
                    "맨앞": "Trước tiên",
                    "맨뒤": "Cuối cùng",
                    "다음": "Tiếp theo",
                    "이전": "Trang trước",
                    "검색결과가 없습니다.": "Không có Kết quả tìm kiếm."
                }
            }
        },

        render: function (options) {
            var self = this,
                options = options || {},
                tables = null,
                aoParams = {},
                sortkey = null,
                sortdir = null,
                dataTableOptions = {};

            if (!options.url || !options.columns || !options.el || !$(options.el).length) return;

            options.locale = options.locale || $('meta[name="locale"]').attr('content');
            this.lang = this.defaults.lang.hasOwnProperty(options.locale) ? this.defaults.lang[options.locale] : this.defaults.lang[this.defaults.defaultLocale];

            options.create = true;
            options.params = options.params || {};
            options.lengthMenu = options.lengthMenu || (options.sDomType == 'admin' ? this.defaults.adminLengthMenu : this.defaults.lengthMenu);
            options.displayLength = options.displayLength || options.lengthMenu[0];
            if (options.params.hasOwnProperty('offset')) options.displayLength = Number(options.params['offset'] || options.displayLength);
            options.method = options.method || this.defaults.method;
            options.pageUse = options.hasOwnProperty('pageUse') ? options.pageUse : true;
            options.numbersShowPages = Number(options.numbersShowPages || this.defaults.numbersShowPages);
            options.sAjaxDataProp = options.sAjaxDataProp || this.defaults.sAjaxDataProp;
            options.sAjaxRecordTotalProp = options.sAjaxRecordTotalProp || this.defaults.sAjaxRecordTotalProp;
            options.emptyMessage = options.emptyMessage || this.defaults.emptyMessage;
            options.defaultSorting = options.defaultSorting || this.defaults.defaultSorting;
            options.checkbox = options.hasOwnProperty('checkbox') ? options.checkbox : this.defaults.checkbox;
            options.displayLengthSelect = options.hasOwnProperty('displayLengthSelect') ? options.displayLengthSelect : true;
            options.fnDrawCallback = options.fnDrawCallback || null;
            options.fnPreDrawCallback = options.fnPreDrawCallback || null;
            options.bDestroy = options.bDestroy || false;
            options.resize = options.resize == false ? false : true;

            //ajax success callback
            options.fnServerSuccess = options.fnServerSuccess || null;
            //ajax error callback
            options.fnServerError = options.fnServerError || null;


            if (options.hasOwnProperty('sDomUse') && !options.sDomUse) {
                options.sDom = this.defaults.sDomType.none;
            } else {
                if (options.hasOwnProperty('sDom')) {
                    options.sDom = options.sDom;
                } else {
                    if (this.defaults.sDomType[options.sDomType]) {
                        options.sDom = this.defaults.sDomType[options.sDomType];
                    } else {
                        if (options.displayLengthSelect) {
                            options.sDom = this.defaults.sDom;
                        } else {
                            options.sDom = this.defaults.sDomSelectFalse;
                        }
                    }
                }
            }
            // lengthMenu 가 중복으로 생성됨.
//            if($.inArray(options.displayLength, options.lengthMenu) == -1 && options.displayLength != 999) options.lengthMenu.unshift(options.displayLength);

            GG.initDataTables(options);

            if (options.checkbox && options.checkboxData) {
                if (!$(options.el).find('thead input[type="checkbox"]').length) {
                    $(options.el).find('thead tr').prepend('<th><input type="checkbox" id="checkedAll" /></th>');
                }
                options.columns.unshift({
                    "mData": null, "sWidth": "35px", "bSortable": false, fnRender: function (obj) {
                        //id가 없을경우 타입 설정
                        var value = obj.aData[options.checkboxData];
                        if (_.isUndefined(value)) {
                            value = obj.aData[options.folderType];
                        }
                        var tpl = '<input name="' + options.checkboxData + '" type="checkbox" value="' + value + '" data-row="' + obj.iDataRow + '" ';
                        tpl += options.type == 'bbs' ? " data-root='" + obj.aData.root + "'" : "";
                        tpl += '  />';
                        return tpl;
                    }
                });
            }

            dataTableOptions = {
                "sAjaxSource": options.url,
                "fnServerData": function (url, aoData, callback) {
                    var _this = this,
                        iDisplayLength = null,
                        iDisplayStart = null,
                        setPage = options.params.page || 0;
                    emptyMessage = options.emptyMessage,
                        searchDateEl = $('#searchDate');

                    $(aoData).each(function (k, v) {
                        switch (v.name) {
						    case "iDisplayLength" : iDisplayLength = v.value; break;
						    case "iDisplayStart" : iDisplayStart = v.value; break;
						    case "iSortCol_0" : sortkey = (options.columns[v.value].sortKey || options.columns[v.value].mData); break; 
						    case "sSortDir_0" : sortdir = v.value; break;
                            case "sEcho" :
                                if (setPage) {
                                    v.value = parseInt(Number(setPage) + 1, 10);
                                }
                                break;
						    default : break;
                        }
                    });

                    if (setPage && options.create) {
                        iDisplayStart = iDisplayLength * setPage;
                    }
                    if (options.params) {
                        aoParams = $.extend(aoParams, options.params);
                    }

                    aoParams = $.extend(aoParams, {
                        'offset': iDisplayLength,
                        'page': iDisplayStart > 0 ? parseInt(iDisplayStart / iDisplayLength, 10) : 0
                    });

                    if (this.customParams) {
                        aoParams = $.extend(aoParams, this.customParams);
                    }
                    // grid 정렬
                    if (options.type == 'bbs') {
                        aoParams['sorts'] = ['threadRootCode desc', 'threadCode asc'];
                    }
                    if (!options.params['property'] || sortkey) {
                        aoParams = $.extend(aoParams, {
                            'property': sortkey,
                            'direction': sortdir
                        });
                    }
                    if (aoParams['keyword'] || aoParams['nameKeyword']) {
                        emptyMessage = '<p class="data_null">' + self.lang['검색결과가 없습니다.'] + '</p>';//"'+aoParams['keyword']+'"에 대한
                    }

                    this.fnSettings().oLanguage.sEmptyTable = emptyMessage;
                    $.go(url, aoParams, {
                        qryType: options.method,
                        async: true,
                        responseFn: function (jqXHR) {
                            if (jqXHR.data.length == 0 && jqXHR.page && jqXHR.page.page != 0) {
                                aoParams.page = aoParams.page - 1;
                                _this.setParam("page", aoParams.page);
                                return;
                            }

                            if (typeof options.fnServerSuccess == 'function') options.fnServerSuccess(jqXHR);
                            callback(jqXHR);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (typeof options.fnServerError == 'function') options.fnServerError(jqXHR);
                            _this.fnSettings().jqXHR = jqXHR;
                            _this.fnSettings().response.statusText = textStatus;
                            self._fnProcessingHide();


                        }
                    });
                },
                "fnPreDrawCallback": function (oSettings) {
                    if (typeof options.fnPreDrawCallback == 'function') options.fnPreDrawCallback(oSettings);
                },
                "fnDrawCallback": function (oSettings) {
                    this.find("th input[type='checkbox']").attr("checked", false);

                    setTimeout(self._fnProcessingHide, 100);

                    $('table.dataTable').css('margin-bottom', 0);
                    $('.dataTables_paginate a').attr('data-bypass', true);
                    if (options.create && options.params.page) {
                        options.create = false;
                        var newDisplayStart = options.params.page * oSettings._iDisplayLength;
                        if (oSettings._iDisplayStart != newDisplayStart) {
                            oSettings._iDisplayStart = newDisplayStart;
                            // Redraw table
                            $(oSettings.oInstance).trigger('page', oSettings);
                            oSettings.oApi._fnCalculateEnd(oSettings);
                            oSettings.oApi._fnDraw(oSettings);
                        }
                    }

                    if (typeof options.fnDrawCallback == 'function') options.fnDrawCallback(this, oSettings, aoParams);
                    if (options.checkbox) {
                        $(options.el).find('tbody tr>td:first-child').addClass('align_c');
                    }
                },
                "bProcessing": options.bProcessing == false ? false : true,
                "bDestroy": options.bDestroy,
                "sAjaxDataProp": options.sAjaxDataProp,
                "sAjaxRecordTotalProp": options.sAjaxRecordTotalProp,
                "sAjaxRecordDisplayProp": options.sAjaxRecordTotalProp,
                "sPaginationType": "full_numbers",
                //"sDom": '<"test"<"custom_buttons">T"test2"l><"clear">rt<<"custom_buttons">Tl<"clear">p><"clear">',
                "sDom": options.sDom,
                "oTableTools": {
                    "sSwfPath": "/resources/js/ext-lib/theme/swf/copy_csv_xls_pdf.swf",
                    "aButtons": [
                        {
                            "sExtends": "print",
                            "sButtonClass": "btn_print"
                        }
                    ]
                },
                "aaSorting": options.defaultSorting,
                "aoColumns": options.columns,
                "oLanguage": {
                    "sEmptyTable": options.emptyMessage,
                    "sZeroRecords": options.emptyMessage
                }
            };

            if (options.maxHeight) dataTableOptions.sScrollY = options.maxHeight;

            tables = $(options.el).dataTable(dataTableOptions);

            // 정체 불명의 코드. resize 를 false 로 주면 타지 않도록 한다.
            if (options.maxHeight && options.resize) {
                $(window).unbind('resize.grid').bind('resize.grid', function () {
                    try {
                        if (tables && $(tables.selector).length) {
                            var bAjaxDataGet = tables.fnSettings().bAjaxDataGet;
                            tables.fnSettings().bAjaxDataGet = false; // true - data를 새로 가져와서 다시 그림,  false - 그래드 테이블만 다시 그림
                            tables.fnAdjustColumnSizing();
                            tables.fnSettings().bAjaxDataGet = bAjaxDataGet;
                        } else {
                            $(window).unbind('resize.grid');
                        }
                	} catch(err) {}
                });
            } else {
                tables.css('width', '100%');
            }


            if (dataTableOptions.sScrollY) tables.parents('.dataTables_wrapper').find('.dataTables_scroll table').css('width', '100%');

            if (options.checkbox) {
                tables.getCheckedIds = function () {
                    if (!tables.parents('body').length) return []; // 인스턴스가 중복으로 생성되는 경우에 대한 방어코드.
                    return GG.getCheckedIds(tables);
                };

                var checkedAllEl = null;
                if (tables.parents('.dataTables_scroll').length) {
                    checkedAllEl = tables.parents('.dataTables_scroll').find('.dataTables_scrollHead #checkedAll');
                } else {
                    checkedAllEl = tables.find('#checkedAll');
                }
                checkedAllEl.click(function (e) {
                    GG.setCheckedAll(e, tables);
                });
            }

            tables.setParam = function (key, value) {
                tables.customParams = tables.customParams || {};
                tables.customParams[key] = value;
                tables.fnDraw(tables.fnSettings());
            };

            tables.setSearchParam = function (param) {
                tables.customParams = param || {};
                tables.fnDraw(tables.fnSettings());
            }

            tables.search = function (searchtype, keyword, keywordEl, validationCallback) {
                var keywordEl = keywordEl || null,
                    defaultValidationCallback = validationCallback || function () {
                        if (keywordEl && $.isFunction(keywordEl.focus)) {
                            keywordEl.trigger('focus');
                        }
                        return false;
                    };

                if (keywordEl && $.isFunction(keywordEl.focusout)) keywordEl.trigger('focusout').blur();

                if (keyword == "") {
                    $.goMessage(self.lang['검색어를 입력하세요.']);
                    defaultValidationCallback();
                    return false;
                } else {

                    if (keyword.length < searchMinLength || keyword.length > searchMaxLength) {
                        $.goMessage(self.lang['0자이상 0이하 입력해야합니다.']);
                        defaultValidationCallback();
                        return false;
                    } else {
                        tables.customParams = {
                            searchtype: searchtype,
                            keyword: keyword
                        };
                        tables.fnDraw(tables.fnSettings());
                        return true;
                    }
                }
            };
            tables.isEmpty = function () {
                if (tables.find('tbody .dataTables_empty').length) return true;
                return false;
            };
            tables.reload = function () {
                tables.fnClearTable();
            };

            tables.getCheckedElements = function () {
                return GG.getCheckedElements(tables);
            };
            tables.getCheckedData = function () {
                return GG.getCheckedData(tables);
            };
            var settings = tables.fnSettings() || {};
            return {
                tables: tables,
                listParams: aoParams,
                total: settings.hasOwnProperty('_iRecordsTotal') ? settings._iRecordsTotal : tables.find('tbody>tr').length
            };
        },
        _fnProcessingHide: function () {
            /*$('div.dataTables_processing').animate({
                'duration' : 500,
                'visibility' : 'hidden'
            })*/
            $('div.dataTables_processing').fadeOut(100, function () {
                $(this).css({'visibility': 'hidden', 'display': ''});
            });
        },
        setCheckedAll: function (e, tableEl) {
            var isChecked = $(e.currentTarget).is(':checked');
            tableEl.find('tbody input[type=checkbox]').not('[disabled]').attr('checked', isChecked);
        },
        getCheckedElements: function (instance) {
            return instance.$('tr').find('input[type=checkbox]:checked');
        },
        getCheckedData: function (instance) {
            var checkedListObj = this.getCheckedElements(instance),
                data = [];
            $(checkedListObj).each(function (i, obj) {
                data.push(instance.fnGetData($(obj).attr('data-row')));
            });
            return data;
        },
        getCheckedIds: function (instance) {
            var checkedListObj = this.getCheckedElements(instance);
            var checkedIds = $(checkedListObj).map(function (k, v) {
                return $(v).val();
            }).get();
            return checkedIds;
        },
        initDataTables: function (options) {
            $.extend($.fn.dataTable.defaults, {
                "aLengthMenu": options.lengthMenu,
                "bFilter": false,
                "bSort": true,
                "bProcessing": true,
                "bServerSide": true,
                "bPaginate": true,
                "bJQueryUI": false,
                "multipleSelection": false,
                "iDisplayLength": Number(options.displayLength),
                "sServerMethod": options.method,
                "sEmptyTable ": "",
                'bDestroy ': options.bDestroy
            });
            $.extend($.fn.dataTable.defaults.oLanguage, {
                "sLengthMenu": " _MENU_ ",
                "sZeroRecords": "NULL.",
                "sInfo": "",
                "sInfoEmpty": "sInfoEmpty",
                "sInfoFiltered": "",
                "sProcessing": 'Loading...',
                "oPaginate": {
                    "sFirst": this.lang["맨앞"],
                    "sLast": this.lang["맨뒤"],
                    "sNext": this.lang["다음"],
                    "sPrevious": this.lang["이전"]
                }
            });
            $.extend($.fn.dataTable.ext.oPagination, {
                "iFullNumbersShowPages": options.numbersShowPages
            });
        },
        _error: function () {
        }
    });

    $.goGrid.getCheckedIds = GG.getCheckedIds;

})(jQuery);
