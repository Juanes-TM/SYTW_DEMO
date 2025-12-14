import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,            // Permite usar describe, test, expect sin importarlos
    environment: 'jsdom',     // Simula el navegador
    setupFiles: './test/setupTests.js', // Archivo de configuración inicial
    css: true, 			// Procesa CSS (útil si tus clases afectan la lógica)
  },
})
