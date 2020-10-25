
class URL
{
    static param(name) 
    {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.href);
        return results == null ? '' : results[1];
    }

    static get()
    {
        var filter = decodeURI(this.param('c')).replace(/[^a-zA-Z0-9\s\[\],]/g, '');
        var sortCol = this.param('s').replace(/[^0-9]/g, '');
        if (sortCol == '') sortCol = 8;
        return {
            filter: filter,
            sort: {
                index: parseInt(sortCol),
                direction: this.param('d').replace(/.*?\b(a|de)sc\b.*/gis, '$1sc').toLowerCase() == 'asc' ? 'asc' : 'desc',
            }
        };
    }

    static updateLocation(url)
    {
        window.history.replaceState({}, location.title, url); // change the URL without reloading the page
    }

    static updateLink(sortInfo)
    {
        var url = location.href.replace(/\?.*/, '') + '?c=' + encodeURI($('#search').val()) + '&s=' + sortInfo.index + '&d=' + sortInfo.direction;
        this.updateLocation(url);
    }
}
