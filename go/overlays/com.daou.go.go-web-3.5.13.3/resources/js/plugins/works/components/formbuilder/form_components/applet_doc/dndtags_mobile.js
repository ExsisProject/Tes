define('works/components/formbuilder/form_components/applet_doc/dndtags_mobile', function (require) {
    var NameTagView = require('go-nametags');

    var View = NameTagView.extend({
        addTag: function (id, title, options, user) {
            var
                self = this,
                props = options || {},
                template = this._makeTagItemTemplate(props.liCustomClass, props.isTemplate, props.removable || false),
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

            $li.find('.ic_file_del').unbind('click').bind('click', function () {
                var $target = $(this).closest('li');
                if (props["onDelete"] && typeof props["onDelete"] === 'function') {
                    var promise = props["onDelete"].call(undefined, id, title);
                    promise.done(function () {
                        self._removeTag($target);
                    });
                } else {
                    self._removeTag($target);
                }
            });

            return $li;
        },

        _makeTagItemTemplate: function (liCustomClass, isTemplate, removable, useMarker) {
            var html = [];
            if (!liCustomClass) {
                liCustomClass = '';
            }

            if (useMarker) {
                var colorCode = generateRandomColorCode();
                html.push('<li class="' + liCustomClass + 'data-id="{{id}}" data-position="{{position}}" data-marker="' + colorCode + '">');
                html.push('<span class="chip" style="background-color: ' + colorCode + '"></span>');
            } else {
                html.push('<li class="' + liCustomClass + '" data-id="{{id}}" data-position="{{position}}">');
            }

            if (isTemplate) {
                html.push('{{{title}}}');
                html.push('{{#templateText}}<span class="name" style="display:none;">{{templateText}}</span>{{/templateText}}');
            } else {
                html.push('<span class="name">{{title}}</span>');
            }

            if (removable) {
                html.push('<a class="wrap_ic_file"><span class="txt ic ic_file_del"></span></a>');
            }

            html.push('</li>');

            return Hogan.compile(html.join("\n"));
        }
    });

    return View;
});
