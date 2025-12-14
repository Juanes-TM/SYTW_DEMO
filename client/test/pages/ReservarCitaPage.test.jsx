import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ReservarCitaPage from '../../src/pages/dashboard/paciente/citas/reserva/ReservarCitaPage';
import api from '../../src/services/api';

// Mockeamos api
vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('ReservarCitaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // --- CONFIGURACIÓN DEL RELOJ ---
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 0, 1, 8, 0, 0)); 
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Debe cargar la lista de fisios y combinarla con valoraciones', async () => {
    const mockFisios = [{ _id: 'f1', nombre: 'Juan', apellido: 'Fisio', especialidad: 'General' }];
    const mockRatings = { fisios: [{ fisio: { _id: 'f1' }, media: 4.5, reseñas: [] }] };

    api.get.mockImplementation((url) => {
      if (url === '/api/fisioterapeutas') return Promise.resolve({ data: mockFisios });
      if (url === '/api/valoraciones/todas') return Promise.resolve({ data: mockRatings });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ReservarCitaPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Juan Fisio')).toBeInTheDocument();
    expect(await screen.findByText(/4.5/)).toBeInTheDocument();
  });

  test('Debe mostrar agenda al seleccionar un fisio y permitir clic en slot Libre', async () => {
    localStorage.setItem('lastFisioId', 'f1');
    const mockFisios = [{ _id: 'f1', nombre: 'Juan', apellido: 'Fisio' }];

    api.get.mockImplementation((url) => {
      // 1. Carga inicial
      if (url === '/api/fisioterapeutas') return Promise.resolve({ data: mockFisios });
      if (url === '/api/valoraciones/todas') return Promise.resolve({ data: { fisios: [] } });

      // 2. Carga de Agenda
      if (url.includes('/api/citas')) return Promise.resolve({ data: [] });
      
      // Configuración base: Lunes se trabaja de 08:00 a 12:00
      if (url.includes('/api/disponibilidad/semana')) {
        return Promise.resolve({ 
          data: { dias: [{ nombre: 'lunes', horas: [{ inicio: '08:00', fin: '12:00' }] }] } 
        });
      }

      if (url.includes('/api/disponibilidad/intervalos')) {
        return Promise.resolve({ 
          data: { intervalosLibres: [{ inicio: '09:00', fin: '10:00' }] } 
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ReservarCitaPage />
      </MemoryRouter>
    );

    // 1. Esperamos a que cargue el fisio
    expect(await screen.findByText('Juan Fisio')).toBeInTheDocument();

    // 2. Buscamos el slot "Libre"
    const slots = await screen.findAllByText('Libre');
    expect(slots.length).toBeGreaterThan(0);

    // 3. Click y verificación del modal
    fireEvent.click(slots[0]);

    expect(await screen.findByText('Confirmar Reserva')).toBeInTheDocument();
  });
});