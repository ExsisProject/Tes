define([
    "backbone"
],
function(
    Backbone
) {

    /**
    *
    * 특정 부서의 문서함 목록을 반환합니다.
    * 
    * 사용자에 의해 생성된 문서함과,
    * 수신문서함/참조문서함/기안완료함과 같은 태그성 문서함을
    * 함께 노출할지 여부 결정 가능함.
    *
    */
    var DeptDocFolderCollection = Backbone.Collection.extend({

        url: function() {
            var url = GO.contextRoot + 'api/approval/deptfolder/' + this.deptId;
            if (this.includingPredefined) {
                url += '?' + $.param({
                    'includingPredefined': this.includingPredefined
                });
            }
            return url;
        },
        
        initialize: function(deptId, includingPredefined) {
            this.deptId = deptId;
            this.includingPredefined = _.isBoolean(includingPredefined) ? includingPredefined : false;
        }
    });

    return DeptDocFolderCollection;
});