import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile, getHistory } from '../../src/services/userService';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import api from '../../src/services/api';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('deberia obtener el perfil del usuario', async () => {
      const mockUser = { nombre: 'Test User', email: 'test@test.com' };
      // Simulamos la estructura exacta que espera tu código: res.data.user
      api.get.mockResolvedValue({ data: { user: mockUser } });

      const result = await getProfile();

      expect(api.get).toHaveBeenCalledWith('/api/profile');
      expect(result).toEqual(mockUser);
    });

    it('deberia lanzar error cuando falla', async () => {
      api.get.mockRejectedValue(new Error('Error de red'));

      // getProfile hace un 'throw err', así que esperamos que el test falle
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
      // Simulamos el objeto de error de Axios
      api.put.mockRejectedValue({ 
        response: { data: { msg: 'Error de validación' } } 
      });

      const result = await updateProfile(profileData);

      // updateProfile captura el error y devuelve { ok: false, msg: ... }
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

      // getHistory captura el error y devuelve []
      const result = await getHistory();

      expect(result).toEqual([]);
    });
  });
});