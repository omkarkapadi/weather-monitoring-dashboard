# Manual check: member cannot self-promote

Use this if `npm run test:rules` cannot start the Firestore emulator (it needs Java). Deploy the repo `firestore.rules` first.

1. Sign in as a **member** (not admin) at http://localhost:5173/login
2. Open DevTools → Console
3. Paste and run:

```js
const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
const db = (await import("/src/firebase.js")).getFirebaseDb();
const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
const uid = getAuth().currentUser.uid;
await updateDoc(doc(db, "userProfiles", uid), { role: "admin" });
```

4. Expected: the promise rejects with `permission-denied` / `PERMISSION_DENIED`.
5. Refresh — the sidebar role pill must still say `member`.

If the write succeeds, Phase 7 is **not done**. Redeploy rules and try again.
