<?php

namespace App\Console\Commands\Vaxav;

use Illuminate\Console\Command;

abstract class VaxavCommand extends Command
{
    /**
     * The prefix for all Vaxav commands.
     *
     * @var string
     */
    protected static $commandPrefix = 'vaxav:';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get the command signature with the Vaxav prefix.
     *
     * @param string $signature
     * @return string
     */
    protected static function prefixSignature(string $signature): string
    {
        // If the signature already contains a name (before any arguments/options)
        if (strpos($signature, ' ') !== false) {
            $parts = explode(' ', $signature, 2);
            return static::$commandPrefix . $parts[0] . ' ' . $parts[1];
        }

        return static::$commandPrefix . $signature;
    }
}
