<?php

// namespace App\Http\Controllers;

// use App\Services\PathService;
// use Illuminate\Http\Request;

// class PathController extends Controller
// {
//     protected $pathService;

//     public function __construct(PathService $pathService)
//     {
//         $this->pathService = $pathService;
//     }

//     public function index()
//     {
//         return view('paths.index');
//     }

//     public function show(Request $request)
//     {
//         $request->validate([
//             'departure_airport_id' => 'required|exists:airports,id',
//             'arrival_airport_id' => 'required|exists:airports,id'
//         ]);

//         $path = $this->pathService->buildPath($request->departure_airport_id, $request->arrival_airport_id);

//         return view('paths.show', compact('path'));
//     }
// }


namespace App\Http\Controllers;

use App\Services\PathService;
use Illuminate\Http\Request;

class PathController extends Controller
{
    protected $pathService;

    public function __construct(PathService $pathService)
    {
        $this->pathService = $pathService;
    }

    public function index()
    {
        return view('paths.index');
    }

    public function show(Request $request)
    {
        $request->validate([
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'order' => 'nullable|in:distance,cost'
        ]);

        $path = $this->pathService->buildPath($request->departure_airport_id, $request->arrival_airport_id);

        $paths = [$path];

        if ($request->order === 'distance') {
            $paths = $this->pathService->orderPathsByDistance($paths);
        } elseif ($request->order === 'cost') {
            $paths = $this->pathService->orderPathsByCost($paths);
        }

        return view('paths.show', compact('paths'));
    }
}




