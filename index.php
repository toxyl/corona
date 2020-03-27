<?php
	require_once "data.php";

	function get_css_class($value, $low = 1, $medium = 25, $high = 50)
	{
		$v = floatval($value);
		return $v >= $high ? 'high' : ($v >= $medium ? 'medium' : ($v >= $low ? 'low' : 'zero'));
	}

	$table = '';

	$list = json_decode(make_dataset(), true);
	$headers = array_shift($list);

	uasort($list, function($a, $b) {
	    return floatval($a[8]) <=> floatval($b[8]);
	});

	$search = $_GET['c'] ?? '';
	
	$table .= "\n<table id='data' class='shadow full-width'>\n".
			"\t<thead>\n".
			"\t\t<th><input type='text' id='search' placeholder='filter' autofocus value='$search'></input></th>\n".
			"\t\t<th data-sort='int'>".$headers[1]."</th>\n".
			"\t\t<th data-sort='int'>".$headers[2]."</th>\n".
			"\t\t<th data-sort='int'>".$headers[3]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[4]."</th>\n".
			"\t\t<th data-sort='int'>".$headers[5]."</th>\n".
			"\t\t<th data-sort='int'>".$headers[6]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[7]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[8]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[9]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[10]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[11]."</th>\n".
			"\t\t<th data-sort='float'>".$headers[12]."</th>\n".
			"\t</thead>\n".
			"\t<tbody>\n";

	while ($data = array_pop($list))
	{
		$table .= "\t\t<tr>\n".
			 "\t\t\t<td>".$data[0]."</td>\n".
			 "\t\t\t<td>".$data[1]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[2], 100, 1000, 10000)."'>".$data[2]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[3], 100, 1000, 10000)."'>".$data[3]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[4])."'>".$data[4]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[5], 100, 1000, 10000)."'>".$data[5]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[6], 100, 1000, 10000)."'>".$data[6]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[7])."'>".$data[7]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[8], 1, 10, 25)."'>".$data[8]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[9])."'>".$data[9]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[10])."'>".$data[10]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[11])."'>".$data[11]."</td>\n".
			 "\t\t\t<td class='".get_css_class($data[12])."'>".$data[12]."</td>\n".
		 	 "\t\t</tr>\n";
	}

	$table .= "\t</tbody>\n</table>";
?>


<html>
	<head>
		<title>COVID-19 Data</title>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/stupidtable/1.1.3/stupidtable.min.js"></script>
		<link href="https://fonts.googleapis.com/css?family=Zilla+Slab+Highlight&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Overpass+Mono&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="style.css">
		<script src="corona.js"></script>
	</head>
	<body>
		<h1 class="full-width shadow">COVID-19 Data</h1>
		<p class="full-width black-box-header shadow">
			Click on the column headers to change the sorting (default is <b>fatality rate</b>).<br>
			You can search for multiple countries by separating the (partial) names with commas.
			<br>
			<br>
		</p>
		<?= $table ?>
		<div class="full-width shadow" style="background-color: #6b6b6b; height: 122px;">
			<p style="float: left;text-align: right;padding-left: 20px;">
				Be aware that all percentages are only estimates and <b>will not</b> reflect the entire reality of it.<br>
				The <i>chance of infection</i> is based on meeting <b>one</b> person, but the more you meet, the higher your risk becomes (see <b>Infection Chance</b> columns).<br>
				The given <i>fatality</i> is based on data reported by medical institutions world-wide, it <b>does not</b> say anything about the <i>fatality</i> if medical care is not available.<br>
				Changes are in regards to the previous data point. In countries where the virus is just starting to spread these numbers won't be very accurate.<br>
				The data is updated every hour using the <a href="https://github.com/ExpDev07/coronavirus-tracker-api">Coronavirus Tracker API</a>.
			</p>
			<pre style="float: left;text-align: left;padding-left: 20px;">
Formulas Used
----------------------------------------------------------------------------	
fatality rate        =  (fatalities / infected) * 100
chance of infection  = ((infected / population) * people met) * 100
change of infections = ((infections current / infections last) - 1) * 100
change of fatalities = ((fatalities current / fatalities last) - 1) * 100
			</pre>
		</div>
		<script>
			// document.querySelector('#search').addEventListener('keyup', filterTable, false); 
			// filterTable({ type: "keyup", target: document.querySelector('#search') });
			refreshData();
		</script>
	</body>
</html>
