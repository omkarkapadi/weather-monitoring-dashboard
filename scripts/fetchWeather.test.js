import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { fetchAndStore, isDirectRun, loadServiceAccount } from "./fetchWeather.js";

const openWeatherPayload = {
  name: "Pune",
  main: { temp: 26, humidity: 70 },
  wind: { speed: 1.5 },
  weather: [{ description: "light rain", icon: "10d" }],
};

function createFakeDb(addImpl, extras = {}) {
  const set = extras.set || vi.fn().mockResolvedValue();
  const getProfiles = extras.getProfiles || vi.fn().mockResolvedValue({ docs: [] });
  return {
    collection: vi.fn((name) => {
      if (name === "ingestStatus") {
        return { doc: () => ({ set }) };
      }
      if (name === "userProfiles") {
        return { get: getProfiles };
      }
      return { add: addImpl };
    }),
    __set: set,
  };
}

describe("loadServiceAccount", () => {
  it("parses a JSON service account string", () => {
    expect(loadServiceAccount('{"client_email":"sa@demo.iam.gserviceaccount.com"}')).toEqual({
      client_email: "sa@demo.iam.gserviceaccount.com",
    });
  });

  it("throws when the env value is empty", () => {
    expect(() => loadServiceAccount("")).toThrow(
      /GOOGLE_APPLICATION_CREDENTIALS_JSON is required/,
    );
  });

  it("throws when the env value is not JSON", () => {
    expect(() => loadServiceAccount("not-json")).toThrow(/not valid JSON/);
  });
});

describe("fetchAndStore", () => {
  it("fetches, parses, and writes one reading", async () => {
    const add = vi.fn().mockResolvedValue({ id: "abc" });
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => openWeatherPayload,
    });

    const db = createFakeDb(add);
    const stored = await fetchAndStore({
      fetchFn,
      db,
      city: "Pune",
      apiKey: "test-weather-key",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/weather?q=Pune&appid=test-weather-key&units=metric",
    );
    expect(add).toHaveBeenCalledTimes(1);
    const written = add.mock.calls[0][0];
    expect(written.city).toBe("Pune");
    expect(written.temperature).toBe(26);
    expect(written.condition).toBe("light rain");
    expect(written.fetchedAt).toBeInstanceOf(Date);
    expect(stored.temperature).toBe(26);
    expect(db.__set).toHaveBeenCalled();
  });

  it("does not write when the API key is missing", async () => {
    const add = vi.fn();
    await expect(
      fetchAndStore({
        fetchFn: vi.fn(),
        db: createFakeDb(add),
        city: "Pune",
        apiKey: "",
      }),
    ).rejects.toThrow(/OPENWEATHER_API_KEY is required/);
    expect(add).not.toHaveBeenCalled();
  });

  it("does not write when OpenWeather returns an error status", async () => {
    const add = vi.fn();
    await expect(
      fetchAndStore({
        fetchFn: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
        db: createFakeDb(add),
        city: "Pune",
        apiKey: "bad-key",
      }),
    ).rejects.toThrow(/OpenWeather request failed: 401/);
    expect(add).not.toHaveBeenCalled();
  });
});

describe("isDirectRun", () => {
  it("is true when argv points at this module", () => {
    const argv1 = "E:/weather/scripts/fetchWeather.js";
    expect(isDirectRun(pathToFileURL(argv1).href, argv1)).toBe(true);
  });

  it("is false when there is no entry script", () => {
    expect(isDirectRun("file:///tmp/fetchWeather.js", "")).toBe(false);
  });

  it("is false when the path cannot be turned into a file URL", () => {
    expect(isDirectRun("file:///tmp/fetchWeather.js", { not: "a-path" })).toBe(false);
  });
});

describe("runIngest", () => {
  it("initializes Admin SDK from the JSON env var and stores a reading", async () => {
    const add = vi.fn().mockResolvedValue({ id: "doc-1" });
    vi.resetModules();
    vi.doMock("firebase-admin/app", () => ({
      cert: (value) => value,
      initializeApp: vi.fn(() => ({ name: "admin-test" })),
    }));
    vi.doMock("firebase-admin/firestore", () => ({
      getFirestore: () => ({
        collection: (name) => {
          if (name === "userProfiles") {
            return { get: async () => ({ docs: [] }) };
          }
          if (name === "ingestStatus") {
            return { doc: () => ({ set: vi.fn().mockResolvedValue() }) };
          }
          return { add };
        },
      }),
    }));

    const { runIngest: runIngestFresh } = await import("./fetchWeather.js");
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => openWeatherPayload,
    });

    const stored = await runIngestFresh(
      {
        GOOGLE_APPLICATION_CREDENTIALS_JSON: '{"client_email":"sa@demo.iam"}',
        OPENWEATHER_API_KEY: "test-weather-key",
        WEATHER_CITY: "Pune",
      },
      fetchFn,
    );

    expect(stored[0].city).toBe("Pune");
    expect(add).toHaveBeenCalledTimes(1);
    vi.doUnmock("firebase-admin/app");
    vi.doUnmock("firebase-admin/firestore");
  });

  it("fetches every distinct preferred city from user profiles", async () => {
    const add = vi.fn().mockResolvedValue({ id: "doc-2" });
    const set = vi.fn().mockResolvedValue();
    vi.resetModules();
    vi.doMock("firebase-admin/app", () => ({
      cert: (value) => value,
      initializeApp: vi.fn(() => ({ name: "admin-multi" })),
    }));
    vi.doMock("firebase-admin/firestore", () => ({
      getFirestore: () => ({
        collection: (name) => {
          if (name === "userProfiles") {
            return {
              get: async () => ({
                docs: [
                  { data: () => ({ preferredCity: "Pune" }) },
                  { data: () => ({ preferredCity: "Mumbai" }) },
                ],
              }),
            };
          }
          if (name === "ingestStatus") {
            return { doc: () => ({ set }) };
          }
          return { add };
        },
      }),
    }));

    const { runIngest: runIngestFresh } = await import("./fetchWeather.js");
    const fetchFn = vi.fn().mockImplementation(async (url) => ({
      ok: true,
      json: async () => ({
        ...openWeatherPayload,
        name: url.includes("Mumbai") ? "Mumbai" : "Pune",
      }),
    }));

    const stored = await runIngestFresh(
      {
        GOOGLE_APPLICATION_CREDENTIALS_JSON: '{"client_email":"sa@demo.iam"}',
        OPENWEATHER_API_KEY: "test-weather-key",
        WEATHER_CITY: "Pune",
      },
      fetchFn,
    );

    expect(stored.map((reading) => reading.city)).toEqual(["Mumbai", "Pune"]);
    expect(add).toHaveBeenCalledTimes(2);
    vi.doUnmock("firebase-admin/app");
    vi.doUnmock("firebase-admin/firestore");
  });
});
