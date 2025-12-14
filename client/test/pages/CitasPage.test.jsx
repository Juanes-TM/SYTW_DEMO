import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CitasPage from '../../src/pages/dashboard/paciente/citas/CitasPage';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '../../src/services/api';

describe('CitasPage', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia mostrar loading inicialmente', () => {
    // Promesa que nunca se resuelve para mantener el estado loading
    api.get.mockImplementation(() => new Promise(() => {})); 

    render(<CitasPage />);
    
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

    render(<CitasPage />);

    // Esperamos a que el loading desaparezca y aparezca el contenido
    await waitFor(() => {
      expect(screen.getByText('📅 Citas')).toBeInTheDocument();
    });

    // Verificamos los datos en la tabla
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Dr. García')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('deberia mostrar mensaje cuando no hay citas', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<CitasPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay citas registradas.')).toBeInTheDocument();
    });
  });
});