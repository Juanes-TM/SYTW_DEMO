import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../src/pages/RegisterPage';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

import api from '../../src/services/api';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  test('Debe renderizar todos los inputs', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repetir contraseña')).toBeInTheDocument();
  });

  test('Debe mostrar error si las contraseñas no coinciden', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Rellenar contraseñas diferentes
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: '654321' } });
    
    // Intentar enviar
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  test('Debe llamar a la API y redirigir al registrarse correctamente', async () => {
    api.post.mockResolvedValueOnce({ data: { msg: 'OK' } });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Rellenar formulario válido
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'nuevo@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '600123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/register', expect.objectContaining({
        email: 'nuevo@test.com',
        nombre: 'Test'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});