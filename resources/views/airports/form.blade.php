<!--Formulario que tendrá los datos en común con create y edit-->
<div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 600px;">
        <div class="card-body p-4">
            <h3 class="text-center mb-4">{{ $modo }} Airport</h3>

            <form>
                @csrf
                <div class="mb-3">
                    <label for="name" class="form-label">Airport Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                </div>

                <div class="mb-3">
                    <label for="code" class="form-label">Airport Code</label>
                    <input type="text" class="form-control" id="code" name="code" required>
                </div>

                <div class="mb-3">
                    <label for="city" class="form-label">City</label>
                    <input type="text" class="form-control" id="city" name="city" required>
                </div>

                <div class="mb-3">
                    <label for="country" class="form-label">Country</label>
                    <input type="text" class="form-control" id="country" name="country" required>
                </div>

                <div class="mb-3">
                    <label for="latitude" class="form-label">Latitude</label>
                    <input type="text" class="form-control" id="latitude" name="latitude" required>
                </div>

                <div class="mb-4">
                    <label for="longitude" class="form-label">Longitude</label>
                    <input type="text" class="form-control" id="longitude" name="longitude" required>
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


