define("task/components/task_dept_tree/task_dept_tree",function(require){var e=require("task/components/task_dept_tree/views/base_task_dept_tree"),t=require("task/components/task_dept_tree/views/task_dept_tree_menu"),n=require("hgn!task/components/task_dept_tree/templates/task_dept_tree_menu");return{BaseTaskDeptsTreeView:e,TaskDeptsTreeMenuView:t,renderTaskDeptsTreeMenuNode:function(){return n.apply(undefined,arguments)}}});