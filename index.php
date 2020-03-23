<html>
	<head>
		<title>Corona Stats <?= date(DATE_ATOM) ?></title>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="stupidtable.js"></script>
		<link rel="stylesheet" type="text/css" href="style.css">
		<script src="corona.js"></script>
	</head>
	<body>
		<h1>Coronavirus Stats<h1>
		<h3><?= date(DATE_ATOM, filemtime('data.json')) ?></h3>
		<p>
		Be aware that all percentages are only estimates and <b>will not</b> reflect the entire reality of it.<br>
		The chance of infection is based on meeting <b>one</b> person. Therefore the more people you meet, the higher your risk becomes.  This is what you can see reflected in the <b>Chance Of Infection</b> columns.<br>
		The given fatality is based on data reported by medical institutions world-wide, it <b>does not</b> say anything about the fatality if medical care is not available.<br>
		Changes are in regards to the previous data point. In countries where the virus is just starting to spread these numbers won't be very accurate.<br>
		<br>
		Click on the column headers to change the sorting (default is fatality).<br>
		You can search for multiple countries by separating the (partial) names with commas.
		</p>
		<?php
			require_once "data.php";

			$list = json_decode(make_dataset(), true);
			$headers = array_shift($list);

			uasort($list, function($a, $b) {
			    return floatval($a[8]) <=> floatval($b[8]);
			});

			$search = $_GET['c'] ?? '';
			
			echo "\n<table id='data'>\n".
					"\t<thead>\n".
					"\t\t<th data-sort='string'>".$headers[0]."<br><br><input type='text' id='search' placeholder='filter' autofocus value='$search'></input></th>\n".
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
				echo "\t\t<tr>\n".
					 "\t\t\t<td>".$data[0]."</td>\n".
					 "\t\t\t<td>".$data[1]."</td>\n".
					 "\t\t\t<td>".$data[2]."</td>\n".
					 "\t\t\t<td>".$data[3]."</td>\n".
					 "\t\t\t<td>".$data[4]."</td>\n".
					 "\t\t\t<td>".$data[5]."</td>\n".
					 "\t\t\t<td>".$data[6]."</td>\n".
					 "\t\t\t<td>".$data[7]."</td>\n".
					 "\t\t\t<td>".$data[8]."</td>\n".
					 "\t\t\t<td>".$data[9]."</td>\n".
					 "\t\t\t<td>".$data[10]."</td>\n".
					 "\t\t\t<td>".$data[11]."</td>\n".
					 "\t\t\t<td>".$data[12]."</td>\n".
				 	 "\t\t</tr>\n";
			}

			echo "\t</tbody>\n</table>";
		?>
		<p>The data is retrieved using the <a href="https://github.com/ExpDev07/coronavirus-tracker-api">Coronavirus Tracker API</a> and calculated using these formulas:<br>
			<pre>
fatality = (fatalities / infected) * 100
chance of infection = ((infected / population) * people met) * 100
change of infections = ((infections today / infections yesterday) - 1) * 100
change of fatalities = ((fatalities today / fatalities yesterday) - 1) * 100
			</pre>
		</p>				
		<script>
			document.querySelector('#search').addEventListener('keyup', filterTable, false);
			filterTable({ type: "keyup", target: document.querySelector('#search') });
		</script>
	</body>
</html>
