<?php
	require_once "data.php";

	$list = json_decode(make_dataset(), true);
	$headers = array_shift($list);
	$data = [];

	uasort($list, function($a, $b) {
	    return $a[0] <=> $b[0];
	});

	foreach ($list as $id => $item)
	{
		$data[] = $item;
	}

	header('Content-Type: application/json');
	echo json_encode($data);
?>
