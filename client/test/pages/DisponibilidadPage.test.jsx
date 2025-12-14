import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DisponibilidadPage from '../../src/pages/dashboard/fisio/disponibilidad/DisponibilidadPage';
import { useDisponibilidad } from '../../src/hooks/useDisponibilidad';

// 1. Mockeamos el módulo entero del hook
vi.mock('../../src/hooks/useDisponibilidad');

describe('DisponibilidadPage', () => {
  // Definimos la función espía fuera para poder verificarla
  const mockGuardarSemana = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Simular Login de Fisioterapeuta
    const mockUser = { user: { _id: '123', rol: 'fisioterapeuta' } };
    Storage.prototype.getItem = vi.fn(() => JSON.stringify(mockUser));

    // 2. Definimos qué devuelve el hook POR DEFECTO para todos los tests
    useDisponibilidad.mockReturnValue({
      semana: {
        dias: [
          { nombre: 'lunes', horas: [] },
          { nombre: 'martes', horas: [{ inicio: '09:00', fin: '14:00' }] }
        ]
      },
      loading: false,
      guardarSemana: mockGuardarSemana
    });
  });

  test('Debe renderizar los días y horarios cargados', () => {
    render(<DisponibilidadPage />);

    expect(screen.getByText('Disponibilidad Semanal')).toBeInTheDocument();
    
    // Verificar que los inputs tienen el valor correcto
    // Usamos getByDisplayValue que busca en inputs
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
  });

  test('Debe permitir añadir un nuevo intervalo', async () => {
    render(<DisponibilidadPage />);

    // Botón añadir del lunes
    const btnAddLunes = screen.getAllByText('Añadir')[0];
    fireEvent.click(btnAddLunes);

    // Esperamos a que aparezca el nuevo input (09:00 por defecto en tu código)
    await waitFor(() => {
        // getAllByDisplayValue porque ahora habrá más de uno con "09:00"
        const inputs = screen.getAllByDisplayValue('09:00');
        expect(inputs.length).toBeGreaterThan(0);
    });
  });

  test('Debe llamar a guardarSemana al hacer clic en guardar', async () => {
    // Simulamos que guardar funciona
    mockGuardarSemana.mockResolvedValue({});

    render(<DisponibilidadPage />);

    // Hacemos un cambio para activar el botón
    const btnAddLunes = screen.getAllByText('Añadir')[0];
    fireEvent.click(btnAddLunes);

    const btnGuardar = screen.getByText('Guardar disponibilidad');
    expect(btnGuardar).not.toBeDisabled();

    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(mockGuardarSemana).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.getByText(/Éxito:/)).toBeInTheDocument();
  });

  test('Debe bloquear acceso si no es fisioterapeuta', () => {
    const mockUser = { user: { _id: '123', rol: 'cliente' } };
    Storage.prototype.getItem = vi.fn(() => JSON.stringify(mockUser));

    render(<DisponibilidadPage />);
    expect(screen.getByText('No autorizado.')).toBeInTheDocument();
  });
});