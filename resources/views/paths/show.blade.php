@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>Path Details</h1>
        <div id="map" style="height: 500px; width: 100%;"></div>
         @if($paths)
          @foreach($paths as $criterion => $path)
              @if($path)
              <div class="path-details">
                <h2>Sorted by {{ ucfirst($criterion) }}</h2>
                <strong>Airports:</strong>
                <ul>
                    @foreach($path->airports as $airport)
                        <li>{{ $airport->name }} ({{ $airport->code }})</li>
                        <li>{{ $airport-> latitude }} , {{ $airport-> longitude }}</li>
                    @endforeach
                </ul>
              </div>
            <div>
                <strong>Flights:</strong>
                <ul>
                    @foreach($path->flights as $flight)
                        <li>{{ $flight->flight_number }}: {{ $flight->departureAirport->code }} - {{ $flight->arrivalAirport->code }}</li>
                    @endforeach
                </ul>
            </div>
            <div>
                <strong>Total Cost:</strong> ${{ $path->total_cost }}
            </div>
            <div>
                <strong>Transhipments:</strong> {{ $path->transhipments }}
            </div>
            <div>
                <strong>Final Arrival Time:</strong> {{ $path->final_arrival_time }}
            </div>
            <div>
                  <strong>Total Distance:</strong> {{ number_format($path->total_distance / 1000, 2) }} km
            </div>
            <div>
                  <strong>Total Time:</strong> {{ gmdate('H:i:s', $path->total_time) }}
            </div>
         </div>
         @endif
        @endforeach
       @else
       <p>No paths found.</p>
       @endif
        <a href="{{ route('paths.index') }}" class="btn btn-primary">Back</a>
    </div> 

    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
    <script type="text/javascript">
     let paths = @json($paths['distance']);
// This example creates a 2-pixel-wide red polyline showing
// the path of William Kingsford Smith's first trans-Pacific flight between
// Oakland, CA, and Brisbane, Australia.

function initialize() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(0, -180),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  var map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

    paths.forEach(path => {
    var flightPlanCoordinates = path.airports.map(airport => {
        return {lat: parseFloat(airport.latitude), lng: parseFloat(airport.longitude)};
    });

    var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
     });

  

  flightPath.setMap(map);


});

}

google.maps.event.addDomListener(window, 'load', initialize);

    </script>
@endsection  
