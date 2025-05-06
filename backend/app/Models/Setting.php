<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a setting value by name
     *
     * @param string $name
     * @param mixed $default
     * @return mixed
     */
    public static function getValue(string $name, $default = null)
    {
        $setting = self::where('name', $name)->first();

        if (!$setting) {
            return $default;
        }

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value
     *
     * @param string $name
     * @param mixed $value
     * @param string $type
     * @param string|null $description
     * @return Setting
     */
    public static function setValue(string $name, $value, string $type = 'string', ?string $description = null)
    {
        $setting = self::updateOrCreate(
            ['name' => $name],
            [
                'value' => is_array($value) || is_object($value) ? json_encode($value) : $value,
                'type' => $type,
                'description' => $description,
            ]
        );

        return $setting;
    }

    /**
     * Cast value based on type
     *
     * @param string $value
     * @param string $type
     * @return mixed
     */
    protected static function castValue(string $value, string $type)
    {
        switch ($type) {
            case 'int':
            case 'integer':
                return (int) $value;
            case 'float':
            case 'double':
                return (float) $value;
            case 'bool':
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'json':
            case 'array':
                return json_decode($value, true);
            case 'object':
                return json_decode($value);
            default:
                return $value;
        }
    }
}
