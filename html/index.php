<?php
	require_once realpath(dirname(__FILE__)) . "/../data.php";

	$search = preg_replace('/[^a-zA-Z-\s\',]/', '', $_GET['c'] ?? '');
	$sort_col = preg_replace('/\D/', '', $_GET['s'] ?? 8);
	$sort_dir = preg_replace('/.*(asc|desc).*/', '$1', $_GET['d'] ?? 'desc');

	$list = json_decode(make_dataset(), true);
	$headers = array_shift($list);

	# Sort by the given column and direction
	uasort($list, function($a, $b) use ($sort_col) {
	    return floatval($a[$sort_col]) <=> floatval($b[$sort_col]);
	});

	if ($sort_dir == 'asc')
		$list = array_reverse($list);

	# list of sort types for stupidtable.js
	$sort_types = ['', 'int', 'int', 'int', 'float', 'int', 'int', 'float', 'float', 'float', 'float', 'float', 'float'	];
	
	# search box with search term from URL filled in
	$search = "<input type='text' id='search' placeholder='filter' autofocus value='$search'></input>";

	################
	# TOTALS table #
	################
	echo "<table id='datatotals' style='width:100%' class='shadow'>\n"; 
	echo "<thead><th>Country</th>";
	for ($i = 1; $i < count($headers); $i++)
	{
		echo "<th>".$headers[$i]."</th>";
	}
	echo "</thead>\n";
	echo "<tbody><tr><td>TOTAL</td>".str_repeat("<td></td>", 12)."</tr></tbody>\n</table>\n";

	##############
	# DATA table #
	##############
	echo "<table id='data' style='width:100%;margin-top: 10px;' class='shadow'>\n<thead><th>$search</th>";
	for ($i = 1; $i < count($headers); $i++)
	{
		echo "<th data-sort='".$sort_types[$i]."'>".$headers[$i]."</th>";
	}
	echo "</th></thead>\n<tbody>\n";

	while ($data = array_pop($list))
	{
		echo "<tr><td>".$data[0]."</td>".str_repeat("<td></td>", 12)."</tr>\n";
	}

	echo "</tbody>\n</table>\n";
?>
