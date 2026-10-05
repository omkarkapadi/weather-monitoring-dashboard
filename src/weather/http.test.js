import { describe, expect, it, vi } from "vitest";
import { httpErrorMessage, requestJson } from "./http.js";

describe("httpErrorMessage", () => {
  it("explains a rate limit", () => {
    expect(httpErrorMessage({ status: 429 })).toMatch(/too many requests/i);
  });

  it("explains an offline failure", () => {
    expect(httpErrorMessage(new TypeError("Failed to fetch"))).toMatch(/offline/i);
  });
});

describe("requestJson", () => {
  it("retries a 503 then returns JSON", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      });

    const payload = await requestJson("https://example.test/weather", {
      fetchFn,
      sleep: async () => {},
    });

    expect(payload).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("does not write after abort", async () => {
    const fetchFn = vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }));
    await expect(
      requestJson("https://example.test/weather", { fetchFn, signal: AbortSignal.abort() }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
