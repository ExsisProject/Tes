define('works/components/formbuilder/constants', function (require) {
    return {
        // 이벤트: trigger 후 처리여부 신경쓰지 않는 것들.
        EVENT_START_DRAGGING: 'go.works.fb.startDragging',
        EVENT_STOP_DRAGGING: 'go.works.fb.stopDragging',
        EVENT_START_SORTING: 'go.works.fb.startSorting',
        EVENT_STOP_SORTING: 'go.works.fb.stopSorting',
        EVENT_REMOVED_COMPONENT: 'go.works.fb.removedComponent',
        EVENT_SELECT_COMPONENT: 'go.works.fb.selectCompnent',
        EVENT_BACKDROP: 'backdrop',
        EVENT_CLEAR_COMPONENT_SELECTED: 'clearComponentSelected',
        EVENT_COMPONENT_SELECTED: 'componentSelected',
        EVENT_TOGGLE_OPTION_VIEW: 'toggleComponentOptionView',
        EVENT_FOLD_COMPONENT_PANNEL: 'foldComponentPannel',
        EVENT_FOLD_ACCESS_PANNEL: 'foldAccessPannel',
        EVENT_UPDATE_FORM_ACCESS_SETTING: 'update.form.access.setting',

        // 요청: trigger 후 반드시 이루어져야 하는 것들.
        REQ_COPY_COMPONENT: 'requestCopyComponent',
        REQ_ORDER_COMPOMENT: 'requestOrderComponent',
        REQ_REMOVE_COMPONENT: 'requestRemoveComponent',
        REQ_GOTO_SETTINGS_HOME: 'requestGoToSettingsHome',
        REQ_GOTO_APP_HOME: 'requestGoToAppHome',
        REQ_SAVE: 'requestSave',
        REQ_FORM_SAVE: 'requestFormSave',
        REQ_UPDATE_COMPONENT: 'requestUpdateComponent',
        REQ_CHANGE_FORM: 'requestChangeForm',
        REQ_CREATE_FORM: 'requestCreateForm',
        REQ_DELETE_SUBFORM: 'requestDeleteSubForm',

        // 공유 클래스이름들
        CN_COMPONENT_TYPE: 'form-component-type',
        CN_COMPONENT_DESIGN: 'form-component-design',
        CN_COMPONENT: 'form-component',
        CN_DUPLICATED: 'duplicated',
        CN_CONTAINABLE: 'containable',
        CN_PLACEHOLDER: 'placeholder',
        CN_HOVER: 'dashed',
        CN_UNACCEPTABLE: 'unacceptable',
        CN_ERROR: 'txt_error'
    };
});