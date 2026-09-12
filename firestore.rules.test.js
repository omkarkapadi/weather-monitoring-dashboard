import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "demo-weather-rules";

let testEnv;

async function seedProfiles() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "userProfiles", "member-uid"), {
      email: "member@college.edu",
      displayName: "Member",
      role: "member",
      preferredCity: "Pune",
    });
    await setDoc(doc(db, "userProfiles", "admin-uid"), {
      email: "omkar.kapadi@mitwpu.edu.in",
      displayName: "Omkar",
      role: "admin",
      preferredCity: "Pune",
    });
    await setDoc(doc(db, "approvedEmails", "member@college.edu"), {
      email: "member@college.edu",
      role: "member",
    });
  });
}

describe("Firestore userProfiles role lock", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await seedProfiles();
  });

  it("rejects a member self-promotion attack to role admin", async () => {
    const member = testEnv.authenticatedContext("member-uid", {
      email: "member@college.edu",
    });

    await assertFails(
      updateDoc(doc(member.firestore(), "userProfiles", "member-uid"), {
        role: "admin",
      }),
    );
  });

  it("allows a member to update display fields when role is unchanged", async () => {
    const member = testEnv.authenticatedContext("member-uid", {
      email: "member@college.edu",
    });

    await assertSucceeds(
      updateDoc(doc(member.firestore(), "userProfiles", "member-uid"), {
        displayName: "Updated Member",
        preferredCity: "Mumbai",
      }),
    );
  });

  it("allows an admin to change another user's role", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {
      email: "omkar.kapadi@mitwpu.edu.in",
    });

    await assertSucceeds(
      updateDoc(doc(admin.firestore(), "userProfiles", "member-uid"), {
        role: "admin",
      }),
    );
  });

  it("does not let a member create themselves as admin", async () => {
    const stranger = testEnv.authenticatedContext("new-uid", {
      email: "new@college.edu",
    });

    await assertFails(
      setDoc(doc(stranger.firestore(), "userProfiles", "new-uid"), {
        email: "new@college.edu",
        role: "admin",
        preferredCity: "Pune",
      }),
    );
  });
});
