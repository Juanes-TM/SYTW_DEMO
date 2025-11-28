// src/hooks/useFisioterapeutas.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFisioterapeutas } from './useFisioterapeutas';

// Mock correcto de la API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '../services/api';

describe('useFisioterapeutas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia cargar fisioterapeutas con especialidades', async () => {
    const mockFisios = [
      { _id: 1, nombre: 'Fisio1', apellido: 'Uno', especialidad: 'Traumatologia' },
      { _id: 2, nombre: 'Fisio2', apellido: 'Dos', especialidad: 'Deportiva' }
    ];
    api.get.mockResolvedValue({ data: mockFisios });

    const { result } = renderHook(() => useFisioterapeutas());

    // Verificar estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.fisios).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verificar estado final - usar fisios en lugar de fisioterapeutas
    expect(result.current.fisios).toEqual(mockFisios);
    expect(api.get).toHaveBeenCalledWith('/api/fisioterapeutas');
  });

  it('deberia manejar error al cargar fisioterapeutas', async () => {
    api.get.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useFisioterapeutas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fisios).toEqual([]);
  });
});