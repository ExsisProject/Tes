define('works/models/applet_form', function (require) {
    var GO = require('app');
    var BaseModel = require('models/base_model');

    /**
     * 애플릿 폼 모델(AppletFormModel)
     * 참고: http://wiki.daou.co.kr/display/go/AppletFormModel
     *
     * 폼 빌더와 사용자 입력폼을 렌더링할 때 사용
     */
    return BaseModel.extend({

        components: null,

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);
        },

        url: function () {
            var appletId = this.get('appletId');
            var subFormId = this.get('subFormId');
            var existSubFormId = GO.util.isValidValue(subFormId);
            var type = this.get('type');

            if (type === 'subform_setting') {
                if (existSubFormId) {
                    return GO.config('contextRoot') + 'api/works/applets/' + appletId + '/subform/' + subFormId;
                } else {
                    return GO.config('contextRoot') + 'api/works/applets/' + appletId + '/subform';
                }
            } else {
                if (existSubFormId) {
                    return GO.config('contextRoot') + 'api/works/applets/' + appletId + '/form/' + subFormId;
                } else {
                    return GO.config('contextRoot') + 'api/works/applets/' + appletId + '/form';
                }

            }
        },

        mergeMaskingValue: function (cids) {
            var canvas = this.get('data');
            masking(canvas);

            function masking(component) {
                _.each(component.components, function (comp) {
                    comp.masking = _.contains(cids, comp.cid);
                    if (comp.components.length) masking(comp);
                });
            }
        },

        parse: function (resp) {
            var components = resp.data.data.components;
            var data = resp.data;
            /* GO-28471 중복 cid를 갖는 컴포넌트가 존재로 인한 입력항목에서 컴포넌트 이동 시 반영되지 않는 이슈 대응을 위해 model에서
             * 중복된 componet를 제거 해주는 작업 수행  */
            data.data = this._correctionComponents(data.data);

            return data;
        },

        _correctionComponents: function (rootComponents) {
            this._removeDuplicateComponents(rootComponents);
            this._correctionMultipleFlagInTable(rootComponents);
            return rootComponents;
        },

        _removeDuplicateComponents: function (rootComponent) {
            var cids = [];

            redefineComponents(rootComponent);
            return rootComponent;

            function redefineComponents(parentComponent) {
                parentComponent.components = _.filter(parentComponent.components, function (childComponent) {
                    var isContained = _.contains(cids, childComponent.cid);
                    if (!isContained) {
                        cids.push(childComponent.cid);
                    }
                    redefineComponents(childComponent);
                    return !isContained;
                });
            }
        },

        /**
         * 테이블안에 multiple: false 값이 세팅되는 경우에 대한 보정 코드.
         * 정확한 케이스를 알 수 없어 get 시점에 잘못된 값이 있으면 바로 put 하여 보정하도록 한다.
         * @param rootComponent
         * @returns {*}
         * @private
         */
        _correctionMultipleFlagInTable: function (rootComponent) {
            var hasInvalidMultipleFlag = false;
            _.each(rootComponent.components, function (childComponent) {
                if (childComponent.type === 'table') {
                    _.each(childComponent.components, function (inTableComponent) {
                        if (inTableComponent.multiple === false) {
                            inTableComponent.multiple = true;
                            hasInvalidMultipleFlag = true;
                        }
                    });
                }
            });

            if (hasInvalidMultipleFlag) {
                $.ajax({ // model 의 event 를 listen 하여 사용 할 수 있으므로 model.save 가 아닌 ajax 를 사용해 업데이트 하도록 한다.
                    type: 'PUT',
                    contentType: 'application/json',
                    url: this.url(),
                    data: JSON.stringify({
                        appletId: this.get('appletId'),
                        id: this.get('appletId'),
                        data: rootComponent
                    })
                });
            }

            return rootComponent;
        }
    });
});
