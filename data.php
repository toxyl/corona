<?php
	set_time_limit(0);

	function read_float($v, $index, $headers)
	{
		if (is_string($index))
			$index = array_search($index, $headers);
		return !isset($v[$index]) || $v[$index] == '' ? null : (float)($v[$index]);
	}

	function read_rounded($v, $index, $decimals, $headers)
	{
		if (is_string($index))
			$index = array_search($index, $headers);
		return !isset($v[$index]) || $v[$index] == '' ? null : round((float)($v[$index]), $decimals);
	}

	function read_int($v, $index, $headers)
	{
		if (is_string($index))
			$index = array_search($index, $headers);
		return !isset($v[$index]) || $v[$index] == '' ? null : (int)($v[$index]);
	}

	function read_string($v, $index, $headers)
	{
		if (is_string($index))
			$index = array_search($index, $headers);
		return $v[$index] ?? 'N/A';
	}

	function add_row(&$rows, $r, $headers)
	{
		$iso 				 					= read_string($r, 'iso_code', $headers);
		$dt 					 				= read_string($r, 'date', $headers);

		if ($dt == 'N/A')
			return;

		if (!isset($rows[$iso]))
		{
			$continent 				 			= read_string($r, 'continent', $headers);
			$country 				 			= read_string($r, 'location', $headers);
			
			if ($country == 'International')
				return;

			$population 			 			= read_int($r, 'population', $headers);
			$population_density 	 			= read_float($r, 'population_density', $headers);
			$median_age 			 			= read_float($r, 'median_age', $headers);
			$above_65 				 			= read_float($r, 'aged_65_older', $headers);
			$above_70				 			= read_float($r, 'aged_70_older', $headers); 
			$life_expectancy		 			= read_float($r, 'life_expectancy', $headers);
			$human_development_index 			= read_float($r, 'human_development_index', $headers);
			$hospital_beds			 			= (int)(($population / 1000) * read_float($r, 'hospital_beds_per_thousand', $headers));

			$rows[$iso] = [
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
				"hosp_patients" 				=> [ "total" => [] ],
				"icu_patients" 					=> [ "total" => [] ],
				"stringency_index" 				=> [ "total" => [] ],
				"cases"  						=> [ "total" => [], "new" => [], "new_smoothed" => [] ],
				"deaths" 						=> [ "total" => [], "new" => [], "new_smoothed" => [] ],
				"tests" 						=> [ "total" => [], "new" => [], "new_smoothed" => [], "per_case" => [], "positive_rate" => [] ]
			];
		}

		$rows[$iso]["cases"]["total"][$dt] 				= read_int($r, 'total_cases', $headers);
		$rows[$iso]["cases"]["new"][$dt]	 			= read_int($r, 'new_cases', $headers);
		$rows[$iso]["cases"]["new_smoothed"][$dt] 		= read_int($r, 'new_cases_smoothed', $headers);

		$rows[$iso]["deaths"]["total"][$dt] 			= read_int($r, 'total_deaths', $headers);
		$rows[$iso]["deaths"]["new"][$dt]	 			= read_int($r, 'new_deaths', $headers);
		$rows[$iso]["deaths"]["new_smoothed"][$dt] 		= read_int($r, 'new_deaths_smoothed', $headers);

		$rows[$iso]["tests"]["total"][$dt] 				= read_int($r, 'total_tests', $headers);
		$rows[$iso]["tests"]["new"][$dt] 				= read_int($r, 'new_tests', $headers);
		$rows[$iso]["tests"]["new_smoothed"][$dt] 		= read_int($r, 'new_tests_smoothed', $headers);
		$rows[$iso]["tests"]["per_case"][$dt] 			= read_rounded($r, 'tests_per_case', 2, $headers);
		$rows[$iso]["tests"]["positive_rate"][$dt] 		= read_rounded($r, 'positive_rate', 8, $headers);

		$rows[$iso]["hosp_patients"]["total"][$dt] 		= read_int($r, 'hosp_patients', $headers);
		$rows[$iso]["icu_patients"]["total"][$dt] 		= read_int($r, 'icu_patients', $headers);
		$rows[$iso]["stringency_index"]["total"][$dt] 	= read_float($r, 'stringency_index', $headers);

	}

	function add_rows(&$rows, $data, $headers)
	{
		$headers = explode(',', $headers);
		foreach ($data as $row)
		{
			add_row($rows, explode(',', $row), $headers);
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
		$categories = [
			"cases",
			"deaths",
			"tests",
			"stringency_index",
			"icu_patients",
			"hosp_patients",
		];

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
		$categories = [
			"cases",
			"deaths",
			"tests",
			"stringency_index",
			"hosp_patients",
			"icu_patients",

		];
		$iso_codes = array_keys($rows);
		foreach ($iso_codes as $iso_code)
		{
			foreach ($categories as $category)
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

	function set_headers($file) 
	{
		$now = new DateTime('now');
		$maxage = (filemtime($file) + 60*60) - $now->format('U');
		header('Content-Type: application/json');
		header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $maxage) . ' GMT');
		header("Cache-Control: max-age=$maxage");
	}

	// load data
	$fout = 'latest.json';
	if (needs_update($fout))
	{
		$f = 'https://covid.ourworldindata.org/data/owid-covid-data.csv';
		$data = explode("\n", file_get_contents($f));
		$headers = array_shift($data);

		add_rows($rows, $data, $headers);
		add_missing_dates($rows);
		compress_arrays($rows);
		derive_active_and_recovery_data($rows);

		$rows = json_encode($rows, JSON_NUMERIC_CHECK);
		file_put_contents($fout, $rows);
	}
	set_headers($fout);
	echo file_get_contents($fout);
?>

