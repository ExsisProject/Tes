define("timeline/views/user/time_approval_progress",function(require){var e=require("backbone"),t=require("hgn!timeline/templates/user/time_approval_progress"),n=require("app"),r=e.View.extend({events:{},className:"progress part_approval start close",initialize:function(e){this.viewModel=e,this.wait=!e.agree,this.approvalName=e.name,this.approvalStatus=e.approvalStatus},render:function(){this.$el.html(t({wait:this.wait,approvalName:this.approvalName,approvalStatus:this.approvalStatus}));if(this.viewModel.startPoint!=0&&!this.viewModel.startPoint){this.$el.hide();return}this.$el.css("left",this.viewModel.startPoint+"%"),this.$el.css("width",this.viewModel.endPoint-this.viewModel.startPoint+"%"),this.wait&&this.$el.addClass("wait")}});return r});