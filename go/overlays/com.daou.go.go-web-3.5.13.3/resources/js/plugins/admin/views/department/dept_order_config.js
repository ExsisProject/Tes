(function () {
    define([
            'jquery',
            'backbone',
            'hgn!admin/templates/department/dept_order_config',
            'i18n!nls/commons',
            'i18n!admin/nls/admin',

            'GO.util'
        ],
        function (
            $,
            Backbone,
            DeptOrderConfigTmpl,
            CommonLang,
            AdminLang
        ) {
            var lang = {
                use: AdminLang['사용함'],
                disUse: CommonLang['사용하지 않음'],
                defaultConfigUse: AdminLang["기본 설정값을 사용합니다."],
                orderPriority: AdminLang['정렬 순서'],
                allDeptApply: AdminLang['전체 부서에 적용됩니다.'],
                memberType: AdminLang['멤버타입'],
                positionCode: AdminLang['직위'],
                gradeCode: AdminLang['직급'],
                titleCode: AdminLang['직책'],
                empCode: AdminLang['사번'] + '/' + AdminLang['학번'],
                email: CommonLang['이메일'],
                add: CommonLang['추가'],
                remove: CommonLang['삭제']
            };

            var orderConfigView = Backbone.View.extend({
                events: {
                    'click #btnAddOrderItem': 'addOrderItem',
                    'click #btnDeleteOrderItem': 'deleteOrderItem'
                },

                initialize: function (options) {
                    this.$parentEl = options.$parentEl;
                    this.deptOrderConfigModel = new Backbone.Model();
                    this.deptOrderConfigModel.url = GO.contextRoot + "ad/api/department/orderconfig";
                },

                render: function (options) {
                    this.deptOrderConfigModel.fetch({async: false});

                    var config = this.deptOrderConfigModel.toJSON();
                    config.isOrderUse = config.use === "on" ? true : false;

                    this.$el.html(DeptOrderConfigTmpl({
                        'lang': lang,
                        'config': config,
                        getItemValue: function () {
                            return lang[this];
                        }
                    }));

                    this.$el.find('.title').css('margin', '10px 0px');
                    this.$el.find('#divOrderPriority').sortable({
                        opacity: '1',
                        delay: 100,
                        cursor: "move",
                        items: "li",
                        containment: '#divOrderPriority',
                        hoverClass: "ui-state-hover",
                        placeholder: 'ui-sortable-placeholder',
                        start: function (event, ui) {
                            ui.helper.addClass('move');
                        },
                        stop: function (event, ui) {
                            ui.item.removeClass('move');
                        }
                    });
                    this.customFieldRender();

                    return this;
                },

                formSubmit: function (e) {
                    e.preventDefault();
                    return;
                },

                addOrderItem: function (e) {
                    var itemValue = this.$el.find('#selAddOrderItem').val();
                    var itemText = this.$el.find('#selAddOrderItem option:selected').text();

                    var orderItems = this.getOrderItems();
                    if ($.inArray(itemValue, orderItems) > -1) {
                        this.$el.find('#message').text(AdminLang["이미 추가된 항목입니다."]);
                        this.$el.find('#message').show();

                        var self = this;
                        setTimeout(function () {
                            self.$el.find('#message').hide();
                            self.$el.find('#message').text("");
                        }, 1000);

                        return;
                    }

                    var liAddItem = '<li id="li' + itemValue + '">';
                    liAddItem += '<input name="orderItems" type="hidden" value="' + itemValue + '" />';
                    liAddItem += '<span class="txt">' + itemText + '</span>';
                    liAddItem += '<span class="btn_wrap"><span id="btnDeleteOrderItem" class="ic_dashboard2 ic_d_delete" title="' + lang.remove + '"></span></span>';
                    liAddItem += '</li>';

                    this.$el.find('#ulSelectedOrderPriority').append(liAddItem);
                },
                deleteOrderItem: function (e) {
                    var target = $(e.currentTarget);
                    if ($('#ulSelectedOrderPriority li').length > 1) {
                        target.parent('span').parent('li').remove();
                    } else {
                        $.goAlert("정렬 순서는 한 개이상 설정되어야 합니다.");
                    }

                },
                saveOrderConfig: function () {
                    var self = this;
                    var form = GO.util.serializeForm(this.$el.find('#frmDeptOrderConfig'));
                    var orderItems = this.getOrderItems();

                    if (form.use == 'on' && orderItems.length < 1) {
                        this.$el.find('#message').show();
                        this.$el.find('#message').text(AdminLang["정렬 순서를 추가해 주십시오."]);

                        setTimeout(function () {
                            self.$el.find('#message').hide();
                            self.$el.find('#message').text("");
                        }, 1000);

                        return;
                    }

                    form.orderItems = orderItems;

                    this.deptOrderConfigModel.save(form, {
                        async: false,
                        success: function () {
                            if (self.$parentEl) self.$parentEl.trigger('orgChanged');
                            $.goMessage(CommonLang["저장되었습니다."]);
                            $.goPopup.close();
                        }, error: function (model, response) {
                            if (response.message) $.goAlert(response.message);
                            else $.goMessage(CommonLang["실패했습니다."]);
                        }
                    });
                },
                getOrderItems: function () {
                    var form = GO.util.serializeForm(this.$el.find('#frmDeptOrderConfig'));
                    var orderItems = [];

                    if (form.orderItems) {
                        if (typeof form.orderItems === 'string') {
                            orderItems[0] = form.orderItems;
                        } else {
                            orderItems = form.orderItems;
                        }
                    }

                    return orderItems;
                },

                customFieldRender: function () {
                    var _this = this;
                    $.go(GO.contextRoot + "ad/api/customprofile/use/config/order", {}, {
                        qryType: 'GET',
                        async: false,
                        responseFn: function (response) {
                            $.each(response.data, function (i, item) {
                                _this.$('#selAddOrderItem').append('<option value="' + item.profileName + '">' + item.name + '</option>');

                                if (_this.$('#li' + item.profileName) != undefined) {
                                    _this.$('#li' + item.profileName).find("span.txt").text(item.name);
                                }
                            });

                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goMessage(responseData.message);
                        }
                    });
                }
            });

            return orderConfigView;
        });
}).call(this);
