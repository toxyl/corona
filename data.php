<?php
	class CountryData
	{
		public static $country_names_map = null;

		public static function map_country_name(&$name)
		{
			if (self::$country_names_map == null)
				self::$country_names_map = json_decode(file_get_contents('country_names_map.json'), true);

			if (in_array($name, array_keys(self::$country_names_map)))
				$name = self::$country_names_map["$name"];
		}

		public $name;
		public $population;
		public $fatalities;
		public $fatalities_history;
		public $infections;
		public $infections_history;

		public function __construct($country_name)
		{
			self::map_country_name($country_name);

			$this->name = $country_name;
			$this->population = 0;
			$this->infections = 0;
			$this->fatalities = 0;
			$this->infections_history = [ ];
			$this->fatalities_history = [ ];
		}

		public function add_population($amount) { $this->population += $amount; }
		public function add_infections($amount) { $this->infections += $amount; }
		public function add_fatalities($amount) { $this->fatalities += $amount; }
		public function add_infections_to_history($date, $amount) 
		{ 
			if (!isset($this->infections_history[strtotime($date)]))
				$this->infections_history[strtotime($date)] = $amount; 
			else
				$this->infections_history[strtotime($date)] += $amount; 
		}

		public function add_fatalities_to_history($date, $amount) 
		{ 
			if (!isset($this->fatalities_history[strtotime($date)]))
				$this->fatalities_history[strtotime($date)] = $amount; 
			else
				$this->fatalities_history[strtotime($date)] += $amount; 
		}

		public function infection_chance($people_met) { return $this->population == 0 ? 0 : ($this->infections / $this->population) * $people_met; }
		public function fatality_rate() { return $this->fatalities / $this->infections; }

		public function infections_last()
		{
			ksort($this->infections_history);
			$values = array_values($this->infections_history);
			array_pop($values);
			return array_pop($values);
		}

		public function infections_change()
		{
			ksort($this->infections_history);
			$values = array_values($this->infections_history);
			$i = count($values) - 1;
			return $i < 1 || $values[$i - 1] == 0 ? 0 : ($values[$i] / $values[$i - 1]) - 1;
		}

		public function fatalities_last()
		{
			ksort($this->fatalities_history);
			$values = array_values($this->fatalities_history);
			array_pop($values);
			return array_pop($values);
		}

		public function fatalities_change()
		{
			ksort($this->fatalities_history);
			$values = array_values($this->fatalities_history);
			$i = count($values) - 1;
			return $i < 1 || $values[$i - 1] == 0 ? 0 : ($values[$i] / $values[$i - 1]) - 1;
		}

		public function print()
		{
			if ($this->population == 0 || $this->infections == 0)
				return;

			echo "---------------------------------------------\n";
			echo $this->name . "\n";
			echo "---------------------------------------------\n";
			echo "Population:                         " . $this->population . "\n";
			echo "Infections:                         " . $this->infections . " (was " . $this->infections_last() . " = " . round($this->infections_change() * 100,4). "%)\n";
			echo "Fatalities:                         " . $this->fatalities . " (was " . $this->fatalities_last() . " = " . round($this->fatalities_change() * 100,4). "%)\n";
			echo "Fatality:                           " . round($this->fatality_rate()*100,4) . "%\n";
			echo "Infection chance (  1 person  met): " . round($this->infection_chance(1)*100,4) . "%\n";
			echo "Infection chance ( 10 persons met): " . round($this->infection_chance(10)*100,4) . "%\n";
			echo "Infection chance ( 50 persons met): " . round($this->infection_chance(50)*100,4) . "%\n";
			echo "Infection chance (100 persons met): " . round($this->infection_chance(100)*100,4) . "%\n";
		}

		public function html_data()
		{
			return [
				$this->name,
				$this->population,
				$this->infections,
				$this->infections_last(),
				sprintf('%.4f%%', round($this->infections_change() * 100, 4)),
				$this->fatalities,
				$this->fatalities_last(),
				sprintf('%.4f%%', round($this->fatalities_change() * 100, 4)),
				sprintf('%.4f%%', round($this->fatality_rate() * 100, 4)),
				sprintf('%.4f%%', round($this->infection_chance(1) * 100, 4)),
				sprintf('%.4f%%', round($this->infection_chance(10) * 100, 4)),
				sprintf('%.4f%%', round($this->infection_chance(50) * 100, 4)),
				sprintf('%.4f%%', round($this->infection_chance(100) * 100, 4)),
			];
		}

	}

	function get_totals($file)
	{
		$data = json_decode(file_get_contents($file), true);
		$list = [];
		
		foreach ($data['locations'] as $totals)
		{
			$c = $totals['country'];
			$i = $totals['latest'];

			if (!isset($list[$c]) || !isset($list[$c]['amount']))
			{
				$list[$c]['amount'] = $i;
			}
			else
			{
				$list[$c]['amount'] += $i;
			}

			if (!isset($list[$c]['history']))
				$list[$c]['history'] = [];

			foreach ($totals['history'] as $date => $amount)
			{
				if (!isset($list[$c]['history'][$date]))
					$list[$c]['history'][$date] = $amount;
				else
					$list[$c]['history'][$date] += $amount;
			}
		}

		return $list;
	}
	
	function make_dataset()
	{
		if (!file_exists('data_html.json') || filemtime('data.json') < (time() - 60 * 60))
		{
			file_put_contents('infected.json', file_get_contents('https://coronavirus-tracker-api.herokuapp.com/confirmed'));
			file_put_contents('deaths.json',   file_get_contents('https://coronavirus-tracker-api.herokuapp.com/deaths'));

			$populations = json_decode(file_get_contents('population.json'), true);
			$fatalities = get_totals('deaths.json');
			$infections = get_totals('infected.json');

			$objs = [];
			$objs["World Wide"] = new CountryData('World Wide');
			
			foreach ($infections as $country => $country_data)
			{
				$c = $country;
				CountryData::map_country_name($country);
				$population          	 =  $populations["$country"] ?? 0;
				$amount_fatalities   	 =  $fatalities["$c"]['amount'] ?? 0;
				$amount_infections   	 =  $infections["$c"]['amount'] ?? 0;

				if (!isset($objs["$country"]))
				{
					$objs["$country"] = new CountryData($country);
				}

				$objs["$country"]->add_population($population);
				$objs["$country"]->add_infections($amount_infections);
				$objs["$country"]->add_fatalities($amount_fatalities);

				foreach ($fatalities["$c"]['history'] as $key => $value) 
				{
					$objs["$country"]->add_fatalities_to_history($key, $value);
					$objs["World Wide"]->add_fatalities_to_history($key, $value);
				}

				foreach ($infections["$c"]['history'] as $key => $value) 
				{
					$objs["$country"]->add_infections_to_history($key, $value);
					$objs["World Wide"]->add_infections_to_history($key, $value);
				}

				$objs["World Wide"]->add_population($population);
				$objs["World Wide"]->add_infections($amount_infections);
				$objs["World Wide"]->add_fatalities($amount_fatalities);
			}

			$html_data = [];
			$html_data[] = [ 
				"Country",	
				"Population",
				"Infections<br>(current)",
				"Infections<br>(last)",
				"Infections<br>(change)",
				"Fatalities<br>(current)",
				"Fatalities<br>(last)",
				"Fatalities<br>(change)",
				"Fatality Rate",
				"Infection Chance<br>(1 person met)",
				"Infection Chance<br>(10 persons met)",
				"Infection Chance<br>(50 persons met)",
				"Infection Chance<br>(100 persons met)"	
			];
	
			foreach ($objs as $country => $data) 
			{
				if ($data->population <= 0)
					continue;

				$html_data[] = $data->html_data();
			}
	
			file_put_contents('data.json', json_encode($objs, JSON_PRETTY_PRINT));
			file_put_contents('data_html.json', json_encode($html_data, JSON_PRETTY_PRINT));
		}

		return file_get_contents('data_html.json');
	}
?>
