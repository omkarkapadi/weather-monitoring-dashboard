export function httpErrorMessage(error) {
  if (error?.status === 429) {
    return "Too many requests. Wait a minute and try again.";
  }
  if (error instanceof TypeError || /failed to fetch/i.test(error?.message || "")) {
    return "You appear to be offline. Check the connection and retry.";
  }
  return error?.message || "Could not load weather.";
}

export async function requestJson(url, { fetchFn = fetch, signal, sleep = delay, retries = 2 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchFn(url, { signal });
      if (response.ok) {
        return response.json();
      }
      lastError = Object.assign(new Error(`Request failed: ${response.status}`), {
        status: response.status,
      });
      if (response.status === 429 || response.status < 500) {
        throw lastError;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }
      lastError = error;
      if (attempt === retries) {
        throw lastError;
      }
    }

    await sleep(200 * 2 ** attempt);
  }

  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
