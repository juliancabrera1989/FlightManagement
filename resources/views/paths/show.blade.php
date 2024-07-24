@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>Path Details</h1>
         @if($paths)
         <div id="map" style="height: 100vh; width: 100%;"></div>
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
                  <strong>Total Time:</strong> {{ gmdate('H:i:s', $path->total_time * 60) }} (HH:MM:SS)
                  <!-- <strong>Total Time:</strong> {{ $path->total_time }} -->
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
     
     
     let pathsPrev1 = @json($paths);

    var paths = [];
    Object.values(pathsPrev1).forEach( path => {
      paths.push(path);
    });


    function initialize() {

      var map = new google.maps.Map(document.getElementById('map'));

      var centerX;
      var centerY;

      var n = 0 ;
      var x = 0;
      var y = 0;
      var latitude;
      var longitude;
      var i;
      var planeR = [];

      var animations = [];

      paths.forEach( path => {
        i = 0;
        var flightPlanCoordinates = path.airports.map(airport => {
          latitude = parseFloat(airport.latitude);
          longitude = parseFloat(airport.longitude);
          x += latitude;
          y += longitude;

          if(i != 0 && i != (path.airports.length-1))
          {
            planeR.push({lat: latitude, lng: longitude});
            planeR.push({lat: latitude, lng: longitude});
          }
          else 
          {
            planeR.push({lat: latitude, lng: longitude});
          }
          i++;
          return {lat: latitude, lng: longitude};
        });

        var flightPath = new google.maps.Polyline({
          path: flightPlanCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });    

        centerX = x/(flightPlanCoordinates.length);
        centerY = y/(flightPlanCoordinates.length);
        flightPath.setMap(map);

       
        var j = 0;
        var lista = [];
        animations.push(lista); 
        while (j < planeR.length) {
          lista.push(new google.maps.Marker({
            position: planeR[j],
            map: map,
            icon: {
              url: 'plane.png', // URL of your PNG image
              scaledSize: new google.maps.Size(50, 50), // Adjust size as needed
              anchor: new google.maps.Point(25,25)
            }
          }));

          // console.log(path);
          // console.log(path.flights[j/2]);
          // console.log(path.flights[j/2].departure_time)
          // console.log(path.flights[j/2].arrival_time);
          // console.log(path.flights[j/2].duration);
          // console.log(typeof(path.flights[j/2].departure_time))
          // console.log(typeof(path.flights[j/2].arrival_time));
          // console.log(path.total_time);
          // console.log(path.flights[j/2].duration/path.total_time);
          animateMarker(animations[n][j/2],{lat: planeR[j+0].lat, lng: planeR[j+0].lng},{lat: planeR[j+1].lat, lng: planeR[j+1].lng} , 5000);
          j = j + 2;
          // console.log(j);   
        }
     
        planeR = [];
        n++;
      });

      var mapOptions = {
          zoom: 4,
          center: new google.maps.LatLng(centerX, centerY),
          mapTypeId: google.maps.MapTypeId.TERRAIN
      };

      map.setOptions(mapOptions);

      function animateMarker(marker, startPos, endPos, duration) {
          const steps = 100; // Number of steps in the animation
          const stepDuration = duration / steps;
          let step = 0;

          animationInterval = setInterval(() => {
            if (step >= steps) {
                step=0;
            }

            const fraction = step / steps; 
            const currentPos = google.maps.geometry.spherical.interpolate(startPos, endPos, fraction);  
            
            marker.setPosition(currentPos);
            // console.log(marker);
            step++;
          }, stepDuration);
      }

    } 

google.maps.event.addDomListener(window, 'load', initialize);

    </script>
@endsection  
