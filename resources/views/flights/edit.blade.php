@extends('layouts.app')

@section('title', 'Edit Flight #' . $flight->flight_number)

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h1 class="h3 fw-bold text-dark">✏️ Edit Flight Management</h1>
                <a href="{{ route('flights.index') }}" class="btn btn-sm btn-secondary">◀ Back to Radar</a>
            </div>

            <div class="card shadow-sm border-0 p-4">
                <form action="{{ route('flights.update', $flight->id) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="row g-3">
                        
                        <div class="col-md-4">
                            <label class="form-label small fw-bold text-muted">Flight Number</label>
                            <input type="text" class="form-control bg-light" value="{{ $flight->flight_number }}" readonly>
                        </div>

                        <div class="col-md-8">
                            <label class="form-label small fw-bold text-muted">Airline</label>
                            <input type="text" class="form-control bg-light" value="{{ $flight->airline->name }}" readonly>
                        </div>

                        <hr class="my-3 text-muted" style="opacity: 0.15;">

                        @php
                            $isAirportStaff = (auth()->user()->employee_type === 'airport');
                        @endphp

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Origin Airport</label>
                            <select class="form-select bg-light" disabled>
                                <option>{{ $flight->departureAirport->code }} - {{ $flight->departureAirport->name }}</option>
                            </select>
                            <input type="hidden" name="departure_airport_id" value="{{ $flight->departure_airport_id }}">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Destination Airport</label>
                            <select class="form-select bg-light" disabled>
                                <option>{{ $flight->arrivalAirport->code }} - {{ $flight->arrivalAirport->name }}</option>
                            </select>
                            <input type="hidden" name="arrival_airport_id" value="{{ $flight->arrival_airport_id }}">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Departure Time (UTC/Local)</label>
                            <input type="datetime-local" name="departure_time" class="form-control" 
                                   value="{{ \Carbon\Carbon::parse($flight->departure_time)->format('Y-m-d\TH:i') }}"
                                   {{ $isAirportStaff ? 'readonly bg-light' : '' }}>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Arrival Time (UTC/Local)</label>
                            <input type="datetime-local" name="arrival_time" class="form-control" 
                                   value="{{ \Carbon\Carbon::parse($flight->arrival_time)->format('Y-m-d\TH:i') }}"
                                   {{ $isAirportStaff ? 'readonly bg-light' : '' }}>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Ticket Cost ($)</label>
                            <input type="number" name="ticket_cost" class="form-control" step="0.01" value="{{ $flight->ticket_cost }}"
                                   {{ $isAirportStaff ? 'readonly bg-light' : '' }}>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-primary">⚠️ Flight Operational Status</label>
                            <select name="status" class="form-select fw-bold border-primary">
                                <option value="Scheduled" {{ $flight->status === 'Scheduled' ? 'selected' : '' }}>Scheduled</option>
                                <option value="Delayed" {{ $flight->status === 'Delayed' ? 'selected' : '' }}>Delayed</option>
                                <option value="Cancelled" {{ $flight->status === 'Cancelled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                        </div>

                    </div>

                    <div class="mt-4 pt-3 border-top d-flex justify-content-end">
                        <button type="submit" class="btn btn-primary px-4 fw-bold shadow-sm">Save Operational Changes</button>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>
@endsection