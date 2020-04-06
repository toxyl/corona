
function inList(text, list)
{
    for (var i = 0; i < list.length; i++)
    {
        if (text.indexOf(list[i].trim()) > -1)
            return true;    
    }
    return false;
}

function adjustTotalsCellWidths()
{
    var ths=$('#data').find('th'); 
    var cell;
    var cellSrc;
    var w=0;
    for (var i=0; i < ths.length; i++) 
    {
        cellSrc = $(ths[i]);
        w = cellSrc.outerWidth();
        cell = $($('#datatotals').find('td')[i]);
        cell.outerWidth(w); 
        cellSrc.outerWidth(w); 
    }
}
 
function filterTable(event) {
    var totals = {
        population: 0,
        infected: 0,
        infected_last: 0,
        dead: 0,
        dead_last: 0
    };
    
    var filter = event.target.value.toUpperCase();
    var rows = document.querySelector("#data tbody").rows;

    filter = filter.split(',');

    for (var i = 0; i < rows.length; i++) {
        if (inList(rows[i].cells[0].textContent.toUpperCase(), filter)) 
        {
            rows[i].style.display = "";
            totals.population += Number(rows[i].cells[1].textContent);
            totals.infected += Number(rows[i].cells[2].textContent);
            totals.infected_last += Number(rows[i].cells[3].textContent);
            totals.dead += Number(rows[i].cells[5].textContent);
            totals.dead_last += Number(rows[i].cells[6].textContent);
        } 
        else 
        {
            rows[i].style.display = "none";
        }      
    }
    
    CoronaTracker.tblTotal.updateData(0,     
        totals.population, 
        totals.infected,
        totals.infected_last,
        totals.dead,
        totals.dead_last
    );

    setLink();
}

function sortTable(selector, index, direction)
{
    $(selector).find("thead th").eq(index).stupidsort(direction);
}

function getSortInfo(selector)
{
    var asc = $(selector).find("thead th.sorting-asc").index();
    var desc = $(selector).find("thead th.sorting-desc").index();

    return { 
        "index":        index = asc == desc ? 8 : Math.max(asc, desc),  
        "direction":    direction = desc >= asc ? 'desc' : 'asc'
    };
}

function updateSort(selector, dontSort)
{
    var sortInfo = getSortInfo(selector);
    if (dontSort != true) sortTable(selector, sortInfo.index, sortInfo.direction);
    setLink(sortInfo);
    $('#search').keyup();
    adjustTotalsCellWidths();
}

function setLink(sortInfo)
{
    if (sortInfo == undefined) 
        sortInfo = getSortInfo('#data');
    var url = location.href.replace(/\?.*/, '') + '?c=' + $('#search').val() + '&s=' + sortInfo.index + '&d=' + sortInfo.direction;
    window.history.replaceState({}, location.title, url); // change the URL without reloading the page
    $('#url').text(url);
}
