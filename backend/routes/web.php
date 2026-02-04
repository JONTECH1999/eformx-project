<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test', function () {
    return response()->json(['message' => 'WEB is working']);
});

// Temporary API probe routed via web to validate Herd setup
Route::get('/api/test', function () {
    return response()->json(['message' => 'API is working']);
});
