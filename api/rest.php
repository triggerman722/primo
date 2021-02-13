<?php

session_start();
$request = explode('/', trim($_REQUEST['path'], '/'));
$resource_name = strtolower($request[1]);
$resource_id="";
if (count($request) > 2)
	$resource_id = strtolower($request[2]);

$http_verb = strtolower($_SERVER['REQUEST_METHOD']);


if ($resource_name == "login")
{

	$tvaBody = file_get_contents('php://input');
	$jsonArray = json_decode($tvaBody, true);

	$username = $jsonArray['username'];
	$password = $jsonArray['password'];

	$tvsUser = file_get_contents('../usr/'.$username.'.json');
	$jsonUser = json_decode($tvsUser, true);

	$crypted = $jsonUser['password'];

	if (password_verify($password, $crypted))
	{
		$_SESSION['username'] = $username;
		header("HTTP/1.0 200 OK");
	}
	else
	{
		unset($_SESSION['username']);
		header('HTTP/1.0 401 Unauthorized');
	}
	die();
}
if ($resource_name == "join")
{

	$tvaBody = file_get_contents('php://input');
	$jsonArray = json_decode($tvaBody, true);

	$username = $jsonArray['username'];
	$password = $jsonArray['password'];
	$tvsFile = "../usr/".$username.".json";
	if (file_exists($tvsFile))
	{
		header("HTTP/1.0 403 Forbidden");
		die();
	}
	symlink($tvsFile, "../usr/role/post.changepassword/".$username.".json");
	symlink($tvsFile, "../usr/role/post.pushnotifications/".$username.".json");
	file_put_contents($tvsFile, '{"password":"'.password_hash($password, PASSWORD_BCRYPT).'"}');
	header("HTTP/1.0 200 OK");
	die();
}

if (!isset($_SESSION['username']))
{
	header('HTTP/1.0 401 Unauthorized');
	die();
}

/*
//so "publish" would make sense, and all known resources, such as contact, etc.
//more specifically, it would be get.contacts or post.pushnotifications

if (!file_exists("../usr/role/".$http_verb.".".$resource_name."/".$_SESSION['username']))
{
	//header('HTTP/1.0 401 Unauthorized');
	//die();
}
*/
if ($resource_name == "logout")
{
	unset($_SESSION['username']);
	header("HTTP/1.0 200 OK");
	die();
}
if ($resource_name == "changepassword")
{
	$tvaBody = file_get_contents('php://input');
	$jsonArray = json_decode($tvaBody, true);

        $username = $_SESSION['username'];
	$password = $jsonArray['password'];
	$newpassword = $jsonArray['newpassword'];
	$confirm = $jsonArray['confirm'];

	$tvsUser = file_get_contents('../usr/'.$username.'.json');
	$jsonUser = json_decode($tvsUser, true);

	$crypted = $jsonUser['password'];

	if ($newpassword != $confirm)
	{
		header('HTTP/1.0 401 Unauthorized');
		die();
	}

	if (password_verify($password, $crypted))
	{
		file_put_contents("../usr/".$username.".json", '{"password":"'.password_hash($newpassword, PASSWORD_BCRYPT).'"}');
		header("HTTP/1.0 200 OK");
		die();
	}
	header('HTTP/1.0 401 Unauthorized');
	die();
}

if ($resource_name == "publish")
{
	if (file_exists("../stage/".$resource_id.".json"))
	{
		copy("../stage/".$resource_id.".json", "../pub/".$resource_id.".json");
	}
	else
	{
		foreach(glob('../stage/*.*') as $file) {
			copy('../stage/'.$file, '../pub/'.$file);
		}
	}
	die();
}

switch ($http_verb)
{	
	case "get":
	{
		$content = file_get_contents("../stage/".$resource_name.".json");
		header('Content-Type: application/json');
		echo $content;
		break;
	}
	case "post":
	{
		if (file_exists("../stage/".$resource_name.".json"))
		{
			header("HTTP/1.0 409 Conflict (Try using PUT).");
			break;
		}
		$tvaBody = file_get_contents('php://input');
		file_put_contents("../stage/".$resource_name.".json", $tvaBody);
		header("HTTP/1.0 201 Created");
		header('Content-Type: application/json');
		echo $tvaBody;
		break;
	}
	case "put":
	{
		$destfile = tempnam("../stage/", $resource_name.".json");
		copy("../stage/".$resource_name.".json", $destfile);
		$tvaBody = file_get_contents('php://input');
		file_put_contents("../stage/".$resource_name.".json", $tvaBody);
		header("HTTP/1.0 200 OK");
		header('Content-Type: application/json');
		echo $tvaBody;
		break;
	}
	case "delete":
	{
		unlink("../stage/".$resource_name.".json");
		unlink("../pub/".$resource_name.".json");
		header("HTTP/1.0 200 OK");
		break;
	}
}



?>
