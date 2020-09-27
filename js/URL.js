
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
		if (sortCol == '') sortCol = 8;
		return {
			filter: filter,
			sort: {
				index: parseInt(sortCol),
				direction: this.param('d').toLowerCase() == 'asc' ? 'asc' : 'desc',
			}
		};
	}

	static updateLocation(url)
	{
	    window.history.replaceState({}, location.title, url); // change the URL without reloading the page
	}

	static updateLink(sortInfo)
	{
	    var url = location.href.replace(/\?.*/, '') + '?c=' + $('#search').val() + '&s=' + sortInfo.index + '&d=' + sortInfo.direction;
	    this.updateLocation(url);
	}
}
