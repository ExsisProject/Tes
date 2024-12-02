define("works/libs/util", [
        "jquery",
        "backbone",
        "when"
    ],

    function (
        $,
        Backbone,
        when
    ) {

        var STORE_PREFIX = GO.session("id");

        var WorksUtil;

        WorksUtil = {

            saveViewType: function (data) {
                var tabId = data.tabId;
                var arrangeType = data.arrangeType;
                GO.util.store.set(STORE_PREFIX + '-works-viewtype', {
                    tabId: tabId, arrangeType: arrangeType
                }, 'local');
            },

            getViewType: function () {
                return GO.util.store.get(STORE_PREFIX + '-works-viewtype') || {};
            },

            //필터 관련 storage
            saveFilterStorage: function (key, value) {
                GO.util.store.set(STORE_PREFIX + '-works-last-filter-id' + key, value, 'local');
            },

            getFilterStorage: function (key) {
                return GO.util.store.get(STORE_PREFIX + '-works-last-filter-id' + key) || null;
            },

            saveShowGuideLayer: function (value) {
                GO.util.store.set(STORE_PREFIX + '-works-showlayer-', value, 'local');
            },

            getShowGuideLayer: function () {
                return GO.util.store.get(STORE_PREFIX + '-works-showlayer-') || null;
            },

            createResponseError: function (status, statusText, responseText) {
                return {
                    "status": status,
                    "statusText": statusText,
                    "responseText": responseText || ''
                };
            },

            goCreateAppIntro: function () {
                GO.router.navigate('works/applet/create/intro', {"pushState": true, "trigger": true});
            },

            goSettingHome: function (appletId) { //관리홈
                GO.router.navigate('works/applet/' + appletId + '/settings/home', {"pushState": true, "trigger": true});
            },

            goAppHome: function (appletId) { //앱홈
                GO.router.navigate('works/applet/' + appletId + '/home', {"pushState": true, "trigger": true});
            },

            checkAppManager: function (admins) { //해당 앱의 관리자인지 체크
                var isAdmin = false;
                $.each(admins, function (i, k) {
                    if (k.id == GO.session('id')) {
                        isAdmin = true;
                    }
                });
                if (!isAdmin) {
                    GO.util.error('403', {"msgCode": '400-works'});
                }
            },
            goEditDoc: function (data) {
                var appletId = data.appletId;
                var subFormId = data.subFormId;
                var docId = data.docId;

                if (GO.util.isValidValue(subFormId)) {
                    GO.router.navigate('works/applet/' + appletId + '/doc/' + docId + '/edit/' + subFormId, {
                        "pushState": true,
                        "trigger": true
                    });
                } else {
                    GO.router.navigate('works/applet/' + appletId + '/doc/' + docId + '/edit', {
                        "pushState": true,
                        "trigger": true
                    });
                }
            },

            promiseAsync: function (url, options) {
                var topts = options || {};

                var defer = when.defer(),
                    self = this,
                    defaultOpts = {
                        type: "GET",
                        dataType: 'json',
                        contentType: "application/json",
                        success: function (resp) {
                            if (resp.hasOwnProperty('__go_checksum__')) {
                                defer.resolve(resp.data);
                            } else {
                                defer.reject(self.createResponseError(500, "Internal Server Error"));
                            }
                        },
                        error: function (xhr, statusText, error) {
                            defer.reject(error);
                        }
                    };

                if (topts.hasOwnProperty("data") && _.isObject(topts.data)) {
                    topts.data = JSON.stringify(topts.data);
                }

                $.ajax(url, _.extend({}, defaultOpts, topts));

                return defer.promise;
            },

            promiseModelSave: function (model, attrs) {
                var defer = when.defer();

                model.save(attrs, {
                    success: defer.resolve,
                    error: function (model, resp, options) {
                        defer.reject(resp);
                    }
                });

                return defer.promise;
            },

            promiseFetch: function (obj, options) {
                var defer = when.defer();

                if (obj instanceof Backbone.Model || obj instanceof Backbone.Collection) {
                    obj.fetch(_.extend({
                        success: defer.resolve,
                        error: function (model, resp, options) {
                            defer.reject(resp);
                        }
                    }, options || {}));
                } else {
                    defer.reject(this.createResponseError(400, "Bad Request"));
                }

                return defer.promise;
            },

            reqReorderList: function (url, ids) {
                return this.promiseAsync(url, {
                    type: 'PUT',
                    data: {"ids": ids}
                });
            },

            convertArrayToCollection: function (attrs, model) {
                var options;
                if (model) {
                    options = {model: model};
                }

                return new Backbone.Collection(attrs, options);
            },

            reorderList: function (orderableList, oldSeq, newSeq) {
                // 차이가 양수이면 up, 음수이면 down
                var direction = oldSeq - newSeq,
                    result = [];

                _.each(orderableList, function (item, i) {
                    var curSeq = 0;

                    if (!item.hasOwnProperty('seq')) {
                        return new Error('seq 속성을 가지고 있어야 합니다.');
                    }

                    curSeq = item.seq;

                    if (item.seq === oldSeq) {
                        item.seq = newSeq;
                    } else if (direction > 0 && newSeq <= curSeq && curSeq < oldSeq) {
                        item.seq = ++curSeq;
                    } else if (direction < 0 && oldSeq <= curSeq && curSeq < newSeq) {
                        item.seq = --curSeq;
                    }

                    result.push(item);
                });

                return _.sortBy(result, function (item) {
                    return item.seq;
                });
            },

            deepClone: function (obj) {
                return $.extend(true, {}, obj);
            },

            callFile: function (clientId, maxAttachSize, maxAttachNumber, excludeExtension) {
                try {
                    var attachSize = (maxAttachSize == undefined) ? -1 : maxAttachSize,
                        attachNumber = (maxAttachNumber == undefined) ? -1 : maxAttachNumber,
                        extension = (excludeExtension == undefined) ? "" : excludeExtension;
                    if (GO.util.checkOS() == "android") {
                        window.GOMobile.callFile('attachFileSuccess' + clientId, 'attachFileFail' + clientId, attachNumber, attachSize, extension);
                    }
                } catch (e) {

                }
            },

            callOrg: function (clientId, attendees) {
                try {
                    if (GO.util.checkOS() == "android") {
                        window.GOMobile.callOrg(JSON.stringify(attendees), 'addSuccess' + clientId, 'addFail' + clientId);
                    } else {
                        window.location = "gomobile://callOrg?" + JSON.stringify(attendees) + "&addSuccess" + clientId + "&addFail" + clientId;
                    }
                } catch (e) {
                }
            },

            callAlbum: function (clientId) {
                try {
                    if (GO.util.checkOS() == "android") {
                        window.GOMobile.callAlbum('attachFileSuccess' + clientId, 'attachFileFail' + clientId);
                    } else {
                        window.location = "gomobile://callAlbum?attachFileSuccess" + clientId + "&attachFileFail" + clientId;
                    }
                } catch (e) {
                }
            },

            callCamera: function (clientId) {
                try {
                    if (GO.util.checkOS() == "android") {
                        window.GOMobile.callCamera('attachFileSuccess' + clientId, 'attachFileFail' + clientId);
                    } else {
                        window.location = "gomobile://callCamera?attachFileSuccess" + clientId + "&attachFileFail" + clientId;
                    }
                } catch (e) {
                }
            },

            errorDescRemover: function (obj, view) {
                var targets = _.isArray(obj.targets) ? obj.targets : [];
                _.each(targets, function (target) {
                    if ($(target).hasClass('error')) {
                        $(target).removeClass('error');
                    }
                });
                view.$('.go_error').remove();
            },

            /**
             * Div 안에 iframe이 있는경우
             * 해당 영역에서 Css hover event가 정상 작동 하지 않는 이슈가 있어 추가
             */
            giveHoverEventAtIE: function (klass, wrapEl, divEl, iframeEl, target) {
                if (!!navigator.userAgent.match(/Trident\/7\./)) {
                    klass.$(wrapEl).on('mouseenter', divEl, function () {
                        $(this).addClass('hover');
                    });
                    klass.$(wrapEl).on('hover', iframeEl, function () {
                        $(this).parents(target).addClass('hover');
                    });
                    klass.$(wrapEl).on('mouseleave', divEl, function () {
                        $(this).removeClass('hover');
                    });
                }
            },

            isNumber: function (keyCode, extKeyCode) { //keycode를 받아서 문자를 입력하지 않도록 한다. 주로 폼빌더 속성창에서 쓰임.
                var supplement = extKeyCode || [];
                if (!_.isArray(supplement)) {
                    _.toArray(supplement)
                }
                var EXCEPTED_KEY_CODE = [
                    8, //backspace
                    35, // end
                    36, // home
                    37, // left
                    38, // up
                    39 // right
                ];
                EXCEPTED_KEY_CODE = _.union(EXCEPTED_KEY_CODE, supplement);

                return ((keyCode >= 48) && (keyCode <= 57)) || _.contains(EXCEPTED_KEY_CODE, keyCode)
            },

            isTimeFormat: function (time) {
                if (!time) return true;

                var pattern = /[^(0-9)]/gi;
                time = time.replace(pattern, "");
                time = time.substr(0, 4);
                var first = time.substr(0, 1);

                if (parseInt(first) > 2) time = "0" + time.substr(0, 3);

                var parsedTime = time;
                var firstHalf = parsedTime.substr(0, 2);
                var secondHalf = parsedTime.substr(2, 2);

                return parseInt(firstHalf) <= 23 && parseInt(firstHalf) >= 0 && parseInt(secondHalf) <= 59 && parseInt(secondHalf) >= 0;
            },

            parseTime: function (time) {
                if (!time) return "";

                var pattern = /[^(0-9)]/gi;
                time = time.replace(pattern, "");
                time = time.substr(0, 4);
                var first = time.substr(0, 1);

                if (parseInt(first) > 2) time = "0" + time.substr(0, 3);

                var parsedTime = time;
                var firstHalf = parsedTime.substr(0, 2);
                var secondHalf = parsedTime.substr(2, 2);

                if (secondHalf.length == 0) secondHalf = "00";
                if (secondHalf.length == 1) secondHalf = "0" + secondHalf;

                var isValid = parseInt(firstHalf) <= 23 && parseInt(firstHalf) >= 0 && parseInt(secondHalf) <= 59 && parseInt(secondHalf) >= 0;

                if (isValid) {
                    parsedTime = firstHalf + ":" + secondHalf;
                } else {
                    parsedTime = GO.util.hourMinute();
                }

                return parsedTime;
            },

            getSavedBasedate: function (appletId) {
                return GO.util.store.get(STORE_PREFIX + '-works-' + appletId + '-calendar-basedate') || GO.util.now().format("YYYY-MM-DD");
            },

            getSavedSelectedPeriod: function (appletId) {
                return GO.util.store.get(STORE_PREFIX + '-works-' + appletId + '-calendar-selectedperiod');
            },

            saveCalendarType: function (appletId, type) {
                return GO.util.store.set(STORE_PREFIX + '-works-' + appletId + '-calendar-viewtype', type);
            },

            saveBasedate: function (appletId, basedate) {
                return GO.util.store.set(
                    STORE_PREFIX + '-works-' + +appletId + '-calendar-basedate',
                    GO.util.toMoment(basedate).format("YYYY-MM-DD"),
                    {type: 'session'}
                );
            },

            saveCheckedPeriod: function (appletId, periodIds) {
                var ids = $.isArray(periodIds) ? periodIds : [periodIds];
                return GO.util.store.set(STORE_PREFIX + '-works-' + appletId + '-calendar-selectedperiod', ids.join(","));
            },

            getDateForUrl: function (type, date) {
                var basedate = GO.util.toMoment(date || new Date()).clone();
                if (type === "monthly") {
                    return basedate.format("YYYY-MM");
                }
                return basedate.format("YYYY-MM-DD");
            },

            parseEventModel: function (tevent) {
                // XSS 보안취약점 대응
                tevent.summary = GO.util.XSSFilter(tevent.title);
                return tevent;
            }
        };
        return WorksUtil;
    });