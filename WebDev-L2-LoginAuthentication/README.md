# SecureVault — Client-Side Authentication System

A premium client-side registration, login, and dashboard system built using modern web technologies. Highly responsive, secure-by-design for client environments, and wrapped in a beautiful dark-mode glassmorphism aesthetic.

---

## 📸 visual Previews

Below are previews of the user interface flow:

### 1. Account Creation (Registration)
![Registration Page](login%20authentication%20system%20screenshot%201.png)

### 2. Secure Access (Login)
![Login Page](login%20authentication%20system%20screenshot%202.png)

### 3. Protected Workspace (Dashboard)
![Dashboard Page](login%20authentication%20system%20screenshot%203.png)

---

## ✨ Features

- **SHA-256 Password Hashing**: Passwords are securely hashed client-side using JavaScript's native Web Crypto API prior to storage, ensuring plain text passwords never touch the browser's storage layers.
- **Real-Time Password Strength Meter**: Immediate visual feedback evaluating passphrase complexity (Very Weak to Excellent) using width, color-transition, and text indicators.
- **Smart Validation & Error Handling**:
  - Smooth shake animations on input fields whenever validation fails.
  - Interactive line validation indicators (success/error states).
  - Floating toast notifications for successful state transitions and error logging.
- **Design & Layout**:
  - Eye-pleasing glassmorphic UI using backdrop-filter blur/saturate effects.
  - Visually engaging background animators featuring floating, pulsing color orbs.
  - Customized interactive icons (eye toggles for password visibility).
- **Session Persistence**: Custom session persistence utilizing `sessionStorage`, backed by active session guards preventing unauthorized access to the dashboard.

---

## 🛠️ Tech Stack

- **Structure**: Semantic HTML5 markup
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid, Custom keyframe animations, glassmorphism)
- **Logic & Security**: JavaScript (ES6+), Web Crypto API (`crypto.subtle.digest` for SHA-256)
- **Local Storage**: `localStorage` (persists registered user base), `sessionStorage` (manages active login session state)

---

## 📂 Project Structure

```text
├── index.html                    # Main HTML markup (login, registration & dashboard)
├── style.css                     # Design custom variables, system styles, animations
├── app.js                        # Form validation, Web Crypto hashing, and session guards
├── login authentication... 1.png # Visual screenshot of Registration flow
├── login authentication... 2.png # Visual screenshot of Login flow
└── login authentication... 3.png # Visual screenshot of Dashboard panel
```

---

## 🚀 Getting Started

1. **Download/Clone** this repository to your local machine.
2. Navigate to the root directory and open `index.html` directly in any web browser.
3. **Register** a new account by providing a unique username, valid email, and a strong password. Note the real-time strength meter updates.
4. **Log In** using either your username or email along with the password.
5. Explore the **Dashboard** displaying active session variables, security configuration metrics, and dynamically populated activity logs.

---

## ⚠️ Important Note

- This authentication pipeline operates entirely client-side for educational, demonstration, and prototyping purposes.
- Session authorization and hashing are stored inside the browser's storage context. Never deploy client-side-only authentication directly in a production environment without integration with secure backend authentication providers.

Created by Nayana Chaudhari.
