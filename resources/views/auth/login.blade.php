@extends('layouts.app')

@section('title', 'Login')

@section('content')
<div class="container d-flex justify-content-center align-items-center flex-column" style="min-height: 80vh;">
    <div class="card shadow-sm p-4" style="max-width: 420px; width: 100%;">
        <h3 class="text-center mb-4">Login</h3>

        @if (session('error'))
            <div class="alert alert-danger">{{ session('error') }}</div>
        @endif

        <form method="POST" action="{{ route('login') }}">
            @csrf

            <div class="form-group mb-3">
                <label for="email">Email address</label>
                <input type="email" name="email" class="form-control" required autofocus>
            </div>

            <div class="form-group mb-4">
                <label for="password">Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>

            <button type="submit" class="btn btn-dark w-100">Login</button>

            <div class="text-center mt-3">
                <small>Don't have an account? <a href="{{ route('register') }}">Register here</a></small>
            </div>
        </form>
    </div>
</div>
@endsection
