<!--Formulario que tendrá los datos en común con create y edit-->
<div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 650px;">
        <div class="card-body p-4">
            <h3 class="text-center mb-4">{{ $modo }} Flight</h3>

            <form>
                @csrf

                <div class="mb-3">
                    <label for="airline_id" class="form-label">Airline</label>
                    <select class="form-select" id="airline_id" name="airline_id" required>
                        @foreach($airlines as $airline)
                            <option value="{{ $airline->id }}">{{ $airline->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label for="flight_number" class="form-label">Flight Number</label>
                    <input type="text" class="form-control" id="flight_number" name="flight_number" required>
                </div>

                <div class="mb-3">
                    <label for="departure_airport_id" class="form-label">Departure Airport</label>
                    <select class="form-select" id="departure_airport_id" name="departure_airport_id" required>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}">{{ $airport->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label for="arrival_airport_id" class="form-label">Arrival Airport</label>
                    <select class="form-select" id="arrival_airport_id" name="arrival_airport_id" required>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}">{{ $airport->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label for="departure_time" class="form-label">Departure Time</label>
                    <input type="datetime-local" class="form-control" id="departure_time" name="departure_time" required>
                </div>

                <div class="mb-3">
                    <label for="arrival_time" class="form-label">Arrival Time</label>
                    <input type="datetime-local" class="form-control" id="arrival_time" name="arrival_time" required>
                </div>

                <div class="mb-4">
                    <label for="ticket_cost" class="form-label">Ticket Cost</label>
                    <input type="number" class="form-control" id="ticket_cost" name="ticket_cost" required>
                </div>

                <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-primary btn-lg">{{ $modo }} Data</button>
                </div>

                <div class="text-center">
                    <a href="{{ url('flights') }}" class="text-decoration-none">← Back to Flights</a>
                </div>
            </form>
        </div>
    </div>
</div>

