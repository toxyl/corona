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

function findRowIDs()
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
	$cell = getCol(row, col);
	$cell.text(val);
	$cell.updateSortVal(val);
}

function toPercent(value)
{
	return Number(value * 100).toFixed(4) + '%';
}

function updateRow(row)
{
	$row = getRow(row);
	
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

	updateColors(row, 2, 100, 1000, 10000);
	updateColors(row, 3, 100, 1000, 10000);
	updateColors(row, 4, 1, 25, 50);
	updateColors(row, 5, 100, 1000, 10000);
	updateColors(row, 6, 100, 1000, 10000);
	updateColors(row, 7, 1, 25, 50);
	updateColors(row, 8, 1, 10, 25);
	updateColors(row, 9, 1, 25, 25);
	updateColors(row, 10, 1, 25, 25);
	updateColors(row, 11, 1, 25, 25);
	updateColors(row, 12, 1, 25, 25);
}

function updateColors(row, cell, low, mid, high)
{
	$cell = getCol(row, cell);
	val = parseFloat($cell.text());
	if ($cell[0] != undefined)
		$cell[0].className = val < low ? 'zero' : (val < mid ? 'low' : (val < high ? 'medium' : 'high'));
}

function updateData(row, infections, infectionsLast, fatalities, fatalitiesLast)
{
	updateCell(row, 2, infections);
	updateCell(row, 3, infectionsLast);
	updateCell(row, 5, fatalities);
	updateCell(row, 6, fatalitiesLast);
	updateRow(row);
}

function refreshData()
{
	console.log('Refreshing data...');
	$.getJSON("data_json.php", function( data ) {
	  var items = [];
	  var rowIDs = findRowIDs();
	  $.each( data, function( key, val ) {
	    row = rowIDs.indexOf(val[0]);
	    updateData(row, val[2], val[3], val[5], val[6]);
	  });
	  $('#data').stupidtable_build();
	  $('#search').keyup();
	});
}

function filterTable(event) {
    var filter = event.target.value.toUpperCase();
    var rows = document.querySelector("#data tbody").rows;

    filter = filter.split(',');

    for (var i = 0; i < rows.length; i++) {
        if (inList(rows[i].cells[0].textContent.toUpperCase(), filter)) 
        {
            rows[i].style.display = "";
        } 
        else 
        {
            rows[i].style.display = "none";
        }      
    }
}

function waitForUpdate(time)
{
	console.log('Waiting '+time+'s before next update...');
	setTimeout(function(){
		console.log('Running update...');
		refreshData();		
		waitForUpdate(time);
	}, time);
}

$(function(){
	$table = $('#data');
	$table.stupidtable_settings({
	    "will_manually_build_table": true
	});
	$('#search').keyup(filterTable);
	waitForUpdate(60000*60); // 60 minutes
});
