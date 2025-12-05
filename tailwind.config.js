/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#2b2d31",
                surface: "#313338",
                primary: "#5865f2",
                "primary-hover": "#4752c4",
                success: "#23a559",
                error: "#f23f42",
                text: {
                    DEFAULT: "#dbdee1",
                    muted: "#949ba4",
                }
            },
            borderRadius: {
                lg: "8px",
                xl: "16px",
                "2xl": "24px",
            }
        },
    },
    plugins: [],
}
