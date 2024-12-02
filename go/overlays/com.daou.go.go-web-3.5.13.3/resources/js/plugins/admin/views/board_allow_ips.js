define([
        "jquery",
        "backbone",
        "app",
        "hogan",

        "hgn!admin/templates/board_allow_ips",

        "i18n!nls/commons",
        "i18n!admin/nls/admin"


    ],
    function ($,
              BackBone,
              GO,
              Hogan,

              IpConfigTpl,

              commonLang,
              adminLang
    ) {


        var lang = {
            'label_access_control': adminLang['IP 접근설정'],
            'label_enable': adminLang['사용여부'],
            'label_use': adminLang['사용함'],
            'label_unuse': adminLang['사용하지 않음'],
            'label_ip_address': adminLang['IP 주소'],
            'label_access_desc': adminLang['게시판 접근 허용 IP 설명']
        };

        var AllowIpModel = BackBone.Model.extend({
                defaults : {
                    configValue : 'false'
                },

                initialize : function(options) {
                    this.option = options || {};
                    this.appName = this.option.appName;
                    this.targetId = this.option.targetId;
                },

                url: function () {
                    return [GO.contextRoot + 'ad/api', this.appName,'allowIps', this.targetId].join('/');
                }
            },
            {
                IP_RANGE_CONCATOR: '-',
                //정규식을 이용하여 IP 형식 검증.
                validateIp: function (ip) {
                    var ipv4AddrRegex = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
                    if (ip.indexOf(AllowIpModel.IP_RANGE_CONCATOR) > 0) {
                        var ipTo = ip.split(AllowIpModel.IP_RANGE_CONCATOR)[1];
                        if (!ipv4AddrRegex.test(ipTo)) {
                            return false;
                        }
                    }

                    return ipv4AddrRegex.test(ip.split(AllowIpModel.IP_RANGE_CONCATOR)[0]);
                }
            });

        var AllowIpView = BackBone.View.extend({
            events: {
                "click input[name='ipConfigEnable']": "ipConfigEnableClicked", /** IP 사용여부 체크 */
                "click #ip_addBtn": "ipAddActionClicked", /** " >> " 버튼 이벤트 */
                "click #ip_removeBtn": "ipRemoveActionClicked"   /** " << " 버튼 이벤트 */

            },

            initialize: function (options) {
                this.option = options || {};
                this.model = new AllowIpModel(this.option);

                this.bind("saveConfig", this.save, this);

            },

            render: function () {
                this.model.fetch().done($.proxy(function() {
                    this.$el.html(IpConfigTpl({
                        data: this.model.toJSON(),
                        lang: lang
                    }));
                    this.renderIpConfigEnable();
                    this.renderAccessIps();


                }, this));

                return this;

            },

            /**
             * 사용여부 Click event.
             */
            ipConfigEnableClicked: function (e) {
                console.log('ipConfigEnableClicked..');
                var enabled = $(e.currentTarget).val() == "true"; // 사용여부 value
                this.model.set('configValue', enabled);
                // true면 IP 주소 활성화, false면 IP 주소 비활성화.
                this.setIpRangeInput(enabled);
            },

            renderIpConfigEnable : function() {
                this.setIpRangeInput(this.model.get('ipEnable'));
            },

            /**
             * IP 입력창 활성화 / 비활성화.
             */
            setIpRangeInput: function (/**IP기능활성화여부*/enabled) {
                // INPUT 및 span.btn_s 활성 / 비활성.
                var disabled = !enabled;

                this.$(/**InputBOX, SelectBox*/'tr.IP_SETTINGS input, tr.IP_SETTINGS select').attr('disabled', disabled);
                // 입력창 초기화
                if (/**사용하지 않음*/disabled) {
                    this.clearInputIps();
                    this.$('tr.IP_SETTINGS').hide();
                } else/**사용함*/ {
                    this.$('tr.IP_SETTINGS').show();
                }
            },

            /**
             * 입력한 IP 등록.
             */
            ipAddActionClicked: function () {
                // 입력된 INPUT 데이터를 합쳐서, IP형태로 만든다.
                var startIp = _.pluck($("input[name*='ip_from']"), 'value').join('.');
                var endIp = _.pluck($("input[name*='ip_to']"), 'value');

                var addIp = startIp;
                if (/**toIp의 자리수가 유효하다면*/_.size(_.compact(endIp)) == 4) {
                    // 두개의 IP를 구분자(-)로 합친다.
                    addIp = _.compact([startIp, endIp.join('.')]).join('-')
                }

                // 만들어진 IP 형태가 올바른지 Validation.
                if (!AllowIpModel.validateIp(addIp)) {
                    $.goAlert(commonLang['IP 유효하지 않음']);
                    return;
                }

                // 중복 IP 제거
                if (_.contains(this.model.get('accessIps'), addIp)) {
                    $.goAlert(commonLang['IP 중복']);
                    return;
                }

                // 모델에 넣고, SelectBOx에 넣는다.
                this.model.get('accessIps').push(addIp);
                // 목록 그리기
                this.renderAccessIps();
                // 입력창 초기화
                this.clearInputIps();
            },

            /**
             * 입력한 IP를 SelectBox에 등록.
             */
            renderAccessIps: function () {
                var $appendTarget = this.$('select[name="ipRanges"]');
                var data = {'ips': this.model.get('accessIps')};
                var tmpl = [];

                tmpl.push('{{#ips}}');
                tmpl.push('    <option value="{{.}}">{{.}}');
                tmpl.push('{{/ips}}');

                $appendTarget.html(Hogan.compile(tmpl.join('')).render(data));
            },

            /**
             * IP 입력창 초기화.
             */
            clearInputIps: function () {
                this.$("input[name*='ip_from']").val('');
                this.$("input[name*='ip_to']").val('');
            },

            /**
             * 입력된 IP 제거.
             */
            ipRemoveActionClicked: function () {
                var removeIp = this.$('select[name="ipRanges"]').val();
                if (/**선택된IP가없으면*/_.isNull(removeIp)) {
                    $.goAlert(commonLang['IP 선택되지 않음']);
                    return;
                }

                // 선택된 값을 모델에서 삭제.
                var removeToModel = _.pull(this.model.get('accessIps'), removeIp.toString());
                this.model.set('accessIps', removeToModel);

                // SelectBox 다시 그리기.
                this.renderAccessIps();
            },


            save: function (options) {
                var self = this;
                var param = $.extend(true, this.option, options);
                this.model.set('appName', param.appName);
                this.model.set('targetId', param.targetId);
                if(this.model.get('configValue') == '') {
                    this.model.set('configValue', false);
                }
                this.model.save();
            }
        })

        return AllowIpView;

    });