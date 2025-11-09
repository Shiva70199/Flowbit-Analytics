import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'flow-blue': '#10294C',
        'flow-green': '#3B82F6',
        'flow-light': '#F3F4F6',
        'flow-text': '#4B5563'
      },
    },
  },
  plugins: [],
};
export default config;