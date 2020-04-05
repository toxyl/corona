/* low, medium, high */
var colorMaps = [
	[ ],
	[ ],
	[ 100, 1000, 10000],
	[ 100, 1000, 10000],
	[ 1, 25, 50],
	[ 100, 1000, 10000],
	[ 100, 1000, 10000],
	[ 1, 25, 50],
	[ 1, 10, 25],
	[ 1, 25, 50],
	[ 1, 25, 50],
	[ 1, 25, 50],
	[ 1, 25, 50]
];

function inList(text, list)
{
	for (var i = 0; i < list.length; i++)
	{
		if (text.indexOf(list[i].trim()) > -1)
			return true;	
	}
	return false;
}

function getRow(row)
{
	return $("#data").find("tbody tr").eq(row);
}

function getCol(row, col)
{
	return $(row).find("td").eq(col);
}

function mapRowsToIDs()
{
	var rowMap = [];
	var rows = $('#data').stupidtable()[0].rows;
	var i = 1;
  	for (i; i < rows.length; i++) {
		rowMap.push(rows[i].cells[0].textContent);
    }
    return rowMap;
}

function updateCell(row, col, val)
{
	if (Number.isFinite(row))
		row = getRow(row);
		
	$cell = getCol(row, col);
	$cell.text(val);
	$cell.updateSortVal(val);
}

function toPercent(value, max)
{
	value = Number(value * 100);
	if (Number.isNaN(value))
		value = 0;
	else if (!Number.isFinite(value))
		value = 100;

	if (Number.isFinite(max))
		value = Math.min(value, max);

	return value.toFixed(4) + '%';
}

function predictInfections(pop, infCurr, infLast)
{
	pop = parseInt(pop);
	infCurr = parseInt(infCurr);
	infLast = parseInt(infLast);

	if (infCurr == 0 || infLast == 0 || infCurr == infLast)
		return -1;

	var days = 0;
	var daysInfected = 0;
	while (days < 365 && daysInfected == days)
	{
		if (infCurr > 0 && infCurr < pop * 0.9)
		{
			inf = infCurr;
			infCurr = Math.ceil(inf * (inf / infLast));
			infLast = inf;

			daysInfected++;			
		}

		days++;
	}

	return {
		"days": daysInfected,
		"ratio": Math.max(0, infCurr / pop)
	};
}

function updateRow(row)
{
	if (Number.isFinite(row))
		row = getRow(row);
	
	population = getCol(row, 1).text();
	infCurr = getCol(row, 2).text();
	infLast = getCol(row, 3).text();
	updateCell(row, 4, toPercent((infCurr/infLast) - 1));
	fatCurr = getCol(row, 5).text();
	fatLast = getCol(row, 6).text();
	updateCell(row, 7, toPercent((fatCurr/fatLast) - 1));
	updateCell(row, 8, toPercent(fatCurr/infCurr));
	updateCell(row, 9, toPercent(infCurr/population));
	updateCell(row, 10, toPercent((infCurr/population) * 10));
	updateCell(row, 11, toPercent((infCurr/population) * 50));
	updateCell(row, 12, toPercent((infCurr/population) * 100));

	for (var i = 2; i <= $(row)[0].cells.length - 1; i++) 
	{
		updateColors(row, i, colorMaps[i][0], colorMaps[i][1], colorMaps[i][2]);		
	}

	infStats = predictInfections(population, infCurr, infLast);
	tooltipText = "Currently " + toPercent(infCurr / population, 100) + " of the population are infected.";
	if (infStats.days > 0)
		tooltipText += " If the trend continues unchecked " + toPercent(infStats.ratio, 100) + " of the population will be infected in " + infStats.days + " days."

	$(row).attr('data-tooltip', tooltipText);
}

function updateColors(row, cell, low, mid, high)
{
	$cell = getCol(row, cell);
	val = parseFloat($cell.text());
	if ($cell[0] != undefined)
		$cell[0].className = val < low ? 'zero' : (val < mid ? 'low' : (val < high ? 'medium' : 'high'));
}

function updateData(row, population, infections, infectionsLast, fatalities, fatalitiesLast)
{
	updateCell(row, 1, population);
	updateCell(row, 2, infections);
	updateCell(row, 3, infectionsLast);
	updateCell(row, 5, fatalities);
	updateCell(row, 6, fatalitiesLast);
	updateRow(row);
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
    
	updateData(
		document.querySelector("#datatotals tbody").rows[0], 
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
		"index": 		index = asc == desc ? 8 : Math.max(asc, desc),  
		"direction":   	direction = desc >= asc ? 'desc' : 'asc'
	};
}

function updateSort(selector, dontSort)
{
	var sortInfo = getSortInfo(selector);
	if (dontSort != true) sortTable(selector, sortInfo.index, sortInfo.direction);
	updateLink($('#search').val(), sortInfo.index, sortInfo.direction);
	$('#search').keyup();
	adjustTotalsCellWidths();
}

function updateLink(search, index, direction)
{
	$('#url').text(location.href.replace(/\?.*/, '') + '?c=' + search + '&s=' + index + '&d=' + direction);
}

function setLink()
{
	var sortInfo = getSortInfo('#data');
	updateLink($('#search').val(), sortInfo.index, sortInfo.direction);
}
