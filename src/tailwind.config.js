/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                crt: {
                    bg: 'var(--crt-bg)',
                    panel: 'var(--crt-panel)',
                    phosphor: 'var(--crt-phosphor)',
                    'phosphor-dim': 'var(--crt-phosphor-dim)',
                    border: 'var(--crt-border)',
                    'border-active': 'var(--crt-border-active)',
                },
            },
            boxShadow: {
                'crt-glow': '0 0 10px var(--crt-phosphor-glow)',
                'crt-glow-sm': '0 0 5px var(--crt-phosphor-glow)',
            },
        },
    },
    plugins: [],
};
