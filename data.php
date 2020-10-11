<?php
	set_time_limit(0);

	function read_float($v, $index)
	{
		return !isset($v[$index]) || $v[$index] == '' ? null : (float)($v[$index]);
	}

	function read_rounded($v, $index, $decimals)
	{
		return !isset($v[$index]) || $v[$index] == '' ? null : round((float)($v[$index]), $decimals);
	}

	function read_int($v, $index)
	{
		return !isset($v[$index]) || $v[$index] == '' ? null : (int)($v[$index]);
	}

	function read_string($v, $index)
	{
		return $v[$index] ?? 'N/A';
	}

	function add_row(&$rows, $r)
	{
		$iso_code 				 = read_string($r, 0);
		$date 					 = read_string($r, 3);

		if ($date == 'N/A')
			return;

		if (!isset($rows[$iso_code]))
		{
			$continent 				 = read_string($r, 1);
			$country 				 = read_string($r, 2);
			
			if ($country == 'International')
				return;

			$population 			 = read_int($r, 26);
			$population_density 	 = read_float($r, 27);
			$median_age 			 = read_float($r, 28);
			$above_65 				 = read_float($r, 29);
			$above_70				 = read_float($r, 30); 
			$life_expectancy		 = read_float($r, 39);
			$human_development_index = read_float($r, 40);
			$hospital_beds			 = (int)(($population / 1000) * read_float($r, 38));

			$rows[$iso_code] = [
				"continent" 					=> $continent,
				"country" 						=> $country,
				"population" => [
					"total" 					=> $population,
					"density" 					=> $population_density,
					"age_distribution" => [
						"median" 				=> $median_age,
						"above_65"				=> $above_65,
						"above_70" 				=> $above_70,
					],
					"life_expectancy" 			=> $life_expectancy,
					"human_development_index" 	=> $human_development_index,
				],
				"hospital_beds" 				=> $hospital_beds,
				"stringency_index" 				=> [ "total" => [] ],
				"cases"  						=> [ "total" => [], "new" => [], "new_smoothed" => [] ],
				"deaths" 						=> [ "total" => [], "new" => [], "new_smoothed" => [] ],
				"tests" 						=> [ "total" => [], "new" => [], "new_smoothed" => [], "per_case" => [], "positive_rate" => [] ]
			];
		}

		$rows[$iso_code]["cases"]["total"][$date] 				= read_int($r, 4);
		$rows[$iso_code]["cases"]["new"][$date]	 				= read_int($r, 5);
		$rows[$iso_code]["cases"]["new_smoothed"][$date] 		= read_int($r, 6);

		$rows[$iso_code]["deaths"]["total"][$date] 				= read_int($r, 7);
		$rows[$iso_code]["deaths"]["new"][$date]	 			= read_int($r, 8);
		$rows[$iso_code]["deaths"]["new_smoothed"][$date] 		= read_int($r, 9);

		$rows[$iso_code]["tests"]["total"][$date] 				= read_int($r, 17);
		$rows[$iso_code]["tests"]["new"][$date] 				= read_int($r, 16);
		$rows[$iso_code]["tests"]["new_smoothed"][$date] 		= read_int($r, 20);
		$rows[$iso_code]["tests"]["per_case"][$date] 			= read_rounded($r, 22, 2);
		$rows[$iso_code]["tests"]["positive_rate"][$date] 		= read_rounded($r, 23, 8);

		$rows[$iso_code]["stringency_index"]["total"][$date] 	= read_float($r, 25);

	}

	function add_rows(&$rows, $data)
	{
		foreach ($data as $row)
		{
			add_row($rows, explode(',', $row));
		}
	}

	function generate_dates_list()
	{
		$dates = [];
		$d = new DateTime('2019-12-31');
		$now = new DateTime('now');
		$now->setTime(0,0,0);

		while ($d->format('U') < $now->format('U'))
		{
			$dates[] = $d->format('Y-m-d');
			$d->modify('+1 days');
		}

		return $dates;
	}

	function add_missing_dates(&$rows)
	{
		$dates = generate_dates_list();

		$iso_codes = array_keys($rows);
		foreach ($iso_codes as $iso_code)
		{
			foreach (["cases","deaths","tests","stringency_index"] as $category)
			{
				foreach ($rows["$iso_code"]["$category"] as $metric => $v2)
				{
					foreach ($dates as $date) 
					{
						if (!isset($rows["$iso_code"]["$category"]["$metric"]["$date"]))
						{
							$rows["$iso_code"]["$category"]["$metric"]["$date"] = null;
						}
					}
				}
			}
		}
	}

	function compress_array(&$rows, $iso_code, $category, $metric)
	{
		# sort on date
		uksort($rows["$iso_code"]["$category"]["$metric"], function ($a, $b) { return strtotime($a) - strtotime($b); });
		$rows["$iso_code"]["$category"]["$metric"] = array_values($rows["$iso_code"]["$category"]["$metric"]);

		$a = $rows["$iso_code"]["$category"]["$metric"];
		$l = count($a);

		# find first index with valid data
		$i = 0;
		while ($i < $l && $a[$i] === null)
		{
			$i++;
		}
		$fidx = min(max(0, $i), $l - 1);

		# first land index with valid data
		$i = $l - 1;
		while ($i >= 0 && $a[$i] === null)
		{
			$i--;
		}
		$lidx = min(max(0, $i), $l - 1);

		# fill everything up to first valid data index with 0
		$i = 0;
		while ($i <= $fidx)
		{
			$a[$i] = 0;
			$i++;
		}

		# fill everything after last valid data index with the last valid value
		$i = $lidx;
		while ($i < $l)
		{
			$a[$i] = $a[$lidx];
			$i++;
		}

		# interpolate gaps
		$gaps = [];
		$i = 0;
		while ($i < $l)
		{
			if ($a[$i] === null)
			{
				$gap_start = $i;
				$gap_end = $i + 1;
				while ($a[$gap_end] === null) {
					$gap_end++;
				}
				$vs = $a[$gap_start - 1];
				$ve = $a[$gap_end];
				$vl = $gap_end - $gap_start + 1;
				$vd = ($ve - $vs) / $vl;
				while ($i < $gap_end) 
				{
					$a[$i] = ($vs += $vd);
					if (in_array($category, [ "cases", "deaths" ]) || (in_array($category, [ "tests" ]) && !in_array($metric, [ "new_smoothed", "per_case", "positive_rate" ])))
						$a[$i] = (int)$a[$i];

					$i++;
				}
			}

			$i++;
		}

		$rows["$iso_code"]["$category"]["$metric"] = $a;
	}

	function compress_arrays(&$rows)
	{
		$iso_codes = array_keys($rows);
		foreach ($iso_codes as $iso_code)
		{
			foreach (["cases","deaths","tests","stringency_index"] as $category)
			{
				$metrics = array_keys($rows["$iso_code"]["$category"]);
				foreach ($metrics as $metric)
				{
					compress_array($rows, $iso_code, $category, $metric);
				}
			}
		}
	}

	function derive_active_and_recovery_data(&$rows, $days = 13)
	{
		$iso_codes = array_keys($rows);
		foreach ($iso_codes as $iso_code)
		{
			if (!isset($rows["$iso_code"]["recovered"]))
				$rows["$iso_code"]["recovered"] = [];

			if (!isset($rows["$iso_code"]["active"]))
				$rows["$iso_code"]["active"] = [];

			foreach (["total", "new", "new_smoothed"] as $index)
			{
				$i = $days;
				$l = count($rows["$iso_code"]["cases"]["total"]);

				$rows["$iso_code"]["recovered"]["$index"] = array_fill(0, $days, 0);
				$rows["$iso_code"]["active"]["$index"] = array_fill(0, $days, 0);

				while ($i < $l)
				{
					$ct 	= $rows["$iso_code"]["cases"]["$index"][$i - $days];
					$ctnow 	= $rows["$iso_code"]["cases"]["$index"][$i];
					$dt 	= $rows["$iso_code"]["deaths"]["$index"][$i];

					$recovered = max(0, $ct - $dt);
					$active = $ctnow - $recovered - $dt;

					$rows["$iso_code"]["recovered"]["$index"][$i] = $recovered;
					$rows["$iso_code"]["active"]["$index"][$i] = $active;

					$i++;
				}
			}
		}
	}

	function needs_update($file) 
	{
		$now = new DateTime('now');
		return !file_exists($file) || filesize($file) < 100 || filemtime($file) < ($now->format('U') - 60*60);
	}

	// load data
	$fout = 'latest.json';
	if (needs_update($fout))
	{
		$f = 'https://covid.ourworldindata.org/data/owid-covid-data.csv';
		$data = explode("\n", file_get_contents($f));
		$headers = array_shift($data);

		add_rows($rows, $data);
		add_missing_dates($rows);
		compress_arrays($rows);
		derive_active_and_recovery_data($rows);

		$rows = json_encode($rows, JSON_NUMERIC_CHECK);
		file_put_contents($fout, $rows);		
	}
	header('Content-Type: application/json');
	echo file_get_contents($fout);
?>
