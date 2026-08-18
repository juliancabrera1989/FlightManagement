@extends('layouts.app')

@section('title', 'Register')

@section('content')
<div class="container d-flex justify-content-center align-items-center flex-column" style="min-height: 80vh;">
    <div class="card shadow-sm p-4" style="max-width: 480px; width: 100%;">
        <h3 class="text-center mb-4">Register</h3>

        <form method="POST" action="{{ route('register') }}">
            @csrf

            <div class="form-group mb-3">
                <label for="name">Full Name</label>
                <input type="text" name="name" class="form-control" required>
            </div>

            <div class="form-group mb-3">
                <label for="email">Email address</label>
                <input type="email" name="email" class="form-control" required>
            </div>

            <div class="form-group mb-3">
                <label for="password">Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>

            <div class="form-group mb-4">
                <label for="password_confirmation">Confirm Password</label>
                <input type="password" name="password_confirmation" class="form-control" required>
            </div>

            <div class="form-group mb-4">
                <label for="role">Register as</label>
                <select id="roleSelect" name="role" class="form-select" required>
                    <option value="" disabled selected>Select your role...</option>
                    <option value="passenger">Passenger</option>
                    <option value="employee">Employee</option>
                </select>
            </div>

            <div id="employeeFields" class="border p-3 rounded mb-4 bg-light d-none">
                <h6 class="fw-bold mb-3 text-secondary">Staff Workspace</h6>
                
                <div class="form-group mb-3">
                    <label for="employee_type">Workspace Type</label>
                    <select id="employeeTypeSelect" name="employee_type" class="form-select">
                        <option value="" disabled selected>Select workplace type...</option>
                        <option value="airline">Airline Staff</option>
                        <option value="airport">Airport/Ground Staff</option>
                    </select>
                </div>

                <div id="airlineGroup" class="form-group mb-2 d-none">
                    <label for="airline_id">Assigned Airline</label>
                    <select name="airline_id" class="form-select">
                        <option value="" disabled selected>Select Airline...</option>
                        @foreach($airlines as $airline)
                            <option value="{{ $airline->id }}">{{ $airline->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div id="airportGroup" class="form-group mb-2 d-none">
                    <label for="airport_id">Assigned Airport</label>
                    <select name="airport_id" class="form-select">
                        <option value="" disabled selected>Select Airport Base...</option>
                        @foreach($airports as $airport)
                            <option value="{{ $airport->id }}">{{ $airport->code }} - {{ $airport->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-dark w-100">Create Account</button>

            <div class="text-center mt-3">
                <small>Already have an account? <a href="{{ route('login') }}">Login here</a></small>
            </div>
        </form>

        @if ($errors->any())
    <div class="alert alert-danger p-3 mb-4 rounded shadow-sm">
        <h6 class="fw-bold text-danger mb-2">🛑 Validation Failed:</h6>
        <ul class="mb-0 small">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const roleSelect = document.getElementById("roleSelect");
    const employeeFields = document.getElementById("employeeFields");
    const employeeTypeSelect = document.getElementById("employeeTypeSelect");
    const airlineGroup = document.getElementById("airlineGroup");
    const airportGroup = document.getElementById("airportGroup");

    const airlineSelect = airlineGroup.querySelector('select');
    const airportSelect = airportGroup.querySelector('select');

    // Evento al cambiar de Pasajero a Empleado
    roleSelect.addEventListener("change", function () {
        if (this.value === "employee") {
            employeeFields.classList.remove("d-none");
            employeeTypeSelect.setAttribute("required", "required");
        } else {
            employeeFields.classList.add("d-none");
            resetEmployeeSection();
        }
    });

    // Evento al cambiar entre tipo de lugar de trabajo
    employeeTypeSelect.addEventListener("change", function () {
        if (this.value === "airline") {
            airlineGroup.classList.remove("d-none");
            airportGroup.classList.add("d-none");
            
            airlineSelect.setAttribute("required", "required");
            airportSelect.removeAttribute("required");
            airportSelect.value = ""; // Limpia residuo
        } else if (this.value === "airport") {
            airportGroup.classList.remove("d-none");
            airlineGroup.classList.add("d-none");
            
            airportSelect.setAttribute("required", "required");
            airlineSelect.removeAttribute("required");
            airlineSelect.value = ""; // Limpia residuo
        }
    });

    function resetEmployeeSection() {
        employeeTypeSelect.value = "";
        employeeTypeSelect.removeAttribute("required");
        
        airlineGroup.classList.add("d-none");
        airportGroup.classList.add("d-none");
        
        airlineSelect.value = "";
        airportSelect.value = "";
        
        airlineSelect.removeAttribute("required");
        airportSelect.removeAttribute("required");
    }
});
</script>
@endsection



