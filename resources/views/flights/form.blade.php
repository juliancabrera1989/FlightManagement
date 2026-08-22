<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">
            <div class="card shadow border-0 rounded-3">
                <div class="card-body p-4">
                    
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="fw-bold m-0">
                            {{ $modo == 'Crear' ? '➕ Create Flight' : '✏️ Edit Flight Management' }}
                        </h3>
                        <a href="{{ route('flights.index') }}" class="btn btn-secondary btn-sm shadow-sm">
                            <i class="bi bi-arrow-left"></i> Back to Flights
                        </a>
                    </div>

                    <form action="{{ $modo == 'Crear' ? route('flights.store') : route('flights.update', $flight->id) }}" method="POST">
                        @csrf
                        @if($modo != 'Crear')
                            @method('PUT')
                        @endif

                        {{-- Selector dinámico exclusivo para Empleados de Aeropuerto --}}
                        @if(auth()->user()->isEmployee() && auth()->user()->employee_type === 'airport')
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Operation Type</label>
                                    <select id="operation_type" class="form-select bg-light fw-semibold border-primary">
                                        <option value="departure">Departure (Salida de mi aeropuerto)</option>
                                        <option value="arrival">Arrival (Llegada a mi aeropuerto)</option>
                                    </select>
                                </div>
                            </div>
                        @endif

                        <!-- Fila 1: Número de Vuelo y Aerolínea -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="flight_number" class="form-label fw-semibold">Flight Number</label>
                                <input type="text" class="form-control" id="flight_number" name="flight_number" 
                                       value="{{ old('flight_number', $flight->flight_number ?? '') }}" required placeholder="e.g. UA2304">
                            </div>
                            <div class="col-md-6">
                                <label for="airline_id" class="form-label fw-semibold">Airline</label>

                                {{-- Si el usuario tiene una aerolínea asignada en la BD, la fijamos obligatoriamente --}}
                                @if(auth()->user()->airline_id)
                                    <input type="text" class="form-control" value="{{ auth()->user()->airline->name ?? 'Tu Aerolínea' }}" readonly disabled>
                                    <input type="hidden" name="airline_id" value="{{ auth()->user()->airline_id }}">
                                @else
                                    {{-- Si no tiene aerolínea asignada (ej. Admin o Emp. Aeropuerto), mostramos el desplegable --}}
                                    <select class="form-select" id="airline_id" name="airline_id" required>
                                        <option value="" disabled {{ !isset($flight) ? 'selected' : '' }}>Select Airline</option>
                                        @foreach($airlines as $airline)
                                            <option value="{{ $airline->id }}" {{ old('airline_id', $flight->airline_id ?? '') == $airline->id ? 'selected' : '' }}>
                                                {{ $airline->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                @endif
                            </div>
                        </div>

                        <!-- Fila 2: Aeropuerto Origen y Destino -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="departure_airport_id" class="form-label fw-semibold">Origin Airport</label>
                                <select class="form-select" id="departure_airport_id" name="departure_airport_id" required>
                                    <option value="" disabled {{ !isset($flight) ? 'selected' : '' }}>Select Origin</option>
                                    @foreach($airports as $airport)
                                        <option value="{{ $airport->id }}" {{ old('departure_airport_id', $flight->departure_airport_id ?? '') == $airport->id ? 'selected' : '' }}>
                                            {{ $airport->code }} - {{ $airport->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="arrival_airport_id" class="form-label fw-semibold">Destination Airport</label>
                                <select class="form-select" id="arrival_airport_id" name="arrival_airport_id" required>
                                    <option value="" disabled {{ !isset($flight) ? 'selected' : '' }}>Select Destination</option>
                                    @foreach($airports as $airport)
                                        <option value="{{ $airport->id }}" {{ old('arrival_airport_id', $flight->arrival_airport_id ?? '') == $airport->id ? 'selected' : '' }}>
                                            {{ $airport->code }} - {{ $airport->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <!-- Inputs ocultos para garantizar el envío del ID asignado al empleado de aeropuerto -->
                        @if(auth()->user()->isEmployee() && auth()->user()->employee_type === 'airport')
                            <input type="hidden" id="hidden_departure_airport_id" name="departure_airport_id" value="{{ old('departure_airport_id', $flight->departure_airport_id ?? '') }}">
                            <input type="hidden" id="hidden_arrival_airport_id" name="arrival_airport_id" value="{{ old('arrival_airport_id', $flight->arrival_airport_id ?? '') }}">
                        @endif

                        <!-- Fila 3: Tiempos de Salida y Llegada -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="departure_time" class="form-label fw-semibold">Departure Time (UTC/Local)</label>
                                <input type="datetime-local" class="form-control" id="departure_time" name="departure_time" 
                                       value="{{ old('departure_time', isset($flight) ? \Carbon\Carbon::parse($flight->departure_time)->format('Y-m-d\TH:i') : '') }}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="arrival_time" class="form-label fw-semibold">Arrival Time (UTC/Local)</label>
                                <input type="datetime-local" class="form-control" id="arrival_time" name="arrival_time" 
                                       value="{{ old('arrival_time', isset($flight) ? \Carbon\Carbon::parse($flight->arrival_time)->format('Y-m-d\TH:i') : '') }}" required>
                            </div>
                        </div>

                        <!-- Fila 4: Precio y Estado Operacional -->
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label for="ticket_cost" class="form-label fw-semibold">Ticket Cost ($)</label>
                                <input type="number" step="0.01" class="form-control" id="ticket_cost" name="ticket_cost" 
                                       value="{{ old('ticket_cost', $flight->ticket_cost ?? '') }}" required placeholder="355.00">
                            </div>
                            <div class="col-md-6">
                                <label for="status" class="form-label fw-semibold">⚠️ Flight Operational Status</label>
                                <select class="form-select border-primary" id="status" name="status" required>
                                    @php
                                        $currentStatus = old('status', $flight->status ?? 'Scheduled');
                                        $statuses = ['Scheduled', 'Delayed', 'In Flight', 'Landed', 'Cancelled'];
                                    @endphp
                                    @foreach($statuses as $st)
                                        <option value="{{ $st }}" {{ $currentStatus == $st ? 'selected' : '' }}>
                                            {{ $st }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <!-- Botón Submit -->
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg shadow-sm">
                                {{ $modo == 'Crear' ? 'Create Flight' : 'Save Operational Changes' }}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
</div>

{{-- JS para controlar aeropuertos según tipo de operación --}}
@if(auth()->user()->isEmployee() && auth()->user()->employee_type === 'airport')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const userAirportId = "{{ auth()->user()->airport_id }}";
    const opTypeSelect = document.getElementById('operation_type');
    const depSelect = document.getElementById('departure_airport_id');
    const arrSelect = document.getElementById('arrival_airport_id');
    const hiddenDep = document.getElementById('hidden_departure_airport_id');
    const hiddenArr = document.getElementById('hidden_arrival_airport_id');

    function syncHiddenFields() {
        hiddenDep.value = depSelect.value;
        hiddenArr.value = arrSelect.value;
    }

    function updateAirportFields() {
        if (!opTypeSelect) return;

        if (opTypeSelect.value === 'departure') {
            // Salida: Origen congelado a mi aeropuerto
            depSelect.value = userAirportId;
            depSelect.disabled = true;
            depSelect.removeAttribute('name'); // Evitamos enviar duplicado

            arrSelect.disabled = false;
            arrSelect.name = 'arrival_airport_id';
            if (arrSelect.value === userAirportId) arrSelect.value = '';
        } else {
            // Llegada: Destino congelado a mi aeropuerto
            arrSelect.value = userAirportId;
            arrSelect.disabled = true;
            arrSelect.removeAttribute('name');

            depSelect.disabled = false;
            depSelect.name = 'departure_airport_id';
            if (depSelect.value === userAirportId) depSelect.value = '';
        }
        syncHiddenFields();
    }

    opTypeSelect.addEventListener('change', updateAirportFields);
    depSelect.addEventListener('change', syncHiddenFields);
    arrSelect.addEventListener('change', syncHiddenFields);

    updateAirportFields();
});
</script>
@endif