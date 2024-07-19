<?php

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
            'criteria' =>'required|array|min:1',
            'criteria.*' => 'in:distance,cost,time'
        ]);

        echo "la solicitud enviada es ".$request."<br>";
        echo "El ID del aeropuerto de salida es ".$request->departure_airport_id."<br>";
        echo "El ID del aeropuerto de llegada es  ".$request->arrival_airport_id."<br>";
        print_r($request->criteria);
        echo "<br>"; 

        $paths = $this->pathService->getPaths($request->departure_airport_id, $request->arrival_airport_id, $request->criteria);

        echo "Los caminos se mostraran a continuacion: <br>";
        print_r($paths); 
        echo "<br><br>";
        echo "Y a continuacion se mostraran los caminos uno por uno: <br><br>";
        // for($i=0; $i < sizeof($paths); $i++){
        //     echo $paths[$i]."<br>";
        // }

        foreach($paths as $path){
            foreach($path as $element){
                print_r($element);
                echo "<br>pipripripi";
                echo "<br><br>";
                echo "<br><br>";
            }
            echo "<br><br>";
        }
        return view('paths.show', compact('paths'));
    }
}
?>