import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';

// --- 1. MOCKS (Simulaciones) ---

// Simulamos react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children }) => <a href="#">{children}</a>,
  };
});

// Simulamos Redux
const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

// Simulamos tu servicio de API (Axios)
// OJO: La ruta debe coincidir con donde importas 'api' en LoginPage
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../services/api'; // Importamos el mock para manipularlo

describe('LoginPage', () => {
  
  beforeEach(() => {
    vi.clearAllMocks(); // Limpiar rastros antes de cada test
  });

  test('Debe renderizar el formulario correctamente', () => {
    render(<LoginPage />);

    // Verificamos que existen los inputs por su placeholder (según tu código)
    expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    
    // Verificamos el botón por su texto
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('Debe permitir escribir en los inputs', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Correo');
    const passwordInput = screen.getByPlaceholderText('Contraseña');

    // Simulamos que el usuario escribe
    fireEvent.change(emailInput, { target: { value: 'paciente@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(emailInput.value).toBe('paciente@test.com');
    expect(passwordInput.value).toBe('123456');
  });

  test('Debe mostrar error si se intenta enviar vacío', () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    // Según tu lógica "validate", debería salir este error
    expect(screen.getByText('Debes escribir tu contraseña')).toBeInTheDocument();
  });

  test('Debe llamar a la API y redirigir al hacer login correcto', async () => {
    // Configuramos el mock para que la API responda éxito
    api.post.mockResolvedValueOnce({
      data: {
        user: { _id: '1', nombre: 'Test', rol: 'paciente' },
        token: 'fake-token-123'
      }
    });

    render(<LoginPage />);

    // Rellenar formulario
    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'paciente@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Esperar a que la promesa se resuelva
    await waitFor(() => {
      // Verificar que se llamó a la API
      expect(api.post).toHaveBeenCalledWith('/api/login', {
        email: 'paciente@test.com',
        password: '123456'
      });
      
      // Verificar que se disparó la acción de Redux
      expect(mockDispatch).toHaveBeenCalled();
      
      // Verificar que redirigió al dashboard de paciente
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/paciente');
    });
  });
});
