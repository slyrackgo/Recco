import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './api.js';

describe('API authentication recovery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('clears a rejected token and notifies the auth provider on 401', async () => {
    const values = new Map([['jwtToken', 'expired-token']]);
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };
    const dispatchEvent = vi.fn();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal(
      'Event',
      class TestEvent {
        constructor(type) {
          this.type = type;
        }
      }
    );

    const adapter = vi.fn((config) =>
      Promise.reject({
        config,
        response: { status: 401, config, data: {} },
      })
    );

    await expect(api.get('/users/me', { adapter })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer expired-token');
    expect(storage.getItem('jwtToken')).toBeNull();
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'recco:unauthorized' })
    );
  });
});
