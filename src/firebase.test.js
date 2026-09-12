import { describe, expect, it } from "vitest";
import {
  createFirebaseApp,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseConfig,
  getFirebaseDb,
} from "./firebase.js";

const validEnv = {
  VITE_FIREBASE_API_KEY: "test-key",
  VITE_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "demo-project",
  VITE_FIREBASE_STORAGE_BUCKET: "demo-project.appspot.com",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "123",
  VITE_FIREBASE_APP_ID: "1:123:web:abc",
};

describe("getFirebaseConfig", () => {
  it("returns a config object when every VITE_FIREBASE_* value is present", () => {
    expect(getFirebaseConfig(validEnv)).toEqual({
      apiKey: "test-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123",
      appId: "1:123:web:abc",
    });
  });

  it("throws a clear error listing missing keys", () => {
    expect(() =>
      getFirebaseConfig({
        ...validEnv,
        VITE_FIREBASE_API_KEY: "",
        VITE_FIREBASE_PROJECT_ID: undefined,
      }),
    ).toThrow(/Missing Firebase config: apiKey, projectId/);
  });
});

describe("createFirebaseApp", () => {
  it("creates a Firebase app when config is complete", () => {
    const app = createFirebaseApp(validEnv, `test-app-${Date.now()}`);
    expect(app.options.projectId).toBe("demo-project");
  });

  it("does not create an app when config is incomplete", () => {
    expect(() => createFirebaseApp({ VITE_FIREBASE_API_KEY: "only-key" })).toThrow(
      /Missing Firebase config/,
    );
  });
});

describe("Firebase accessors", () => {
  it("reuses one app for Auth and Firestore", () => {
    const app = getFirebaseApp();
    expect(getFirebaseApp()).toBe(app);
    expect(getFirebaseAuth().app).toBe(app);
    expect(getFirebaseDb().app).toBe(app);
  });
});

