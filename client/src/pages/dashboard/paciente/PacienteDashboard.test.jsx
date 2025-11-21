import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // Necesario porque usas <Link>
import PacienteDashboard from './PacienteDashboard';

describe('PacienteDashboard', () => {
  test('Debe renderizar el título y las opciones principales', () => {
    // Envolvemos en MemoryRouter para que funcionen los <Link>
    render(
      <MemoryRouter>
        <PacienteDashboard />
      </MemoryRouter>
    );

    // Verificar título principal
    expect(screen.getByText('Panel del Paciente')).toBeInTheDocument();

    // Verificar que existen los enlaces clave
    expect(screen.getByText('Ver mis citas')).toBeInTheDocument();
    expect(screen.getByText('Reservar una cita')).toBeInTheDocument();
    expect(screen.getByText('Ver historial de citas')).toBeInTheDocument();
    
    // Verificar atributos de los enlaces (opcional pero recomendado)
    const linkReservar = screen.getByText('Reservar una cita');
    expect(linkReservar.closest('a')).toHaveAttribute('href', '/dashboard/paciente/reservar');
  });
});
