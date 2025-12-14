// client/src/setupTests.js
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Silenciar ABSOLUTAMENTE TODO
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  //vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'trace').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});