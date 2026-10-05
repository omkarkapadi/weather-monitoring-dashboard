export const FORECAST_TTL_MS = 10 * 60 * 1000;
export const GEOCODE_TTL_MS = 2 * 60 * 1000;

export class WeatherCache {
  constructor({ storage, now = () => Date.now() } = {}) {
    this.storage = storage;
    this.now = now;
    this.memory = new Map();
  }

  get(key) {
    const memoryHit = this.#fresh(this.memory.get(key));
    if (memoryHit) {
      return memoryHit.value;
    }

    const raw = this.storage?.getItem(key);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      const fresh = this.#fresh(parsed);
      if (!fresh) {
        this.storage.removeItem(key);
        return null;
      }
      this.memory.set(key, fresh);
      return fresh.value;
    } catch {
      return null;
    }
  }

  set(key, value, ttlMs) {
    const entry = { value, expiresAt: this.now() + ttlMs };
    this.memory.set(key, entry);
    this.storage?.setItem(key, JSON.stringify(entry));
  }

  #fresh(entry) {
    if (!entry || entry.expiresAt <= this.now()) {
      return null;
    }
    return entry;
  }
}
