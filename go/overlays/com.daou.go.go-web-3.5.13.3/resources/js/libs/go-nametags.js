(function () {

    define(["jquery", "underscore", "backbone", "hogan", "i18n!nls/commons"], function ($, _, Backbone, Hogan, commonLang) {

        var NameTagListView = Backbone.View.extend({
            tagName: 'ul',
            className: 'name_tag',

            events: {
                "click .add-btn": "_triggerAddTag",
                "click .remove_all_tags": "removeAll"
            },

            initialize: function (options) {
                this.options = options || {};
                this.options.useAddButton = (this.options.useAddButton || false);
                this.options.useMarker = (this.options.useMarker || false);
                this.stopPropagation = options.stopPropagation;

                if (this.options.useAddButton) {
                    this.$el.append(makeAddBtnTemplate(this.options.addBtnText));
                    if (this.options.useRemoveAll) {
                        this.$el.find('.add-btn').append(makeRemoveAllTemplate(this.options.removeAllBtnText));
                    }
                }
            },

            remove: function () {
                Backbone.View.prototype.remove.apply(this, arguments);
                this.$el.off();
            },

            addTags: function (obj, options) {
                var datas = _.isArray(obj) ? obj : [obj];
                var hasAttr = _.has(options, "attrs");
                _.each(datas, function (data) {
                    var displayName = this._makeDisplayName(data);
                    var clonedOptions = _.clone(options);
                    if (hasAttr) {
                        clonedOptions["attrs"] = data;
                    }
                    this.addTag(data.id, displayName, clonedOptions, data);
                }, this);
            },

            addTag: function (id, title, options, user) {
                var
                    self = this,
                    props = options || {},
                    template = makeTagItemTemplate(props.liCustomClass || '', props.isTemplate || false, props.removable || false, false, props.itemIsMine || false),
                    $li = $(template.render({
                        "id": id,
                        "title": title,
                        "templateText": props.templateText,
                        "position": user ? user.position : ""
                    }));

                if (user) {
                    $li.data("user", user);
                }

                if (this.getNameTag(id).length) {
                    return;
                }

                if (!!props["attrs"]) {
                    $li.data('attrs', props["attrs"]);
                }

                if (props["onCreate"] && typeof props["onCreate"] === 'function') {
                    props["onCreate"].call(undefined, $li.get(0));
                }

                if (this.options.useMarker) {
                    var colorCode = generateRandomColorCode();
                    $li.prepend('<span class="chip" style="background-color: ' + colorCode + '"></span>');
                    $li.attr('data-marker', colorCode);
                }

                if (this.options.useAddButton) {
                    this.$el.find('li.add-btn').before($li);
                } else {
                    this.$el.append($li);
                }

                $li.find('.ic_del').bind('click', function (e) {
                    var $target = $(this).closest('li');
                    if (props["onDelete"] && typeof props["onDelete"] === 'function') {
                        var promise = props["onDelete"].call(undefined, id, title);
                        promise.done(function () {
                            self._removeTag($target);
                        });
                    } else {
                        self._removeTag($target);
                    }
                    if (self.stopPropagation) e.stopPropagation();
                });

                return $li;
            },

            getNameTag: function (id) {
                return this.$el.find('[data-id="' + id + '"]');
            },

            removeTag: function (id) {
                this.getNameTag(id).remove();
            },

            removeAll: function (e) {
                if (!_.isUndefined(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$('[data-id]').remove();
            },

            getNameTagList: function () {
                var result = [];

                this.$el.find('li:not(.add-btn)').each(function (i, el) {
                    var $el = $(el),
                        hash = $.extend(true, {
                            "id": $el.data('id'),
                            "name": $el.find('.name').text()
                        }, $el.data('attrs') || {});

                    result.push(hash);
                });

                return result;
            },

            _removeTag: function ($target) {
                // TODO: 리팩토링 필요
                var $clone = $target.clone();
                var data = $target.data();
                $target.remove();
                $clone.data(data); // jquery remove 시 ghost view 를 유지하면서 element 에 정의되지 않은 data 속성이 제거된다.
                this.$el.trigger("nametag:removed", [$clone.data('id'), $clone.get(0), $clone]);
            },

            _triggerAddTag: function () {
                this.$el.trigger("nametag:clicked-add", [this]);
            },

            _makeDisplayName: function (data) {
                return data.displayName || data.name + (data.position ? " " + data.position : "");
            }
        }, {
            create: function (tags, options) {
                var options = options || {},
                    instance = new NameTagListView(options),
                    tags = tags || [];

                $.each(tags, function (i, tag) {
                    instance.addTag(tag.id, tag.title, tag.options);
                });

                return instance;
            }
        });

        function makeTagItemTemplate(liCustomClass, isTemplate, removable, useMarker, itemIsMine) {
            var html = [];
            if (!liCustomClass) {
                liCustomClass = '';
            }

            if (useMarker) {
                var colorCode = generateRandomColorCode();
                html.push('<li class="' + liCustomClass + '" data-id="{{id}}" data-position="{{position}}" data-marker="' + colorCode + '" data-mine=' + itemIsMine + '>');
                html.push('<span class="chip" style="background-color: ' + colorCode + '"></span>');
            } else {
                html.push('<li class="' + liCustomClass + '" data-id="{{id}}" data-position="{{position}}"' + ' data-mine=' + itemIsMine + '>');
            }

            if (isTemplate) {
                html.push('{{{title}}}');
                html.push('{{#templateText}}<span class="name" style="display:none;">{{templateText}}</span>{{/templateText}}');
            } else {
                html.push('<span class="name">{{title}}</span>');
            }

            if (removable) {
                html.push('<span class="btn_wrap">');
                html.push('<span class="ic_classic ic_del" title="' + commonLang["삭제"] + '"></span>');
                html.push('</span>');
            }

            html.push('</li>');

            return Hogan.compile(html.join("\n"));
        }

        function generateRandomColorCode() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function makeAddBtnTemplate(addBtnText) {
            addBtnText = addBtnText || commonLang["추가"];
            var html = [];
            html.push('<li class="creat add-btn">');
            html.push('<span class="btn_wrap">');
            html.push('<span class="ic_form ic_addlist"></span>');
            html.push('<span class="txt">' + addBtnText + '</span>');
            html.push('</span>');
            html.push('</li>');

            return html.join("\n");
        }

        function makeRemoveAllTemplate(removeAllText) {
            removeAllText = removeAllText || commonLang["전체 삭제"];
            var html = [];
            html.push('<a class="remove_all_tags btn_rest">');
            html.push('<span class="ic16 allDel"></span>');
            html.push('<span class="txt">' + removeAllText + '</span>');
            html.push('</a>');
            return html.join("\n");
        }

        return NameTagListView;

    });

})();
