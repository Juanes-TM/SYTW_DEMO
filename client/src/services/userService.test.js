import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile, getHistory } from './userService';

// Mock de la API
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import api from './api';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('deberia obtener el perfil del usuario', async () => {
      const mockUser = { nombre: 'Test User', email: 'test@test.com' };
      api.get.mockResolvedValue({ data: { user: mockUser } });

      const result = await getProfile();

      expect(api.get).toHaveBeenCalledWith('/api/profile');
      expect(result).toEqual(mockUser);
    });

    it('deberia lanzar error cuando falla', async () => {
      api.get.mockRejectedValue(new Error('Error de red'));

      await expect(getProfile()).rejects.toThrow('Error de red');
    });
  });

  describe('updateProfile', () => {
    it('deberia actualizar el perfil exitosamente', async () => {
      const profileData = { nombre: 'Nuevo Nombre', telephone: '123456789' };
      const mockResponse = { data: { user: { ...profileData, id: 1 } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await updateProfile(profileData);

      expect(api.put).toHaveBeenCalledWith('/api/profile/update', profileData);
      expect(result).toEqual({ ok: true, user: mockResponse.data.user });
    });

    it('deberia manejar error en actualizacion', async () => {
      const profileData = { nombre: 'Test' };
      api.put.mockRejectedValue({ 
        response: { data: { msg: 'Error de validación' } } 
      });

      const result = await updateProfile(profileData);

      expect(result).toEqual({ ok: false, msg: 'Error de validación' });
    });
  });

  describe('getHistory', () => {
    it('deberia obtener historial de citas', async () => {
      const mockCitas = [{ id: 1, motivo: 'Consulta' }];
      api.get.mockResolvedValue({ data: { citas: mockCitas } });

      const result = await getHistory();

      expect(api.get).toHaveBeenCalledWith('/api/citas/historial');
      expect(result).toEqual(mockCitas);
    });

    it('deberia retornar array vacio en caso de error', async () => {
      api.get.mockRejectedValue(new Error('Error'));

      const result = await getHistory();

      expect(result).toEqual([]);
    });
  });
});