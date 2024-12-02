define('works/components/formbuilder/core/views/base_form', function (require) {
    var when = require('when');
    var BaseComponentView = require('works/components/formbuilder/core/views/base_component');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var constants = require('works/components/formbuilder/constants');
    var worksLang = require('i18n!works/nls/works');
    var commonLang = require('i18n!nls/commons');
    var COMPONENT_TYPE = require('works/constants/component_type');

    require('jquery.go-popup');

    return BaseComponentView.extend({
        viewType: 'form',

        /**
         * 리스트형(테이블) 컴포넌트에서 원본/복제뷰에서 새로운 뷰를 복제가능한지 여부 설정
         * 복제가능한 뷰는 삭제도 가능하다(단, 원본은 삭제 불가)
         */
        cloneable: true,

        initialize: function (options) {
            options = options || {};

            BaseComponentView.prototype.initialize.apply(this, arguments);

            this.cloneable = true;
            if (_.isBoolean('cloneable')) {
                this.setCloneable(options.cloneable);
            }

            if (this.isEditable()) {
                this.listenTo(this.model, 'change', this._reloadAndUpdateModel);
                this._bindButtonEvent();
            }
        },

        afterRender: function () {
            this._renderCode();
            this._renderColor();
            this._renderBold();
        },

        remove: function () {
            BaseComponentView.prototype.remove.apply(this, arguments);
            this.$el.off('.baseform');
        },

        /**
         * 사용자가 입력한 데이터를 반환한다. 이 데이터는 AppletDocModel에 적용되어 올라간다.
         */
        getFormData: function () {
            return this.appletDocModel && this.appletDocModel.toJSON ? this.appletDocModel.toJSON() : null;
        },

        /**
         * 입력폼 validation 검사
         * 이 함수는 사용자 입력폼에서 호출된다.
         */
        validate: function () {
            return true;
        },

        /**
         * 오류 메시지 출력한다. 기존 오류 메시지가 있다면 삭제하고 출력.
         * @param {HTMLElement | jQueryElement} target 오류 메시지 출력기준 엘리먼트
         * @param {String} 오류 메시지
         */
        printErrorTo: function (target, message) {
            this.$('.' + constants.CN_ERROR).remove();
            this.$('.build_box_data').after('<p class="' + constants.CN_ERROR + '">' + message + '</p>');
        },

        createComponent: function (componentType, parentCid) {
            var component = ComponentManager.createComponent(componentType, parentCid);

            if (!component) {
                return false;
            }

            this.initChildComponent(component);
            return component
        },

        isCloneable: function () {
            return this.cloneable;
        },

        setCloneable: function (bool) {
            this.cloneable = bool
        },

        _bindButtonEvent: function () {
            if (this.isEditable()) {
                this.$el.on('click.baseform', '.btn-remove', _.bind(this._confirmAndRemoveComponent, this));
                this.$el.on('click.baseform', '.btn-copy', _.bind(this._copyComponent, this));
            }
        },

        _confirmAndRemoveComponent: function (e) {
            var self = this;
            e.preventDefault();
            e.stopImmediatePropagation();

            var type = self.type;
            var mainForm = this.subFormId ? false : true;
            var noConfirm = GO.util.store.get(GO.session('id') + '-' + self.appletId + 'works-column-component-delete') || false;

            var isSingleForm = $("[el-form-tab]").length == 1 ? true : false;

            if (!isSingleForm && !noConfirm && mainForm && type == COMPONENT_TYPE.Columns) {
                $.goPopup({
                    pclass: 'layer_normal',
                    header: worksLang['컬럼을 삭제하시겠습니까?'],
                    contents: '<div class="content">' +
                        '<p class="desc">' + worksLang['컬럼삭제 경고'] + '</p>'
                        + '<span class="wrap_option" id="notice_option">'
                        + '<input type="checkbox" id="column-component-delete"><label for="column-component-delete">' + commonLang['더이상 보지 않기'] + '</label></span>'
                        + '</div>',
                    buttons: [{
                        btext: commonLang['확인'],
                        btype: 'confirm',
                        callback: $.proxy(function (e) {
                            if (e.find('#column-component-delete').attr('checked')) {
                                GO.util.store.set(GO.session('id') + '-' + self.appletId + 'works-column-component-delete', {noConfirm: true}, {type: 'session'});
                            }
                            self._removeComponent();
                        }, this)
                    }, {
                        btype: 'close', btext: commonLang['취소']
                    }]
                })
                ;
            } else {
                this._removeComponent();
            }

        },

        _removeComponent: function () {
            var self = this;
            var mainForm = self.subFormId ? false : true;
            this._inquiryIsConnectedComponent().then(function (isConnected) {
                if (mainForm) {
                    return self._confirmRemoveConnectedComponent(isConnected);
                }
            }).then(function () {
                if (mainForm) {
                    return self._inquiryIsGanttViewSettingComponent()
                }
            }).then(function () {
                if (mainForm) {
                    return self._inquiryIsCalendarViewPeriodComponent()
                }
            }).then(function confirmed() {
                self.remove();
                // 1.AppletFormModel에서 먼저 지워주고,
                self.observer.trigger(constants.REQ_REMOVE_COMPONENT, self.getCid());
                // 2.ComponentManager에 등록된 캐시를 지워야 한다.
                ComponentManager.removeComponent(self.getCid());
                // 3.옵션창이 활성화되어 있으면 클리어 시킨다.
                self.observer.trigger(constants.EVENT_CLEAR_COMPONENT_SELECTED, self.getCid());
            }).otherwise(function (error) {
                console.log(error.stack);
            });
        },

        _inquiryIsGanttViewSettingComponent: function () {
            var self = this;
            if ($("header.content_top h1").attr('use-gantt-view') !== 'true') {
                return $.Deferred().resolve();
            }
            return when.promise(function (resolve, reject) {
                $.ajax(GO.contextRoot + "api/works/applets/" + self.appletId + "/ganttview/settings", {
                    success: function (resp) {
                        if (resp && resp.data) {
                            var ganttViewSetting = resp.data;
                            if (isRequiredField(ganttViewSetting, self.getCid())) {
                                $.goConfirm(commonLang['삭제하시겠습니까?'],
                                    worksLang["간트 뷰에서 사용 중인 필수 컴포넌트입니다. 삭제하면 간트 뷰를 사용하지 못합니다."],
                                    resolve);
                            } else {
                                resolve();
                            }
                        } else {
                            reject(new Error('Illegal Response Data'));
                        }
                    },
                    error: reject
                });
            });

            function isRequiredField(setting, cid) {
                return cid == setting.titleFieldCid || cid == setting.startFieldCid || cid == setting.endFieldCid;
            }
        },

        _inquiryIsCalendarViewPeriodComponent: function () {
            var self = this;
            if ($("header.content_top h1").attr('use-calendar-view') !== 'true') {
                return $.Deferred().resolve();
            }
            return when.promise(function (resolve, reject) {
                $.ajax(GO.contextRoot + "api/works/applet/" + self.appletId + "/calendarview/periods", {
                    success: function (resp) {
                        if (resp && resp.data) {
                            var periods = resp.data;
                            if (isCidUsedInPeriod(periods, self.getCid())) {
                                $.goConfirm(commonLang['삭제하시겠습니까?'],
                                    worksLang["캘린더 뷰에서 사용 중인 컴포넌트입니다. 삭제하면 사용 중인 캘린더 뷰에서 해당 날짜가 노출되지 않습니다."],
                                    resolve);
                            } else {
                                resolve();
                            }
                        } else {
                            reject(new Error('Illegal Response Data'));
                        }
                    },
                    error: reject
                });
            });

            function isCidUsedInPeriod(periods, cid) {
                var isUsed = false;
                _.each(periods, function (period) {
                    if (period.startCid == cid || period.endCid == cid) {
                        isUsed = true;
                        return false;
                    }
                });
                return isUsed;
            }
        },

        /**
         * 해당 컴포넌트가 다른 앱에 연결된 컴포넌트인지 서버에 조회요청
         *
         * 요청에 대한 응답을 받은 후 판단로직 처리하여
         * 연결된 앱의 여부에 대한 최종 결과를 boolean으로 resolve 함수에 전달
         *
         * TODO:
         * - 연결된 앱 판단로직 추가(ajax or 모델 조회 방식 중 협의 후 처리)
         */
        _inquiryIsConnectedComponent: function () {
            var self = this;

            return when.promise(function (resolve, reject) {
                var url = GO.config('contextRoot') + 'api/works/applets/' + self.getAppletId() + '/fields/' + self.getCid() + '/integration';
                $.ajax(url, {
                    success: function (resp) {
                        if (resp && resp.data) {
                            resolve(isConnectedComponent(resp.data || []));
                        } else {
                            reject(new Error('Illegal Response Data'));
                        }
                    },
                    error: reject
                });
            });

            function isConnectedComponent(connetedApps) {
                return connetedApps && _.isArray(connetedApps) && connetedApps.length > 0;
            }
        },

        /**
         * 연결된 컴포넌트 일 경우 확인 레이어 호출
         *
         * @param {boolean} isConnected 연결 컴포넌트 여부
         */
        _confirmRemoveConnectedComponent: function (isConnected) {
            return when.promise(function (resolve, reject) {
                if (isConnected || false) {
                    $.goConfirm(
                        worksLang['연동 컴포넌트 삭제 확인 타이틀'],
                        worksLang['연동 컴포넌트 삭제 확인 메시지'],
                        resolve);
                } else {
                    // 연결이 되지 않은 컴포넌트는 그대로 통과시킴
                    resolve();
                }
            });
        },

        /**
         * copy이벤트만 버블링이 된다... 그 이유는 아직 모르겠음...
         */
        _copyComponent: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var rootComponent = ComponentManager.getComponent('cxx1');
            var cidToCopy = this.$el.attr('data-cid');
            var originalComponent = this.searchNode(rootComponent, cidToCopy);
            if (_.isUndefined(originalComponent) || _.isNull(originalComponent)) return;

            var cidToPaste = originalComponent.parentCid;
            var copiedComponent = this.copyAndPaste(originalComponent, cidToPaste);
            if (_.isUndefined(copiedComponent) || _.isNull(copiedComponent)) return;

            this.observer.trigger(constants.REQ_ORDER_COMPOMENT, copiedComponent, originalComponent.position + 1);
            this.getComponentView(copiedComponent).$el.trigger('click');
        },

        copyAndPaste: function (originalComponent, cidToPaste) {
            var type = originalComponent.type;
            var originalProperties = _.clone(originalComponent.properties);

            if (BaseComponentView.prototype._checkSpecialCode(type)) {
                $.goSlideMessage(GO.i18n(worksLang['폼 컴포넌트 중복 에러메시지'], {"arg1": originalProperties.label}), 'caution');
                return;
            }
            var newComponent = this.createComponent(type, cidToPaste);
            if (type === COMPONENT_TYPE.Columns) {
                newComponent = this.createColumnToCopy(newComponent, originalProperties.count);
            }
            originalProperties.code = '';
            newComponent.setProperties(originalProperties);
            newComponent.multiple = originalComponent.multiple;

            var componentToPaste = ComponentManager.getComponentByCid(cidToPaste);
            this.renderCopiedComponent(newComponent, componentToPaste, originalComponent.parentCid == cidToPaste);
            this.appendContainableComponents(originalComponent, newComponent);
            return newComponent;
        },

        createColumnToCopy: function (newComponent, originalColumnCount) {
            var self = this;
            var columnsDefaultCount = newComponent.__componentModel__.attributes.count;

            // columns 타입으로 createComponent 하면 default 가 2단이라서, 3단 일경우 column 을 추가해줘야함.
            if (originalColumnCount > columnsDefaultCount) {
                var addedColumnCnt = originalColumnCount - columnsDefaultCount;
                for (var i = 0; i < addedColumnCnt; i++) {
                    var newColumn = self.createComponent(COMPONENT_TYPE.Column, newComponent.cid);
                    newComponent.addComponent(newColumn.toJSON());
                }
            }
            // ColumnsComponent initialize 할때 componentModel 를 default 2단 기준으로 넣어줘서 이를 비워줘야함.
            newComponent.__componentModel__ = null;
            return newComponent;
        },

        renderCopiedComponent: function (newComponent, parentComponent, isSameParent) {
            var newComponentView = this.getComponentView(newComponent);
            var parentComponentView = this.getComponentView(parentComponent);
            if (parentComponent.type === COMPONENT_TYPE.Table) {
                var newTd = '<td data-cid="' + newComponent.cid + '"></td>';
                if (isSameParent) { // 기존 table 내 td 컴포넌트 copy 시
                    this.$el.closest('td').after(newTd).next('td').append(newComponentView.el);
                } else { // 새 table 에 새로 td 컴포넌트를 그릴 때
                    parentComponentView.$el.find('tr').append(newTd).find('td:last').append(newComponentView.el);
                }
            } else if (parentComponent.type === COMPONENT_TYPE.Column) {
                if (isSameParent) { //기존 column 내 컴포넌트 copy 시
                    this.$el.after(newComponentView.el);
                } else {
                    parentComponentView.$el.find('div.containable').append(newComponentView.el);
                }
            } else {
                this.$el.after(newComponentView.el);
            }
            newComponentView.renderNode();
        },

        appendContainableComponents: function (originalComponent, newComponent) {
            var components = originalComponent.components;
            if (_.isEmpty(components)) return;

            var self = this;
            var type = originalComponent.type;
            if (type === COMPONENT_TYPE.Table) {
                copyComponents(components, newComponent.cid);
            } else if (type === COMPONENT_TYPE.Columns) {
                var columns = components;
                var columnsCnt = columns.length;
                // original column 순서 & new column 순서 맞추기
                for (var i = 0; i < columnsCnt; i++) {
                    var originalColumn = columns[i];
                    var newColumn = newComponent.components[i];
                    copyComponents(originalColumn.components, newColumn.cid);
                }
            }

            function copyComponents(originalComponents, cidToPaste) {
                var componentToPaste = ComponentManager.getComponentByCid(cidToPaste);
                _.each(originalComponents, function (component) {
                    var copiedComponent = self.copyAndPaste(component, cidToPaste);
                    if (_.isUndefined(copiedComponent) || _.isNull(copiedComponent)) return;
                    componentToPaste.addComponent(copiedComponent.toJSON());
                });
            }
        },

        searchNode: function (node, cid) { // referenced applet_form.js
            if (node.cid === cid) {
                return node;
            } else if (node.components != null) {
                var result = null;
                for (var i = 0; i < node.components.length; i++) {
                    result = this.searchNode(node.components[i], cid);
                    if (result) {
                        if (_.isUndefined(result.position)) result.position = i;
                        break;
                    }
                }
                return result;
            }

            return null;
        },

        _reloadAndUpdateModel: function () {
            this.renderNode();
            this.observer.trigger(constants.REQ_UPDATE_COMPONENT, this.getCid());
            this._renderColor();
            this._renderBold();
        },

        _renderCode: function () {
            if (this.isEditable() && this.model.get('code')) {
                var template = '&nbsp;&nbsp;<span class="num_code" style="cursor: default;">' + this.model.get('code') + '</span>';
                this.$('span.box_label_wrap').find('label').append(template);
            }
        },

        _renderColor: function () {
            if (this.model.get('color')) {
                this.$('.box_label_wrap').find('label').removeClass(function (index, className) {
                    return (className.match(/(^|\s)bgcolor\S+/g) || []).join(' ');
                }).addClass('bgcolor' + this.model.get('color'));
            }
        },

        _renderBold: function () {
            var isBold = !!this.model.get('bold');
            if (isBold) this.$('.box_label_wrap').find('label').addClass('st');
        }
    });
});
