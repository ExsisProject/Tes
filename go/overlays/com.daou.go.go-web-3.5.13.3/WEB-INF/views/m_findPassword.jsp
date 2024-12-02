<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
    <title>${lang.passwordFind}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all" />
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-jssdk.js?rev=${revision}"></script>
    <style type="text/css">
        html, body { width:100%;  overflow:hidden; }
    </style>
</head>
<body>

<script type="text/javascript">
    $('#header_title').remove();
    $('#root_div').remove();
</script>

<div class="go_wrap">
    <div id="header_title">
        <header class="go_header">
            <!-- nav -->
            <div class="nav">
                <h1>${lang.passwordFind}</h1>
                <div class="critical">
                    <a href="#" class="ic_nav_wrap"><span class="ic_nav ic_nav_back"></span></a>
                </div>

            </div>
        </header>
    </div>

    <div class="content_page" id="root_div">
        <div id = "input_password">
            <div class="content">
                <div class="notice">
                    <span class="ic_notice ic_network_error"></span>
                    <p class="desc">${lang.passwordFindDesc1}</p>
                    <table class="form_type">
                        <tbody>
                        <tr>
                            <td>
                                <input id="account_id" class="input w_max" type="text" placeholder=${lang.account}>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <a href="#" class="btn_major" id="next_btn" data-role="button"><span class="txt">${lang.next}</span></a>
                </div>
            </div>
        </div>

        <script type="text/javascript">
            GO = {};
            GO["contextRoot"] = "${baseUrl}";
        </script>

        <script type="text/javascript">
            $(function($){
                self = this;
                $("#next_btn").click(function(){
                    if($('#account_id').val().length <= 0){
                        $('.txt_error').remove();
                        $('#account_id').after("<span class='txt_error'>" + "${lang.inputAccount}"+"</span>");
                        return;
                    }
                    findPasswordByAccountCollback();
                });

                function findPasswordByAccountCollback (){
                    var accountInfo = $('#account_id').val();
                    $.ajax({
                        url: GO.contextRoot + 'api/email/hint',
                        data: "userAccount=" + accountInfo,
                        type: 'GET',
                        async: false,
                        dataType : 'text',
                        success: function(resp) {
                            if(resp){
                                //외부메일있음
                                $('#input_password').remove();
                                var tmpl = '<div id = "input_password">' + '<div class="content">' + '<div class="notice">' +
                                        '<span class="ic_notice ic_network_error"></span>' +
                                        "<p class='desc' data-id='" + accountInfo + "'>" + "${lang.passwordFindDesc2}" + "("+ resp + ")" +"</p>" +
                                        '<table class="form_type">' +
                                        '<tbody>'+
                                        '<tr>' +
                                        '<td>' +
                                        '<input id="external_email" class="input w_max" type="text" placeholder=' +'"${lang.externalEmail}"'+ '>' +
                                        '</td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '<a href="#" class="btn_minor" data-role="button" id="send_mail_btn"><span class="txt">'+"${lang.next}"+'</span></a>' +
                                        '</div></div></div>';
                                $('#root_div').append(tmpl);

                                $("#send_mail_btn").click(function(){
                                    if($('#external_email').val().length <= 0){
                                        $(".txt_error").remove();
                                        $('#external_email').after("<span class='txt_error'>" + "${lang.inputExternalEamil}"+"</span>");
                                        return;
                                    }
                                    sendTempPassword();
                                });
                            }else{
                                $('#input_password').remove();
                                var tmpl = '<div id = "input_password">' +  '<div class="notice">' +
                                        '<span class="ic_notice ic_network_error"></span>' +
                                        '<p class="desc">'+"${lang.externalEmailEmpty}"+'</p>' +
                                        '<a href="#" class="btn_major" data-role="button" id="close_btn"><span class="txt">'+"${lang.close}"+'</span></a>' +
                                        '</div></div>';
                                $('#root_div').append(tmpl);

                                $("#close_btn").click(function(){
                                    self.close();
                                });
                            }
                        }
                    });
                }

                function sendTempPassword() {
                    var externalEmail = $('#external_email').val(),
                            accountInfo = $(".desc").attr('data-id');

                    $.ajax({
                        url: GO.contextRoot + 'api/email/password',
                        data: "userAccount=" + accountInfo + "&externalEmail=" + externalEmail,
                        type: 'GET',
                        async: false,
                        dataType : 'text',
                        success: function(resp) {
                            $('#input_password').remove();
                            var tmpl = '<div id = "input_password">' + '<div class="content">' + '<div class="notice">' +
                                    '<span class="ic_notice ic_network_error"></span>' +
                                    '<p class="desc">' + "${lang.tmpPasswordDesc}" + '</p>' +
                                    '<a href="#" class="btn_major" data-role="button" id="confirm_btn"><span class="txt">'+"${lang.confirm}"+'</span></a>' +
                                    '</div></div></div>';
                            $('#root_div').append(tmpl);
                            $("#confirm_btn").click(function(){
                                self.close();
                            });
                        },
                        error: function(resp){
                            $(".txt_error").remove();;
                            $('#external_email').after("<span class='txt_error'>" + JSON.parse(resp.responseText).message +"</span>");
                            return;
                        }
                    });
                }

                $(".ic_nav_wrap").click(function(){
                    self.close();
                });

            }(jQuery));
        </script>
    </div>
</div>
</body>
</html>