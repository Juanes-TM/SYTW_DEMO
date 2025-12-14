import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PacienteDashboard from '../../src/pages/dashboard/paciente/PacienteDashboard';

// Mock de API
vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../../src/services/api';

describe('PacienteDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock del usuario en localStorage
    const mockUser = { user: { nombre: 'Juan' } };
    Storage.prototype.getItem = vi.fn(() => JSON.stringify(mockUser));
  });

  test('Debe mostrar estado de carga inicialmente', () => {
    api.get.mockReturnValue(new Promise(() => {})); 

    render(
      <MemoryRouter>
        <PacienteDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando tu panel/i)).toBeInTheDocument();
  });

  test('Debe renderizar el saludo y estadísticas tras cargar datos', async () => {
    const mockCitas = [
      { id: 1, estado: 'completada', startAt: '2023-01-01' },
      { id: 2, estado: 'completada', startAt: '2023-02-01' },
      { id: 3, estado: 'pendiente', startAt: '2025-12-31' }
    ];
    api.get.mockResolvedValue({ data: mockCitas });

    render(
      <MemoryRouter>
        <PacienteDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tu panel/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Hola, Juan!/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('Debe mostrar "No tienes citas programadas" si no hay citas futuras', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <PacienteDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No tienes citas programadas')).toBeInTheDocument();
    });
  });

  test('Debe mostrar la tarjeta de "Próxima Cita" si existe', async () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1); 

    const mockCitaFutura = {
      _id: '123',
      estado: 'confirmada',
      startAt: fechaFutura.toISOString(),
      fisioterapeuta: { nombre: 'Fisio', apellido: 'Test' }, // Nombre completo "Fisio Test"
      motivo: 'Dolor espalda'
    };

    api.get.mockResolvedValue({ data: [mockCitaFutura] });

    render(
      <MemoryRouter>
        <PacienteDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tu Próxima Cita')).toBeInTheDocument();
    });
    
    // Verificamos que el nombre completo aparezca
    expect(screen.getByText(/Fisio Test/i)).toBeInTheDocument();
    
    // Verificamos el motivo
    expect(screen.getByText(/"Dolor espalda"/i)).toBeInTheDocument();
  });
});