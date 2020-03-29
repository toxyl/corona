<?php
	require_once "../data.php";

	$list = json_decode(make_dataset(), true);
	array_shift($list);
	$data = [];

	foreach ($list as $id => $item)
	{
		$data[] = $item;
	}

	header('Content-Type: application/json');
	echo json_encode($data);
?>
