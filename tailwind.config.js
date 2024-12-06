module.exports = {
    darkMode: 'class',
    content: ['./**/*.{html,js}'],
    theme: {
        extend: {
            colors: {
                'primary': {
                    DEFAULT: '#ffffff',
                    dark: '#1a1a1a'
                },
                'secondary': {
                    DEFAULT: '#f3f4f6',
                    dark: '#2d2d2d'
                },
                'text': {
                    DEFAULT: '#1f2937',
                    dark: '#e5e7eb'
                },
                'accent': {
                    DEFAULT: '#3b82f6',
                    dark: '#60a5fa'
                }
            },
            animation: {
                'theme-switch': 'themeSwitch 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in': 'fadeIn 0.5s ease-in-out forwards',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                'slide-down': 'slideDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
            },
            keyframes: {
                themeSwitch: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                }
            }
        }
    },
    plugins: []
}; 