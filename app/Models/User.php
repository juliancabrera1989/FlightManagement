<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// class User extends Authenticatable
// {
//     use HasFactory, Notifiable;

//     /**
//      * The attributes that are mass assignable.
//      *
//      * @var array<int, string>
//      */
//     protected $fillable = [
//         'name',
//         'email',
//         'password',
//     ];

//     /**
//      * The attributes that should be hidden for serialization.
//      *
//      * @var array<int, string>
//      */
//     protected $hidden = [
//         'password',
//         'remember_token',
//     ];

//     /**
//      * Get the attributes that should be cast.
//      *
//      * @return array<string, string>
//      */
//     protected function casts(): array
//     {
//         return [
//             'email_verified_at' => 'datetime',
//             'password' => 'hashed',
//         ];
//     }
// }

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // protected $fillable = [
    //     'name',
    //     'email',
    //     'password',
    //     'role',   // 🔹 Add role to mass assignment
    // ];

    protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'employee_type',
    'airline_id',
    'airport_id',
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // 🔹 Helper methods
    public function isEmployee() {
        return $this->role === 'employee';
    }

    public function isPassenger() {
        return $this->role === 'passenger';
    }


        /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    public function airline()
    {
        return $this->belongsTo(Airline::class, 'airline_id');
    }

    /**
     * Obtener el aeropuerto base asignado al empleado.
     */
    public function airport()
    {
        return $this->belongsTo(Airport::class, 'airport_id');
    }


}