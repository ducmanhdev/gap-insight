/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '100%',
                md: '100%',
                lg: '100%',
                xl: '100%',
                '2xl': '100%',
            },
        },
        extend: {
            colors: {
                primary: '#1890ff',
            }
        },
    },
    corePlugins: {
        aspectRatio: false,
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/line-clamp'),
        // require('@tailwindcss/forms'),
        function ({addVariant}) {
            addVariant('child', '& > *');
            addVariant('child-hover', '& > *:hover');
        }
    ],
}
