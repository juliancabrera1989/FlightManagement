<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = ['airline_id', 'departure_airport_id', 'arrival_airport_id', 'flight_number', 'departure_time', 'arrival_time','ticket_cost'];


    public function airline() { return $this->belongsTo(\App\Models\Airline::class); }
    public function departureAirport() { return $this->belongsTo(\App\Models\Airport::class, 'departure_airport_id'); }
    public function arrivalAirport() { return $this->belongsTo(\App\Models\Airport::class, 'arrival_airport_id'); }

    
    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
    ];

    public function getDurationAttribute()
    {
        if ($this->departure_time && $this->arrival_time) {
            return Carbon::parse($this->departure_time)->diffInMinutes(Carbon::parse($this->arrival_time));
        }

        return null;
    }

    public function setDuration()
    {
        $this->attributes['duration'] = $this->getDurationAttribute();
    }

    public static function boot()
    {
        parent::boot();

        static::saving(function ($flight) {
            $flight->setDuration();
        });
    }

    
    
    
    // public function airline()
    // {
    //     return $this->belongsTo(Airline::class);
    // }

    // public function departureAirport()
    // {
    //     return $this->belongsTo(Airport::class, 'departure_airport_id');
    // }

    // public function arrivalAirport()
    // {
    //     return $this->belongsTo(Airport::class, 'arrival_airport_id');
    // }

    public function paths()
    {
        return $this->belongsToMany(Path::class, 'path_flight');
    }
}