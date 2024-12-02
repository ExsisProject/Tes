define('works/components/formbuilder/core/models/applet_form', function (require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var ClientIdGenerator = require('works/components/formbuilder/core/cid_generator');
    var worksLang = require('i18n!works/nls/works');

    /**
     * 폼빌더 애플릿 폼모델
     * 폼빌더의 애플릿 폼모델은 만들어진 폼모델을 외부로 전달하는 역할만 수행한다.
     * 직접 서버와의 교류는 외부에서 수행하도록 구성한다.
     */
    var AppletFormModel = Backbone.Model.extend({
        search: function (cid) {
            return searchNode(this.getRootNode(), cid);
        },

        /**
         * 노드의 부모노드내에서의 index 반환
         * @param {Object|String} node 찾을 노드 객체 혹은 cid
         * @returns {number} index값 반환. 찾지 못하면 -1을 반환
         */
        getIndex: function (node) {
            var parentNode = this.getParentNode(node);
            var result = -1;

            if (parentNode) {
                var cids = _.pluck(parentNode.components, 'cid');
                result = _.indexOf(cids, node.cid);
            }

            return result;
        },

        /**
         * 노드 추가
         *
         * (주의) insert 함수는 모델이 바뀌기 전이므로 외부에서 parentCid가 설정되어서 들어와야 한다.
         *
         * @param {Object} node 노드 객체
         * @param {int} position 노드가 추가된 위치(배열내 index)
         * @param silent 이벤트 트리거 여부(default: false)
         */
        insert: function (node, position, silent) {
            if (!this._isValidNode(node)) {
                return new Error('Illegal Node');
            }

            if (node.parentCid) {
                var parentNode = this.search(node.parentCid);

                if (parentNode.components === null) {
                    parentNode.components = [];
                }

                if (position === 0) {
                    parentNode.components.unshift(node);
                } else if (position > 0) {
                    parentNode.components.splice(position, 0, node);
                } else {
                    parentNode.components.push(node);
                }

                if (silent || false) {
                    this.trigger('change');
                    this.trigger('change:node:' + node.parentCid);
                }
            }
        },

        /**
         * 노드 업데이트
         *
         * @param {Object} node 변경된 노드 객체
         * @param {boolean} silent 이벤트 트리거 여부(default 값은 false)
         */
        update: function (node, silent) {
            var targetNode;

            if (!this._isValidNode(node)) {
                return new Error('Illegal Node');
            }

            targetNode = this.search(node.cid);

            // 아래처럼 extend로 업데이트 해줘야 한다.
            _.extend(targetNode, node);

            if (silent || false) {
                this.trigger('change');
                this.trigger('change:node:' + node.cid);
            }
        },

        /**
         * node (재)정렬
         *
         * (주의) order 함수는 모델이 바뀌기 전이므로 외부에서 parentCid가 변경되어서 들어와야 한다.
         * @param node
         * @param newPosition
         * @param silent
         */
        order: function (node, newPosition, silent) {
            if (node.parentCid) {
                var parentNode = this.search(node.parentCid);

                if (isToBeInserted(parentNode, node.cid)) {
                    this.insert(node, newPosition, silent);
                    return;
                }

                var cids = _.pluck(parentNode.components, 'cid');
                var prevPosition = _.indexOf(cids, node.cid);

                if (prevPosition === newPosition) {
                    return;
                }

                var newList = [];
                var len = parentNode.components.length;

                /**
                 * 폼빌더 구조 문제.
                 * 인자로 들어오는 node 는 child 컴포넌트가 정렬 되지 않은 값이다. model 에서 찾아서 치환해주도록 하자.
                 */
                node = _.findWhere(parentNode.components, {cid: node.cid});
                for (var i = 0; i < len; i++) {
                    var component = parentNode.components[i];
                    if (isTargetNode(node, component)) {
                        continue;
                    } else if (isCurrentPosition(newPosition, i) && prevPosition < newPosition) {
                        // 현재보다 뒤로 갈 경우 처리
                        newList.push(component, node);
                    } else if (isCurrentPosition(newPosition, i) && prevPosition > newPosition) {
                        // 현재보다 앞으로 갈 경우 처리
                        newList.push(node, component);
                    } else {
                        newList.push(component);
                    }
                }

                // newPosition 값이 len보다 크면 마지막 위치로 이동한 것으로 간주
                if (newPosition > len) {
                    newList.push(node);
                }

                parentNode.components = newList;

                if (silent || false) {
                    this.trigger('change');
                    this.trigger('change:node:' + node.parentCid);
                }

                return parentNode;
            }

            function isToBeInserted(node, cid) {
                return node.components === null || _.where(node.components, {"cid": cid}).length < 1;
            }

            function isTargetNode(target, current) {
                return target.cid === current.cid;
            }

            function isCurrentPosition(position, index) {
                return index === position;
            }

            function isLastPosition(position, len) {
                return position === len - 1;
            }
        },

        /**
         * node 삭제
         *
         * [GO-20005] 이슈에 대한 대응으로 node.parentCid로 parentNode를 찾지 않도록 변경.
         * @param node
         * @param silent
         */
        remove: function (node, silent) {
            var parentNode = this.getParentNode(node);
            var isSilent = silent || false;

            if (parentNode) {
                var cids = _.pluck(parentNode.components || [], 'cid');
                var index = _.indexOf(cids, node.cid);

                if (index < 0) {
                    return;
                }

                parentNode.components.splice(index, 1);

                if (!isSilent) {
                    this.trigger('change');
                    this.trigger('remove:node:' + node.cid);
                }
            }
        },

        /**
         * @Override
         * 폼모델의 유효성 체크
         * Backbone.Model의 validate 함수를 정의하고 isValid를 이용하여 유효성 체크를 하는 방법이 있으나,
         * 잘 작동하지 않는다.
         */
        checkValidate: function () {
            if (!this._displayRuleValidation()) {
                return worksLang['잘못된 노출 조건이 있습니다. 노출 조건을 수정해 주세요.'];
            }
            var components = this.get('components');
            if (_.isArray(components) && components.length > 0) {
                ;
            } else {
                return worksLang['컴포넌트 최소갯수 검증 오류메시지'];
            }

            return false;
        },

        /**
         * 최상위 노드 반환
         *
         * @returns {Object}
         */
        getRootNode: function () {
            return this.attributes;
        },

        /**
         * 부모 노드객체 반환
         * @param {String|Object} node 노드객체 혹은 노드 cid
         * @returns {Object} (부모) 노드 객체
         */
        getParentNode: function (node) {
            var result = null;
            var cid;

            if (_.isString(node)) {
                cid = node;
            } else if (_.isObject(node) && node.cid) {
                cid = node.cid;
            }

            if (_.isString(cid)) {
                result = searchParentNode(this.getRootNode(), cid);
            }

            return result;
        },

        _isValidNode: function (node) {
            if (!_.isObject(node)) {
                return false;
            }

            if (node && !_.isString(node.cid)) {
                return false;
            }

            return true;
        },

        _displayRuleValidation: function () {
            var isInValid = false;
            _.each(this.get('components'), function (component) {
                var rule = component.properties.rule;
                if (rule) {
                    var targetCid = rule.listenComponentId;
                    hasTargetComponentInChildes(component, targetCid);
                }
            });

            function hasTargetComponentInChildes(component, targetCid) {
                if (component.cid === targetCid) {
                    isInValid = true;
                } else {
                    _.each(component.components, function (childComponent) {
                        if (childComponent.cid === targetCid) {
                            isInValid = true;
                            return false;
                        }
                        hasTargetComponentInChildes(childComponent, targetCid);
                    });
                }
            }

            return !isInValid;
        }
    });

    var searchNode = function (node, cid) {
        if (node.cid === cid) {
            return node;
        } else if (node.components != null) {
            var result = null;
            for (var i = 0; i < node.components.length; i++) {
                result = searchNode(node.components[i], cid);
                if (result) {
                    break;
                }
            }
            return result;
        }

        return null;
    };

    var searchParentNode = function (ancestor, cid) {
        var result = null;
        // 자기 자신이 들어올 경우에는 찾을 수 없다...
        if (ancestor.cid === cid) {
            ;
        } else if (ancestor.components && _.isArray(ancestor.components)) {
            for (var i = 0; i < ancestor.components.length; i++) {
                var cursor = ancestor.components[i];

                if (cursor.cid === cid) {
                    result = ancestor;
                } else {
                    result = searchParentNode(cursor, cid);
                }

                if (result) {
                    break;
                }
            }
        }

        return result;
    };

    return {
        create: function (attrs) {

            if (_.isUndefined(attrs)) {
                attrs = {
                    "type": 'canvas',
                    "cid": ClientIdGenerator.generate(),
                    "parentCid": null,
                    "components": []
                };
            } else if (_.isObject(attrs)) {
                if (attrs.type && attrs.type !== 'canvas') {
                    throw new Error('AppletFormModel 객체가 아닙니다.');
                    return;
                }
            }

            return new AppletFormModel(attrs);
        }
    };
});
