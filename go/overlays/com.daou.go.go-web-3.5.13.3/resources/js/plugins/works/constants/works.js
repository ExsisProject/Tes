define('works/constants/works', function (require) {
    return {
        APPLET_VIEW_TYPE: {
            CARD: 'card',
            LIST: 'list'
        },
        WORKS_HOME_TAB_TYPE: {
            ALL: 'all',
            FAVORITE: 'favorite',
            MANAGE: 'manage',
            SEARCH: 'search'
        },
        WORKS_GUIDE: {
            WORKS_SETTING_BADGE: 'WORKS_SETTING_GUIDE_BADGE_',
            WORKS_APP_BADGE: 'WORKS_APP_GUIDE_BADGE_',
            EXPIREDATE: 3650 // 10년
        },
        WORKS_COMPONENTS: {
            WORKS_REQUIRED_VAL: "-999"
        },
        GANTT_NODE_TYPE: {
            DOC: 'DOC',
            GROUP: 'GROUP'
        },
        GANTT_VIEW_DOC_NODE_MAX_COUNT: 200
    };
});

