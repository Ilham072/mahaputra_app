import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                brand: {
                    black: '#111111',
                    'black-soft': '#1C1C1C',
                    yellow: {
                        400: '#FACC15',
                        500: '#EAB308',
                        600: '#CA8A04',
                    },
                },
                surface: '#FFFFFF',
                canvas: '#FAFAFA',
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                sm: '6px',
                md: '10px',
                lg: '14px',
            },
            boxShadow: {
                card: '0 1px 2px 0 rgb(17 17 17 / 0.06)',
                floating:
                    '0 12px 32px -12px rgb(17 17 17 / 0.28), 0 4px 12px -6px rgb(17 17 17 / 0.18)',
            },
        },
    },

    plugins: [forms],
};
