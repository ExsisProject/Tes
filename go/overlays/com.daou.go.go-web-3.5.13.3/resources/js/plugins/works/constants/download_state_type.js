define("works/constants/download_state_type", function(require) {
	return {
		READY : "READY",	// 대기
		PROGRESS : "PROGRESS",
		DONE : "DONE",
		CANCELED : "CANCELED",
		FILE_DELETED : "FILE_DELETED"
	};
});