import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCitas } from './useCitas';

// Mock correcto de la API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import api from '../services/api';

describe('useCitas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia cargar citas al inicializar', async () => {
    const mockCitas = [{ id: 1, motivo: 'Consulta de prueba' }];
    api.get.mockResolvedValue({ data: mockCitas });

    const { result } = renderHook(() => useCitas());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.citas).toEqual(mockCitas);
    });

    expect(api.get).toHaveBeenCalledWith('/api/citas');
  });

  it('deberia manejar error al cargar citas', async () => {
    api.get.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useCitas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.citas).toEqual([]);
    });
  });
});