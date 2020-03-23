function inList(text, list)
{
	for (var i = 0; i < list.length; i++)
	{
		if (text.indexOf(list[i].trim()) > -1)
			return true;	
	}
	return false;
}

function filterTable(event) {
    var filter = event.target.value.toUpperCase();
    var rows = document.querySelector("#data tbody").rows;
    
    for (var i = 0; i < rows.length; i++) {
        if (inList(rows[i].cells[0].textContent.toUpperCase(), filter.split(','))) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }      
    }
}

$(function(){
	$("table").stupidtable();
});
