# Security Specification: Ovuline Secure Schema

## 1. Data Invariants

1. **User Ownership**: A user document at `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid` matches `{userId}`.
2. **Cycle Relational Safety**: A cycle document `/users/{userId}/cycles/{cycleId}` can only be read, created, updated, or deleted by the parent user `userId` who is logged in.
3. **Data Integrity (Size & Typings)**: All string fields must have size constraints: names must be <= 128 characters, date strings must be format conforming. Weights and Ages must lie within biological constraints.
4. **No Privilege Escalation**: No client may alter standard fields or inject undocumented custom fields ("Ghost fields").

---

## 2. The "Dirty Dozen" Malicious Exploits

1. **Ghost Field Injection**: Trying to insert `isVerifiedAdmin: true` into the User Profile.
2. **User Spoofing**: Bob trying to write to `/users/alice` with his own credentials.
3. **Unauthenticated Profile Creation**: Anonymous users writing to `/users/any-id`.
4. **ID Poisoning Attack**: Trying to create a profile where `{userId}` is a 10KB string of toxic chars.
5. **Orphaned Cycle Logging**: Attempting to log a period cycle at `/users/bob/cycles/cycle-123` when Bob does not have a registered profile.
6. **Cycle Hijacking**: Eve attempting to delete or overwrite Alice's cycle record.
7. **Negative Timeline Injection**: Entering a period duration of `-5` days or `999` days.
8. **Impossible Dates**: Entering a future `lastPeriodStartDate` in the year `2099` (violating temporal logic vs `request.time`).
9. **Blanket Query Scrape**: An authenticated user attempting a raw `collectionGroup("cycles")` query to scrape everyone else's menstrual charts.
10. **Admin Bypass Spoofing**: Bob attempting to overwrite admin-only metadata flags.
11. **Excessive Write Spam**: Spamming the DB with massive payload sizes (> 500 characters in Name fields) to cost-exhaust.
12. **Status Lock Breaker**: Overwriting historic completed cycle calculations directly without compliance validations.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("Ovuline Firestore Rules", () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "ovuline-test",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  const getAliceDb = () => testEnv.authenticatedContext("alice").firestore();
  const getBobDb = () => testEnv.authenticatedContext("bob").firestore();
  const getUnauthDb = () => testEnv.unauthenticatedContext().firestore();

  it("denies unauthenticated profile creations", async () => {
    const db = getUnauthDb();
    await assertFails(db.collection("users").doc("alice").set({ name: "Alice" }));
  });

  it("denies cross-user accesses", async () => {
    const db = getBobDb();
    await assertFails(db.collection("users").doc("alice").get());
  });

  it("validates size bounds on fields", async () => {
    const db = getAliceDb();
    await assertFails(db.collection("users").doc("alice").set({
      id: "alice",
      name: "A".repeat(500), // exceeds 128 chars
      age: 26,
      cycleLength: 28,
      periodDuration: 5,
      lastPeriodStartDate: "2026-05-18"
    }));
  });
});
```
