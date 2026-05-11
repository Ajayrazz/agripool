<?php
require 'vendor/autoload.php';
use GuzzleHttp\Client;
$client = new Client(['base_uri' => 'http://localhost:8000/api/v1/', 'http_errors' => false]);
$res = $client->post('login', [
    'json' => ['email' => 'ajayrazz.swe.official@gmail.com', 'password' => 'password']
]);
echo "Status: " . $res->getStatusCode() . "\n";
echo "Body: " . $res->getBody() . "\n";
