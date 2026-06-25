# Security Specification & Test Cases (TDD)

This document defines the security specifications and "Dirty Dozen" malicious payloads used to test and harden the Firestore security rules for the German Vocabulary Gamified Learning platform.

## 1. Data Invariants

1. **User Profiles (`users/{userId}`)**:
   - Users can only read and write their own profile document (`request.auth.uid == userId`).
   - Standard user authentication requires `request.auth != null`.
   - The XP, Level, Streak, and other progress counters must be integers and cannot be modified by other users.
   - Users cannot set administrative fields or perform privilege escalation.

2. **Vocabulary Topics (`topics/{topicId}`)**:
   - Topics are system-wide master data.
   - Anyone (even guests/unsigned users) can read the topics, facilitating a smooth catalog and search on the Landing page.
   - Nobody can write (create, update, delete) topics via the client SDK. This is a read-only master collection from the perspective of client apps.

3. **Vocabulary Words (`words/{wordId}`)**:
   - Vocabulary words are system-wide master data.
   - Anyone (even guests/unsigned users) can read the words to play games offline or online.
   - Nobody can write (create, update, delete) words via the client SDK. Read-only on the client side.

---

## 2. The "Dirty Dozen" Payloads (Rogue Tests)

Below are twelve specific malicious operations and payloads designed to bypass identity, integrity, and safety:

### Case 1: Unauthenticated Profile Creation
- **Operation**: `create` on `users/attacker_uid`
- **Payload**: `{ "uid": "attacker_uid", "displayName": "Attacker", "xp": 1000 }`
- **Auth context**: None (unsigned user)
- **Expected result**: `PERMISSION_DENIED`

### Case 2: Profile Spoofing / Modifying Someone Else's Profile
- **Operation**: `update` on `users/victim_uid`
- **Payload**: `{ "xp": 99999 }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 3: Identity Spoofing during creation
- **Operation**: `create` on `users/victim_uid`
- **Payload**: `{ "uid": "victim_uid", "displayName": "Victim", "xp": 150 }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 4: Level Skip (Setting excessive level without matching XP)
- **Operation**: `update` on `users/attacker_uid`
- **Payload**: `{ "level": 100, "xp": 150 }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED` (Strict schema and action-based key diff updates)

### Case 5: Rogue Field Injection (Shadow Update)
- **Operation**: `update` on `users/attacker_uid`
- **Payload**: `{ "xp": 200, "isAdmin": true, "ghost_field": "injected" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 6: Temporal Spoofing (Client-provided future timestamp)
- **Operation**: `update` on `users/attacker_uid`
- **Payload**: `{ "lastActiveDate": "2030-01-01T00:00:00.000Z" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED` (Temporal constraints force `request.time` or valid date formats)

### Case 7: Unauthenticated Topic Creation
- **Operation**: `create` on `topics/malicious-topic`
- **Payload**: `{ "id": "malicious-topic", "name": "Hack", "nameDe": "HackDe", "count": 10, "level": "A1" }`
- **Auth context**: None (unsigned user)
- **Expected result**: `PERMISSION_DENIED`

### Case 8: Authenticated Client Topic Creation
- **Operation**: `create` on `topics/malicious-topic`
- **Payload**: `{ "id": "malicious-topic", "name": "Hack", "nameDe": "HackDe", "count": 10, "level": "A1" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 9: Client Modifying Master Topic Details
- **Operation**: `update` on `topics/gia-dinh`
- **Payload**: `{ "name": "Injected Name" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 10: Client Deleting a Master Topic
- **Operation**: `delete` on `topics/gia-dinh`
- **Payload**: None
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 11: Client Creating a Fake Vocabulary Word
- **Operation**: `create` on `words/fake_word`
- **Payload**: `{ "id": "fake_word", "topicId": "gia-dinh", "german": "Hacker", "vietnamese": "Tin tặc" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

### Case 12: Client Modifying a Vocabulary Word Translation
- **Operation**: `update` on `words/fam_1`
- **Payload**: `{ "vietnamese": "bố hack" }`
- **Auth context**: Signed in as `attacker_uid`
- **Expected result**: `PERMISSION_DENIED`

---

## 3. The Test Suite Runner

A unit test verifying these conditions returns `PERMISSION_DENIED` for unauthorized writes and `ALLOWED` for validated reads.
