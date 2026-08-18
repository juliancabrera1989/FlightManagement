<!--Formulario que tendrá los datos en común con create y edit-->
<div class="card shadow-lg border-0 my-2">
    <div class="card-body p-4">
        <h3 class="text-center mb-4 text-dark">{{ $modo }} Airline</h3>

        <div class="mb-3">
            <label for="code" class="form-label text-dark">Airline Code</label>
            <input type="text" class="form-control" id="code" name="code" value="{{ isset($airline->code) ? $airline->code : '' }}" required>
        </div>

        <div class="mb-4">
            <label for="name" class="form-label text-dark">Airline Name</label>
            <input type="text" class="form-control" id="name" name="name" value="{{ isset($airline->name) ? $airline->name : '' }}" required>
        </div>

        <div class="d-grid mb-3">
            <button type="submit" class="btn btn-primary btn-lg">{{ $modo }} Data</button>
        </div>

        <div class="text-center">
            <a href="{{ url('flights') }}" class="text-decoration-none">← Back to Flights</a>
        </div>
    </div>
</div>