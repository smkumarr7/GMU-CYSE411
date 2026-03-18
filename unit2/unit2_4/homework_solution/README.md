# CYSE 411 – Instructor Solution (Unit 2.4)
Secure Coding: CSRF, Authentication, and Logic Abuse

---

## 🎯 Purpose of This Version

This is the **secure instructor solution** for the Unit 2.4 homework.

It demonstrates:

- How vulnerabilities manifest in real systems
- How to fix them using **defensive coding principles**
- Why each fix is necessary

All fixes are **implemented and commented in the code**, and explained here.

---

# 🧠 Key Concept

> Security failures occur when systems trust the client, the session, or the workflow without proper validation.

---

# 🔍 Vulnerabilities and Fixes



## 1️⃣ CSRF (Cross-Site Request Forgery)

### ❌ Problem

The vulnerable version allowed requests like:

```http
POST /transfer

```

without verifying:

- where the request came from

- whether the user intended the action

Because:

- the browser automatically sends session cookies


### ✅ Fix Implemented

```JavaScript

if (req.body.csrfToken !== req.session.csrfToken)

```

✔ Explanation

- A random token is generated and stored in the session

- The same token must be sent in the request

- Attackers cannot guess this token

📌 Key Insight: CSRF is not about stealing credentials — it is about abusing trusted requests.

🔗 Reference: https://www.npmjs.com/package/csurf

---

## 2️⃣ Weak Password Handling

### ❌ Problem
```SQL
SELECT * FROM users WHERE username=? AND password=?
```

- Passwords stored in plaintext

- Easily compromised if database leaks


### ✅ Fix Implemented
```SQL
const match = await bcrypt.compare(password, user.password);
```

✔ Explanation

- Passwords are hashed using bcrypt

- Even if database leaks → passwords are not directly exposed


📌 Key Insight: Never store passwords — store hashes.


🔗 Reference: https://www.npmjs.com/package/bcrypt

---

## 3️⃣ Session Fixation

### ❌ Problem

```JavaScript
req.session.user = username;
```

- Session ID remains the same after login

- Attacker can predefine session ID

### ✅ Fix Implemented

```JavaScript
req.session.regenerate(() => { ... });

```

✔ Explanation

- Generates a new session after login

- Prevents attacker from reusing a known session ID

📌 Key Insight: Authentication must create a new trusted session.


---

## 4️⃣ Broken Access Control (Admin Panel)

### ❌ Problem

```JavaScript
if (req.session.user)
```

- Any logged-in user could access admin functionality

### ✅ Fix Implemented

```JavaScript
if (req.session.role !== "admin")
```

✔ Explanation

- Enforces role-based access control

- Only authorized users can access sensitive endpoints

📌 Key Insight: Authentication ≠ Authorization

---

## 5️⃣ IDOR (Insecure Direct Object Reference)

### ❌ Problem

```JavaScript
/account/:id
```

- User could access any account by changing ID


### ✅ Fix Implemented

```JavaScript
userOwnsAccount(req.session.userId, accountId)
```

✔ Explanation

- Server verifies ownership before returning data

📌 Key Insight: Never trust user-controlled identifiers.

---

## 6️⃣ Parameter Tampering
### ❌ Problem

```JavaScript
const from = req.body.fromAccount;
```

- User controls source account

### ✅ Fix Implemented

```JavaScript
const from = req.session.userAccount;
```

✔ Explanation

- Sensitive values must come from the server, not the client

📌 Key Insight: The client is not a trusted source of truth.

---

## 7️⃣ Business Logic Abuse

### ❌ Problem

- No validation of transfer amount

- Negative or invalid transactions possible

### ✅ Fix Implemented

```JavaScript
if (amount <= 0)
```

✔ Explanation

- Ensures only valid operations are executed

- Protects workflow integrity

📌 Key Insight: Security is not only about input — it is also about process correctness.

---


## 🛡️ Defense-in-Depth Applied

This solution uses multiple layers:

| Layer                | Protection                          | Purpose                                      |
|---------------------|-----------------------------------|----------------------------------------------|
| Session             | HttpOnly, SameSite cookies         | Prevent client-side access and CSRF exposure |
| Authentication      | bcrypt hashing                     | Protect stored passwords                     |
| Request Validation  | CSRF token                         | Ensure request origin and user intent        |
| Authorization       | Role-based access control          | Restrict actions based on user permissions   |
| Data Protection     | Ownership validation               | Ensure users access only their own data      |
| Logic Validation    | Input constraints (e.g., amount > 0)| Prevent workflow and business logic abuse    |


---

## 🧠 Secure Coding Mindset

- Students should learn to ask:

- What does the browser do automatically?

- What assumptions does the server make?

- Can the user control this input?

- Is this action tied to user intent?

- Can this workflow be abused?

