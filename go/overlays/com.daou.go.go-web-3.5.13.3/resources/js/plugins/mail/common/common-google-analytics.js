var GoogleAnalytics = function(trackingID, userId) {

	this.trackingID = trackingID;
	this.isInit = false;
	this.userId = userId;

	this.init = function() {
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','/resources/js/plugins/mail/libs/analytics.js','ga');
		isInit = true;
	};

	this.sendPageView = function(pageUrl) {
		if (!this.trackingID || !isInit) {
			return;
		}
		ga('create', this.trackingID, {'userId' : this.userId});
		ga('send', {'hitType': 'pageview', 'page': pageUrl});
	};
};