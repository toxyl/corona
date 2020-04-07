
class URL
{
	static param(name) 
	{
	    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.href);
	    return results == null ? '' : results[1];
	}

	static get()
	{
		var filter = this.param('c');
		var sortCol = this.param('s');
		var sortAscending = this.param('d').toLowerCase() == 'asc';
		if (sortCol == '') sortCol = 8;
		return {
			filter: filter,
			sort: {
				column: sortCol,
				ascending: sortAscending,
			}
		};
	}

	static updateLocation(url)
	{
	    window.history.replaceState({}, location.title, url); // change the URL without reloading the page
	}

	static updateLink(sortInfo)
	{
	    if (sortInfo == undefined) 
	        sortInfo = CoronaTracker.tblData.getSortInfo();
	    var url = location.href.replace(/\?.*/, '') + '?c=' + $('#search').val() + '&s=' + sortInfo.index + '&d=' + sortInfo.direction;
	    this.updateLocation(url);
	    $('#url').text(url);
	}
}
