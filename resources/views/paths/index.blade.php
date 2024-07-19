@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>Find a Path</h1>
        <form action="{{ route('paths.show') }}" method="POST">
            @csrf
            <div class="mb-3">
                <label for="departure_airport_id">Departure Airport</label>
                <select name="departure_airport_id" id="departure_airport_id" class="form-control">
                    @foreach(App\Models\Airport::all() as $airport)
                        <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                    @endforeach
                </select>
            </div>
            <div class="mb-3">
                <label for="arrival_airport_id">Arrival Airport</label>
                <select name="arrival_airport_id" id="arrival_airport_id" class="form-control">
                    @foreach(App\Models\Airport::all() as $airport)
                        <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                    @endforeach
                </select>
            </div>
            <!-- <div class="mb-3">
                <label for="criteria">Order By</label>
                <select name="criteria" id="criteria" class="form-control">
                    <option value="distance">Shortest Distance</option>
                    <option value="cost">Cheapest</option>
                    <option value="time">Shortest Time</option>
                </select>
            </div> -->
            <div class="mb-3">
                <label>Sort Criteria:</label><br>
                <input type="checkbox" name="criteria[]" value="distance" id="distance">
                <label for="distance">Distance</label><br>
                <input type="checkbox" name="criteria[]" value="cost" id="cost">
                <label for="cost">Cost</label><br>
                <input type="checkbox" name="criteria[]" value="time" id="time">
                <label for="time">Time</label><br>
            </div>
            <button type="submit" class="btn btn-primary">Find Path</button>
        </form>
    </div>
@endsection 