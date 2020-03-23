<?php
	function get_totals($file)
	{
		$data = json_decode(file_get_contents($file), true);
		$list = [];
		
		foreach ($data['locations'] as $totals)
		{
			$c = $totals['country'];
			$i = $totals['latest'];

			if (!isset($list[$c]))
			{
				$list[$c] = $i;
			}
			else
			{
				$list[$c] += $i;
			}
		}

		return $list;
	}	

	function get_totals_yesterday($file)
	{
		$data = json_decode(file_get_contents($file), true);
		$list = [];
		
		foreach ($data['locations'] as $totals)
		{
			$c = $totals['country'];
			$development = [];

			foreach ($totals['history'] as $date => $amount)
			{
				$development[strtotime($date)] = $amount;
			}

			ksort($development);

			$last = array_pop($development);
			$prev_to_last = array_pop($development);
			$i =  $prev_to_last == 0 ? 0 : ($last / $prev_to_last) - 1;

			if (!isset($list[$c]))
			{
				$list[$c] = [
					"change" => $i,
					"yesterday" => $last,
					"day_before_yesterday" => $prev_to_last
				];
			}
			else
			{
				$list[$c]["yesterday"] += $last;
				$list[$c]["day_before_yesterday"] += $prev_to_last;
				$list[$c]["change"] = $list[$c]["day_before_yesterday"] == 0 ? 0 : ($list[$c]["yesterday"] / $list[$c]["day_before_yesterday"]) - 1;
			}
		}

		foreach ($list as $country => &$data)
		{
			$data = $data['change'];
		}

		return $list;
	}
	
	function make_dataset()
	{
		$populations = json_decode(file_get_contents('population.json'), true);
		$fatalities = get_totals('deaths.json');
		$fatalities_change = get_totals_yesterday('deaths.json');
		$infections = get_totals('infected.json');
		$infections_change = get_totals_yesterday('infected.json');
		$fatality_rates = [];
		$infection_chances = [];
		$death_chances = [];

		$data = [];
		
		foreach ($infections as $country => $amount_infections)
		{
			$population          	 =  $populations["$country"] ?? 0;
			$amount_fatalities   	 =  $fatalities["$country"] ?? 0;
			$fatality_rate       	 =  $amount_infections > 0 ? ($amount_fatalities / $amount_infections) : 0;
			$chance_of_infection 	 =  $population > 0 ? ($amount_infections / $population) : 0;
			$chance_of_infection_10  = ($chance_of_infection * 10);
			$chance_of_infection_50  = ($chance_of_infection * 50);
			$chance_of_infection_100 = ($chance_of_infection * 100);

			$data["$country"] = [
				"population" => $population,
				"fatalities" => $amount_fatalities,
				"infections" => $amount_infections,
				"fatality" => round($fatality_rate * 100, 6),
				"chances" => [
					"infection" => [
						"1" => round($chance_of_infection * 100, 8),
						"10" => round($chance_of_infection_10 * 100, 8),
						"50" => round($chance_of_infection_50 * 100, 8),
						"100" => round($chance_of_infection_100 * 100, 8)
					]
				],
				"changes" => [
					"infections" => round($infections_change["$country"] * 100, 8),
					"fatalities" => round($fatalities_change["$country"] * 100, 8)
				]
			];
		}
		file_put_contents('data.json', json_encode($data, JSON_PRETTY_PRINT));
		return $data;
	}
	
	make_dataset();
?>
