define(function(require){var e=require("backbone"),t=require("hgn!system/templates/sync/config_job"),n=require("i18n!admin/nls/admin"),r=require("i18n!nls/commons"),i={label_company_name:n["\ud68c\uc0ac\uba85"],label_company_id:n["\ud68c\uc0ac ID"],label_sync_start_title:n["\ub3d9\uae30\ud654 \uc2dc\uc791"],label_sync_start_question:n["\ub3d9\uae30\ud654\ub97c \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],label_apply_message:n["\uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4."],label_sync_company_select:n["\ud68c\uc0ac \uc120\ud0dd"],label_all:r["\uc804\uccb4"],label_sync_start_button:r["\uc2dc\uc791"]},s=e.View.extend({events:{"click #sync_start_btn":"_syncStart"},initialize:function(){this.companies=this.options.companies},render:function(){var e=this;this.$el.html(t({lang:i,companies:this.companies}))},_syncStart:function(){function s(){$.ajax({contentType:"application/json",method:"PUT",url:r,success:function(){$.goMessage(i.label_apply_message)}})}var e=$("#startCompanies option:selected"),t=e.text(),n=e.val(),r=GO.contextRoot+"ad/api/legacy/sync";n!="ALL"&&(r=r+"?company_id="+n),$.goConfirm(i.label_company_id+" : "+n+" / "+i.label_company_name+" : "+t,i.label_sync_start_question,s)}});return s});