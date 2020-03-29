<?php
	require_once "data.php";

	$search = preg_replace('/[^a-zA-Z-\s\',]/', '', $_GET['c'] ?? '');
	$sort_col = preg_replace('/\D/', '', $_GET['s'] ?? 8);
	$sort_dir = preg_replace('/.*(asc|desc).*/', '$1', $_GET['d'] ?? 'desc');

	$list = json_decode(make_dataset(), true);
	$headers = array_shift($list);

	uasort($list, function($a, $b) use ($sort_col) {
	    return floatval($a[$sort_col]) <=> floatval($b[$sort_col]);
	});

	if ($sort_dir == 'asc')
		$list = array_reverse($list);

	$sort_types = ['', 'int', 'int', 'int', 'float', 'int', 'int', 'float', 'float', 'float', 'float', 'float', 'float'	];
	$search = "<input type='text' id='search' placeholder='filter' autofocus value='$search'></input>";

	$table = "<table id='datatotals' style='width:100%' class='shadow'>\n"; 
	$table .= "<thead><th>Country</th>";
	for ($i = 1; $i < count($headers); $i++)
	{
		$table .= "<th>".$headers[$i]."</th>";
	}
	$table .= "</thead>\n";
	$table .= "<tbody><tr><td>TOTAL</td>".str_repeat("<td></td>", 12)."</tr></tbody>\n</table>\n";
	$table .= "<table id='data' style='width:100%;margin-top: 10px;' class='shadow'>\n<thead><th>$search</th>";
	for ($i = 1; $i < count($headers); $i++)
	{
		$table .= "<th data-sort='".$sort_types[$i]."'>".$headers[$i]."</th>";
	}
	$table .= "</th></thead>\n<tbody>\n";

	while ($data = array_pop($list))
	{
		$table .= "<tr><td>".$data[0]."</td>".str_repeat("<td></td>", 12)."</tr>\n";
	}

	$table .= "</tbody>\n</table>\n";
?>

<html>
	<head>
		<title>COVID-19 Data</title>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/stupidtable/1.1.3/stupidtable.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js"></script>
		<link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Overpass+Mono&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="style.css">
		<script src="corona.js"></script>
		<script src="copy_button.js"></script>
	</head>
	<body>
		<h1 class="full-width shadow">COVID-19 Data</h1>
		<p class="full-width black-box-header shadow">
			Click on the column headers to change the sorting (default is <b>fatality rate</b>).<br>
			You can search for multiple countries by separating the (partial) names with commas.<br>
			Share view: <span id="url"></span> <span id='cpbtn' data-clipboard-target='#url' data-clipboard-text-copy="copy" data-clipboard-text-copied="copied"></span><br>
			<br>
		</p>
		<div class="full-width">
		<?= $table ?>
		</div>
		<div class="full-width shadow" style="background-color: #6b6b6b; height: 122px;margin-top: 10px;">
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
			refreshData();
			attachCopyHandler('#cpbtn');
		</script>
	</body>
</html>
