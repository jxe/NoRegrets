// nrpage.js

Page = {
	is_ripe_for_review: function(url) {
		if (this.has_been_reviewed(url)) return false;
		data = NRHistory.query(url);
		if (data.dt < 30*60*1000) return false;
		return data;
	},

	has_been_reviewed: function(url) {
		return !localStorage["review:" + url];
	},

	store_review_data: function(url, review_data){
		localStorage["review:" + url] = JSON.stringify(review_data);
	}
};
