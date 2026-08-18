<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Airport; // 👈 Importamos el modelo Airport
use App\Models\Airline; // 👈 Importamos el modelo Airline

class AuthController extends Controller
{
    // ... Tus métodos showLoginForm, login y logout se quedan exactamente igual ...
        public function showLoginForm() {
        return view('auth.login');
    }

    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => ['required','email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/'); 
        }

        return back()->with('error','Invalid credentials');
    }
    /**
     * Muestra el formulario de registro alimentando los select dinámicos
     */
    public function showRegisterForm() {
        // Traemos aeropuertos y aerolíneas de la BD para que no de variable indefinida
        $airports = Airport::orderBy('code')->get();
        $airlines = Airline::orderBy('name')->get();

        // Se los pasamos a la vista auth.register con compact()
        return view('auth.register', compact('airports', 'airlines'));
    }

    /**
     * Procesa el registro guardando los datos según el rol elegido
     */
    public function register(Request $request) {
        // 1. Validaciones estrictas incluyendo los nuevos campos condicionales
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
            'role' => 'required|in:passenger,employee',
            
            // Si el rol es empleado, estos campos se vuelven obligatorios bajo ciertas condiciones
            'employee_type' => 'required_if:role,employee|nullable|in:airline,airport',
            'airline_id'    => 'required_if:employee_type,airline|nullable|exists:airlines,id',
            'airport_id'    => 'required_if:employee_type,airport|nullable|exists:airports,id',
        ]);

        // 2. Preparamos los datos base para la creación del usuario
        $userData = [
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ];

        // 3. Si se registró como empleado, le sumamos sus campos específicos
        if ($request->role === 'employee') {
            $userData['employee_type'] = $request->employee_type;
            
            // Si es de aerolínea guardamos su aerolínea, si es de aeropuerto su aeropuerto
            $userData['airline_id'] = $request->employee_type === 'airline' ? $request->airline_id : null;
            $userData['airport_id'] = $request->employee_type === 'airport' ? $request->airport_id : null;
        }

        // 4. Creamos el usuario en la BD (Recordá tener estos campos en el $fillable de User.php)
        $user = User::create($userData);

        // 5. Iniciamos sesión automáticamente y redirigimos
        Auth::login($user);
        return redirect('/');
    }

        public function logout(Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}