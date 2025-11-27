@extends('layouts.app')

@section('content')
    <div id="board-root"></div>

    @viteReactRefresh
    @vite(['resources/js/boards/App.jsx'])
@endsection