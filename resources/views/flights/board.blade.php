@extends('layouts.app')

@section('content')
<div class="container">
    <h1 class="text-center mb-4">Flight Information</h1>

    <!-- Filter -->
    <div class="text-center mb-3">
        <a href="{{ route('flights.index', ['type' => 'departures']) }}" 
           class="btn btn-primary">Departures</a>
        <a href="{{ route('flights.index', ['type' => 'arrivals']) }}" 
           class="btn btn-secondary">Arrivals</a>
    </div>

    <!-- Split-Flap Board -->
     
    <div class="flight-board">
        <table class="table table-dark table-striped text-center">
            <thead>
                <tr>
                    <th>Flight</th>
                    <th>Airline</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Gate</th>
                </tr>
            </thead>
            <tbody>
                @foreach($flights as $flight)
                <tr>
                    <td class="flap" data-text="{{ $flight->flight_number }}"></td>
                    <td class="flap" data-text="{{ $flight->airline->name }}"></td>
                    <td class="flap" data-text="{{ $flight->departureAirport->code }}"></td>
                    <td class="flap" data-text="{{ $flight->arrivalAirport->code }}"></td>
                    <td class="flap" data-text="{{ $flight->departure_time->format('H:i') }}"></td>
                    <td class="flap" data-text="{{ strtoupper($flight->status) }}"></td>
                    <td class="flap" data-text="{{ $flight->gate ?? '-' }}"></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
    <!-- <script>
  const flightsFromPHP = @json($flights);
    console.log(flightsFromPHP);
    </script> -->
@endsection

@push('styles')
<style>
    /* Split-Flap Board Styling */
    .flight-board {
        background: #111;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 0 15px rgba(0,0,0,0.8);
    }

    td.flap {
        font-family: 'Courier New', monospace;
        font-size: 1.3rem;
        letter-spacing: 2px;
        color: #0f0;
        white-space: nowrap;
    }

    .flap span {
        display: inline-block;
        perspective: 200px;
    }

    .flap .char {
        display: inline-block;
        transform-origin: center bottom;
        transform: rotateX(0);
        transition: transform 0.2s ease-in-out;
    }

    .flap .char.flipping {
        transform: rotateX(-90deg);
    }


    td.flap {
    font-family: 'Courier New', monospace;
    font-size: 1.3rem;
    letter-spacing: 2px;
    color: white !important;
    white-space: nowrap;
    min-height: 26px;
}

    
</style>
@endpush

@push('scripts')
<script>
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:- ";

    function animateFlap(cell, newText) {
        cell.innerHTML = "";

        [...newText.toUpperCase()].forEach((char, i) => {
            const span = document.createElement("span");
            const div = document.createElement("div");
            div.className = "char";
            div.textContent = chars.includes(char) ? char : " ";
            span.appendChild(div);
            cell.appendChild(span);

            setTimeout(() => flipChar(div, char), i * 100);
        });
    }

    function flipChar(div, targetChar) {
        div.classList.add("flipping");
        setTimeout(() => {
            div.textContent = targetChar;
            div.classList.remove("flipping");
        }, 200);
    }

    // document.addEventListener("DOMContentLoaded", () => {
    //     document.querySelectorAll(".flap").forEach(cell => {
    //         const text = cell.getAttribute("data-text") || "";
    //         animateFlap(cell, text);
    //     });
    // });

    window.addEventListener("load", () => {
    document.querySelectorAll(".flap").forEach(cell => {
        const text = cell.dataset.text || "";
        animateFlap(cell, text);
    });
});

    
</script>
@endpush