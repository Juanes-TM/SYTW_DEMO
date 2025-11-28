import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import CitasPage from './CitasPage';
import userReducer from '../../../../redux/userSlice';

// Mock de la API
vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '../../../../services/api';

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

describe('CitasPage', () => {
  const mockStore = createMockStore({
    user: {
      user: { rol: 'cliente' },
      loading: false
    }
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('deberia mostrar loading inicialmente', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Nunca resuelve

    renderWithProviders(<CitasPage />);
    
    expect(screen.getByText('Cargando citas...')).toBeInTheDocument();
  });

  it('deberia renderizar la tabla de citas cuando hay datos', async () => {
    const mockCitas = [
      { 
        id: 1, 
        paciente: 'Juan Pérez', 
        fisioterapeuta: 'Dr. García',
        fecha: '2024-01-01',
        hora: '10:00'
      }
    ];
    
    api.get.mockResolvedValue({ data: mockCitas });

    renderWithProviders(<CitasPage />);

    // Esperar a que carguen las citas
    expect(await screen.findByText('📅 Citas')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Dr. García')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('deberia mostrar mensaje cuando no hay citas', async () => {
    api.get.mockResolvedValue({ data: [] });

    renderWithProviders(<CitasPage />);

    expect(await screen.findByText('No hay citas registradas.')).toBeInTheDocument();
  });
});