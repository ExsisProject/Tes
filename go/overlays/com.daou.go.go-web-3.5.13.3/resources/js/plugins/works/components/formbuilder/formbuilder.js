/**
 * formbuilder main script
 */
define('works/components/formbuilder/formbuilder', function (require) {

    var FormBuilderView = require('works/components/formbuilder/core/views/builder');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var ModelApdaters = require('works/components/formbuilder/core/models/adapters');
    var constants = require('works/components/formbuilder/constants');

    /**
     * 폼 컴포넌트 로딩
     */
    require('works/components/formbuilder/form_components/canvas/canvas'); //캔버스
    require('works/components/formbuilder/form_components/input_text/input_text');	//텍스트
    require('works/components/formbuilder/form_components/input_textarea/input_textarea');	//멀티 텍스트
    require('works/components/formbuilder/form_components/input_radio/input_radio');	//단일 선택
    require('works/components/formbuilder/form_components/input_checkbox/input_checkbox');	//멀티 선택
    require('works/components/formbuilder/form_components/input_select/input_select');	//드롭 박스
    require('works/components/formbuilder/form_components/input_listbox/input_listbox');	//리스트 박스
    require('works/components/formbuilder/form_components/input_number/input_number');	//숫자
    require('works/components/formbuilder/form_components/input_timepicker/input_timepicker');	//시간
    require('works/components/formbuilder/form_components/input_datepicker/input_datepicker');	//날짜
    require('works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker');	//날짜시간
    require('works/components/formbuilder/form_components/input_file/input_file');	//첨부파일
    require('works/components/formbuilder/form_components/org/org');	// 사용자 선택
    require('works/components/formbuilder/form_components/label/label');	//라벨
    require('works/components/formbuilder/form_components/hr/hr');	// 라인
    require('works/components/formbuilder/form_components/blank/blank');	// 공백
    require('works/components/formbuilder/form_components/creator/creator');	//등록자
    require('works/components/formbuilder/form_components/updater/updater');	//변경자
    require('works/components/formbuilder/form_components/org_dept/org_dept');	// 부서 선택
    require('works/components/formbuilder/form_components/create_date/create_date');	// 등록일
    require('works/components/formbuilder/form_components/update_date/update_date');	// 수정일
    require('works/components/formbuilder/form_components/columns/columns'); // 컬럼들(다단)
    require('works/components/formbuilder/form_components/table/table'); // 테이블
    require('works/components/formbuilder/form_components/applet_doc/applet_doc'); // 데이터 연동
    require('works/components/formbuilder/form_components/field_mapping/field_mapping'); // 연동항목 매핑
    require('works/components/formbuilder/form_components/formula/formula'); // 자동 계산(공식)

    /**
     * @param appletFormData Object
     * @param appletDocData Backbone.Model
     * @param options Object
     * @returns {*}
     */
    function createComponent(appletFormData, appletDocData, options, integrationModel) {
        var opts = options || {};
        var appletFormModel = ModelApdaters.toAppletFormModel(appletFormData);
        var appletDocModel = ModelApdaters.toAppletDocModel(appletDocData);
        var appletId = appletFormData.appletId;
        var observer = opts.observer || _.extend({}, Backbone.Events);

        var componentManager = ComponentManager.init(appletFormModel.toJSON(), options);
        var component = componentManager.getComponent(appletFormModel.get('cid'), opts);
        component.setAppletId(appletId);
        component.setEditable(false);

        // 필드매핑 기능 추가로 사용자 입력폼에서도 컴포넌트간 연동이 필요하므로
        // 외부에서 주입된 observer를 넣어주거나 기본 공유 옵저버를 넣어준다.
        component.attachObserver(observer);
        component.setAppletDocModel(appletDocModel);
        component.setIntegrationModel(integrationModel);
        return component;
    }

    /**
     * 폼빌더 메인 객체
     */
    var FormBuilder = {
        /**
         * 폼빌더 생성
         */
        createBuilder: function (appletFormData) {
            return new FormBuilderView({
                "appletId": appletFormData.appletId,
                "model": appletFormData
            });
        },

        /**
         * 컴포넌트 생성
         */
        createUserComponent: function (appletFormData, appletDocData, options, integrationModel) {
            return createComponent(appletFormData, appletDocData, options, integrationModel);
        },

        getInvalidForm: function (type) {
            var components = type ? this._getComponentsByType(type) : ComponentManager.getComponents();
            var invalidForm;

            for (var i = 0, len = components.length; i < len; i++) {
                var component = components[i];
                if (!component.validateFormData()) {
                    invalidForm = component.getFormView();
                    break;
                }
            }
            return invalidForm;
        },

        /**
         * 선택적 인자 type. type 을 주지 않으면 모든 컴포넌트를 가져온다.
         */
        getFormData: function (type) {
            var components = type ? this._getComponentsByType(type) : ComponentManager.getComponents();
            var isValidated = true;
            var formData = {};

            for (var i = 0, len = components.length; i < len; i++) {
                var component = components[i];
                if (component.validateFormData()) {
                    var _data = component.getFormData();
                    if (_data) {
                        _.extend(formData, _data);
                    }
                    component.getFormView().$('.' + constants.CN_ERROR).remove();
                } else {
                    scrollTo(component);
                    isValidated = false;
                    break;
                }
            }

            if (!isValidated) {
                return false;
            } else {
                return formData;
            }

            function scrollTo(component) {
                var formView = component.getFormView();
                var offset = formView.$el.offset();
                $(window).scrollTop(offset.top);
            }
        },

        /**
         * 문서상세의 타이틀 반환
         *
         * 배치된 컴포넌트 중 타이틀로 지정된 컴포넌트에 타이틀 문자열을 요청한다(getTitle)
         * 등록자/등록일/변경자/변경일은 배치되지 않아도 목록에서 나올 수 있으므로,
         * 등록된 컴포넌트 타입에서 컴포넌트 정의 객체를 찾아서 임의로 detailView를 생성하여
         * 타이틀을 만든다(리팩토링 필요한 부분)
         */
        getDocumentTitle: function (appletDocData) {
            var component, detailView;
            var titleCid = appletDocData.get('titleCid');

            if (ComponentManager.isCreated(titleCid)) {
                component = ComponentManager.getComponent(titleCid);
                detailView = component && component.getDetailView();
            } else if (ComponentManager.getComponentClass(titleCid)) {
                var componentClass = ComponentManager.getComponentClass(titleCid);
                var appletDocModel = ModelApdaters.toAppletDocModel(appletDocData);
                component = ComponentManager.createComponent(componentClass.type);
                component.setAppletDocModel(appletDocModel);
                detailView = component.getDetailView();
            }
            if (!_.isUndefined(detailView) && _.isFunction(detailView.getTitle)) {
                return detailView.getTitle();
            }

            return null;
        },

        _getComponentsByType: function (type) {
            return _.filter(ComponentManager.getComponents(), function (component) {
                return component.getViewType() === type;
            });
        }
    };

    return FormBuilder;

});
