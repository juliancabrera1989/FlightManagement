@extends('layouts.app')

@section('title', 'Flights Management & Finder')

@section('content')
<div class="container py-5">
    
    @if(Session::has('mensaje'))
        <div class="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
            ✨ {{ Session::get('mensaje') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
        <div>
            <h1 class="display-6 fw-bold text-dark" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px;">
                🔍 {{ auth()->user()->role === 'employee' ? 'Staff Control Center' : 'Flights Finder' }}
            </h1>
            <p class="text-muted mb-0">
                @if(auth()->user()->role === 'employee')
                    Connected as: <strong>{{ auth()->user()->employee_type === 'airline' ? auth()->user()->airline->name : 'Airport Base ' . auth()->user()->airport->code }} Staff</strong>
                @else
                    Search your next destination. Review live prices and book instantly.
                @endif
            </p>
        </div>
        
        @if(auth()->user()->role === 'employee')
            <div class="btn-group shadow-sm">
                <a href="{{ route('flights.create') }}" class="btn btn-primary fw-bold">+ Flight</a>
                <a href="{{ route('airports.create') }}" class="btn btn-outline-primary fw-bold">+ Airport</a>
                <a href="{{ route('airlines.create') }}" class="btn btn-outline-primary fw-bold">+ Airline</a>
            </div>
        @endif
    </div>

    <div class="card shadow-sm border-0 p-4 mb-5 bg-light" style="border-radius: 12px;">
        <form action="{{ route('flights.index') }}" method="GET" class="row g-3">
            
            @if(auth()->user()->role === 'employee' && auth()->user()->employee_type === 'airport')
                <div class="col-md-3">
                    <label class="form-label fw-bold small text-secondary">Operation Type</label>
                    <select name="airport_op" class="form-select border-primary fw-bold">
                        <option value="departures" {{ request('airport_op') === 'departures' ? 'selected' : '' }}>🛫 Departures (Salidas)</option>
                        <option value="arrivals" {{ request('airport_op') === 'arrivals' ? 'selected' : '' }}>🛬 Arrivals (Arribos)</option>
                    </select>
                </div>
                <div class="col-md-5">
                    <label class="form-label fw-bold small text-secondary">Connected Airport (Connection)</label>
                    <select name="connected_airport" class="form-select">
                        <option value="">All Airports</option>
                        @foreach($airports as $airport)
                            @if($airport->id !== auth()->user()->airport_id)
                                <option value="{{ $airport->id }}" {{ request('connected_airport') == $airport->id ? 'selected' : '' }}>
                                    {{ $airport->code }} - {{ $airport->name }}
                                </option>
                            @endif
                        @endforeach
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold small text-secondary">Date</label>
                    <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                </div>

            @elseif(auth()->user()->role === 'employee' && auth()->user()->employee_type === 'airline')
                <div class="col-md-4">
                    <label class="form-label fw-bold small text-secondary">Origin Airport</label>
                    <select name="origin" class="form-select">
                        <option value="">All Origins</option>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}" {{ request('origin') == $airport->id ? 'selected' : '' }}>
                                {{ $airport->code }} - {{ $airport->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold small text-secondary">Destination Airport</label>
                    <select name="destination" class="form-select">
                        <option value="">All Destinations</option>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}" {{ request('destination') == $airport->id ? 'selected' : '' }}>
                                {{ $airport->code }} - {{ $airport->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold small text-secondary">Departure Date</label>
                    <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                </div>

            @else
                <div class="col-md-3">
                    <label class="form-label fw-bold small text-secondary">Origin</label>
                    <select name="origin" class="form-select">
                        <option value="">Where from?</option>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}" {{ request('origin') == $airport->id ? 'selected' : '' }}>
                                {{ $airport->code }} - {{ $airport->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold small text-secondary">Destination</label>
                    <select name="destination" class="form-select">
                        <option value="">Where to?</option>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}" {{ request('destination') == $airport->id ? 'selected' : '' }}>
                                {{ $airport->code }} - {{ $airport->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold small text-secondary">Date</label>
                    <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold small text-secondary">Airline</label>
                    <select name="airline" class="form-select">
                        <option value="">All Airlines</option>
                        @foreach($airlines as $airline)
                            <option value="{{ $airline->id }}" {{ request('airline') == $airline->id ? 'selected' : '' }}>
                                {{ $airline->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            @endif

            <div class="col-12 d-flex justify-content-end mt-3">
                <button type="submit" class="btn btn-dark px-5 fw-bold shadow-sm">⚡ Search Radar</button>
            </div>
        </form>
    </div>

    @if(count(request()->query()) === 0)
        <div class="text-center py-5 border rounded bg-white shadow-sm">
            <span style="font-size: 3rem;">🌐</span>
            <h4 class="text-secondary mt-3">Radar Standby</h4>
            <p class="text-muted small">Select your query parameters above and click Search to pull live operational schedules.</p>
        </div>
    @else
        @if(auth()->user()->role === 'employee')
            
            <div class="card shadow-sm border-0 table-responsive" style="border-radius: 8px;">
                <table class="table table-hover align-middle mb-0 text-nowrap">
                    <thead class="table-dark text-uppercase small" style="font-size: 0.8rem; letter-spacing: 0.5px;">
                        <tr>
                            <th>Flight</th>
                            <th>Airline</th>
                            <th>Route</th>
                            <th>Departure (Local)</th>
                            <th>Arrival (Local)</th>
                            <th>Duration</th>
                            <th class="text-center">Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($flights as $flight)
                            <tr>
                                <td class="fw-bold font-monospace text-primary">{{ $flight->flight_number }}</td>
                                <td>{{ $flight->airline->name }}</td>
                                <td>
                                    <span class="badge bg-light text-dark border">{{ $flight->departureAirport->code }}</span>
                                    <span class="text-muted mx-1">➔</span>
                                    <span class="badge bg-light text-dark border">{{ $flight->arrivalAirport->code }}</span>
                                </td>
                                <td class="small">{{ \Carbon\Carbon::parse($flight->departure_time)->format('d M Y, H:i') }}</td>
                                <td class="small">{{ \Carbon\Carbon::parse($flight->arrival_time)->format('d M Y, H:i') }}</td>
                                <td class="text-muted small">{{ $flight->duration }} min</td>
                                <td class="text-center">
                                    @switch($flight->status)
                                        @case('Cancelled') <span class="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill fw-bold">Cancelled</span> @break
                                        @case('Delayed') <span class="badge bg-warning-subtle text-warning px-3 py-1 rounded-pill fw-bold" style="color: #856404; background-color: #fff3cd;">Delayed</span> @break
                                        @default <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-bold">Scheduled</span>
                                    @endswitch
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="{{ route('flights.show', $flight->id) }}" class="btn btn-outline-secondary">👁️</a>
                                        <a href="{{ route('flights.edit', $flight->id) }}" class="btn btn-warning fw-bold">✏️ Edit</a>
                                        <form action="{{ route('flights.destroy', $flight->id) }}" method="POST" style="display:inline;">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn btn-outline-danger" onclick="return confirm('Are you sure?')">🗑️</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <h4>No flights found matching those criteria.</h4>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

        @else
            
            <div class="row g-4">
                @forelse($flights as $flight)
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0 border-start border-4 {{ $flight->status === 'Cancelled' ? 'border-danger' : 'border-primary' }}" style="border-radius: 8px;">
                            <div class="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5 class="card-title mb-0 fw-bold text-dark">{{ $flight->airline->name }}</h5>
                                        <span class="badge bg-secondary font-monospace">{{ $flight->flight_number }}</span>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center bg-white border rounded p-3 text-center mb-3">
                                        <div>
                                            <div class="fw-bold fs-4 text-primary">{{ $flight->departureAirport->code }}</div>
                                            <small class="text-muted d-block text-truncate" style="max-width: 100px;">{{ $flight->departureAirport->name }}</small>
                                        </div>
                                        <div class="text-muted small px-2">
                                            <span class="d-block">{{ $flight->duration }} min</span> ✈️
                                            <hr class="my-1" style="width: 40px; opacity: 0.3;">
                                        </div>
                                        <div>
                                            <div class="fw-bold fs-4 text-success">{{ $flight->arrivalAirport->code }}</div>
                                            <small class="text-muted d-block text-truncate" style="max-width: 100px;">{{ $flight->arrivalAirport->name }}</small>
                                        </div>
                                    </div>
                                    <div class="row g-2 small text-secondary mb-3">
                                        <div class="col-6">
                                            <strong>🛫 Departs:</strong><br>{{ \Carbon\Carbon::parse($flight->departure_time)->format('d M, H:i') }}
                                        </div>
                                        <div class="col-6 text-end">
                                            <strong>🛬 Arrives:</strong><br>{{ \Carbon\Carbon::parse($flight->arrival_time)->format('d M, H:i') }}
                                        </div>
                                    </div>
                                </div>
                                <div class="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                                    <span class="fw-bold text-success fs-4">${{ number_format($flight->ticket_cost, 2) }}</span>
                                    <button class="btn btn-primary btn-sm px-4 fw-bold shadow-sm">Book Seat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-12 text-center py-5">
                        <h4 class="text-muted">No flights match your search query.</h4>
                    </div>
                @endforelse
            </div>
        @endif
    @endif

</div>
@endsection