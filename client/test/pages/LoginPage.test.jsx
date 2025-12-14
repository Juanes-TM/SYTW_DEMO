import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../../src/pages/LoginPage';

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
vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../../src/services/api';

describe('LoginPage', () => {
  
  beforeEach(() => {
    vi.clearAllMocks(); // Limpiar rastros antes de cada test
  });

  test('Debe renderizar el formulario correctamente', () => {
    render(<LoginPage />);

    // Verificamos inputs
    expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    
    // Verificamos el botón
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('Debe permitir escribir en los inputs', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Correo');
    const passwordInput = screen.getByPlaceholderText('Contraseña');

    fireEvent.change(emailInput, { target: { value: 'paciente@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(emailInput.value).toBe('paciente@test.com');
    expect(passwordInput.value).toBe('123456');
  });

  test('Debe mostrar error si se intenta enviar vacío', () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Debes escribir tu contraseña')).toBeInTheDocument();
  });

  test('Debe llamar a la API y redirigir al hacer login correcto', async () => {
    // Configuramos el mock para que la API responda éxito
    api.post.mockResolvedValueOnce({
      data: {
        // Usamos 'cliente' que es el rol estándar en tu sistema, 
        // aunque el 'else' del código lo manejaría igual.
        user: { _id: '1', nombre: 'Test', apellido: 'User', email: 'paciente@test.com', rol: 'cliente' },
        token: 'fake-token-123'
      }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'paciente@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      // Verificar llamada API
      expect(api.post).toHaveBeenCalledWith('/api/login', {
        email: 'paciente@test.com',
        password: '123456'
      });
      
      // Verificar Redux
      expect(mockDispatch).toHaveBeenCalled();
      
      // Verificar redirección
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/paciente');
    });
  });
});