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
			$list = json_decode(file_get_contents('data.json'), true);

			uasort($list, function($a, $b) {
			    return $a['fatality'] <=> $b['fatality'];
			});

			$list = array_reverse($list);

			$search = $_GET['c'] ?? '';
			
			echo "<table id='data'>".
					"<thead>".
						"<th data-sort='string'>Country<br><br><input type='text' id='search' placeholder='filter' autofocus value='$search'></input></th>".
						"<th data-sort='int'>Population</th>".
						"<th data-sort='int'>Infections<br>(absolute)</th>".
						"<th data-sort='int'>Infections<br>(change)</th>".
						"<th data-sort='int'>Fatalities<br>(absolute)</th>".
						"<th data-sort='int'>Fatalities<br>(change)</th>".
						"<th data-sort='float'>Fatality</th>".
						"<th data-sort='float'>Chance Of Infection<br>(1 person met)</th>".
						"<th data-sort='float'>Chance Of Infection<br>(10 persons met)</th>".
						"<th data-sort='float'>Chance Of Infection<br>(50 persons met)</th>".
						"<th data-sort='float'>Chance Of Infection<br>(100 persons met)</th>".
					"</thead>".
					"<tbody>";

			$totals = [
				"population" => 0,
				"infections" => 0,
				"fatalities" => 0,
				"fatality" => 0,
				"chances" => [
					"infection" => [
						"1" => 0,
						"10" => 0,
						"50" => 0,
						"100" => 0
					]
				],
				"changes" => [
					"fatalities" => 0,
					"infections" => 0	
				]
			];

			function print_table_row($country, $data)
			{
				switch ("$country")
				{
					case "US":
						$country = 'United States';
						break;

					case "Taiwan*":
						$country = 'Taiwan';
						break;
				}
				
				echo "<tr>".
					"<td>$country</td>".
				 	"<td>" . $data["population"] . "</td>".
				 	"<td>" . $data["infections"] . "</td>".
					"<td>" . sprintf('%d', $data["changes"]["infections"])  . "%</td>".
					"<td>" . $data["fatalities"] . "</td>".
					"<td>" . sprintf('%d', $data["changes"]["fatalities"])  . "%</td>".
					"<td>" . sprintf('%.1f', $data["fatality"])  . "%</td>".
					"<td>" . sprintf('%.2f', $data["chances"]["infection"]["1"])  . "%</td>".
					"<td>" . sprintf('%.2f', $data["chances"]["infection"]["10"])  . "%</td>".
					"<td>" . sprintf('%.2f', $data["chances"]["infection"]["50"])  . "%</td>".
					"<td>" . sprintf('%.2f', $data["chances"]["infection"]["100"])  . "%</td>".
				 "</tr>";
			}

			foreach ($list as $country => $data)
			{
				if ($data['infections'] <= 0 || $data["population"] <= 0)
					continue;

				print_table_row($country, $data);

				$totals['population'] += $data["population"];
				$totals['infections'] += $data["infections"];
				$totals['fatalities'] += $data["fatalities"];
			}

			$totals["fatality"] = $totals['fatalities'] / $totals['infections'];
			$tcoi = ($totals['infections'] / $totals['population']);
			$totals["chances"]["infection"]["1"]   =  $tcoi * 100;
			$totals["chances"]["infection"]["10"]  = ($tcoi * 10) * 100;
			$totals["chances"]["infection"]["50"]  = ($tcoi * 50) * 100;
			$totals["chances"]["infection"]["100"] = ($tcoi * 100) * 100;
			$totals["fatality"] *= 100;
			
			print_table_row('<b>World Wide</b>', $totals);
	
			echo "</tbody></table>";
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
	//search		$('#search').focus().trigger('keydown', {which: 10});	
		</script>
	</body>
</html>
