define("admin/constants/integration_config", function() {
	var DATA_TYPE = {
			STRING : 'STRING',
			HTML : 'HTML',
			XML : 'XML',
			JSON : 'JSON',
			DIRECT_ACCESS : 'DIRECT_ACCESS'
	}
	
	var APPR_STATUS = { // INTEGRATION OUTPUT 탭 별 STATUS
			DRAFT : 'DRAFT',
			CANCEL : 'CANCEL',
			INPROGRESS : 'INPROGRESS',
			APPROVAL : 'APPROVAL',
			RETURN : 'RETURN',
			EVENT : 'EVENT'
	}
	
	var OUTPUT_DATATYPE_TAB = [
			{ 
				tableID : 'DRAFT',
				tabName : 'Drafted'
			},
			{
				tableID : 'CANCEL',
				tabName : 'Cancel Drafted'
			},
			{
				tableID : 'INPROGRESS',
				tabName : 'Activity Complete'
			},
			{
				tableID : 'RETURN',
				tabName : 'Document Return'
			},
			{
				tableID : 'APPROVAL',
				tabName : 'Document Complete'
			}
	]
	
	var PARAM_TYPE = {
			VARIABLE : 'VARIABLE',
			DOCUMENT : 'DOCUMENT'
	}
	
	return {
		DATA_TYPE : DATA_TYPE,
		APPR_STATUS : APPR_STATUS,
		PARAM_TYPE : PARAM_TYPE,
		OUTPUT_DATATYPE_TAB : OUTPUT_DATATYPE_TAB
	};
});