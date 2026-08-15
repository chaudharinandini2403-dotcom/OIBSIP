
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const USERS_KEY = 'securevault_users';
const SESSION_KEY = 'securevault_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    username: user.username,
    email: user.email,
    loginTime: new Date().toISOString()
  }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

const pages = {
  register: document.getElementById('register-page'),
  login: document.getElementById('login-page'),
  dashboard: document.getElementById('dashboard-page')
};

const regForm = document.getElementById('register-form');
const regUsername = document.getElementById('reg-username');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');
const regConfirm = document.getElementById('reg-confirm');
const regBtn = document.getElementById('register-btn');
const regTogglePw = document.getElementById('reg-toggle-pw');
const regStrengthFill = document.getElementById('reg-strength-fill');
const regStrengthLabel = document.getElementById('reg-strength-label');
const regPwStrength = document.getElementById('reg-pw-strength');

const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginTogglePw = document.getElementById('login-toggle-pw');
const loginGeneralError = document.getElementById('login-general-error');

const navUsername = document.getElementById('nav-username');
const dashboardGreeting = document.getElementById('dashboard-greeting');
const sessionTimeEl = document.getElementById('session-time');
const accountEmailEl = document.getElementById('account-email');
const activityList = document.getElementById('activity-list');
const logoutBtn = document.getElementById('logout-btn');

const gotoLogin = document.getElementById('goto-login');
const gotoRegister = document.getElementById('goto-register');

function showPage(page) {
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  pages[page].classList.remove('hidden');

  const card = pages[page].querySelector('.auth-card');
  if (card) {
    card.style.animation = 'none';
    void card.offsetHeight;
    card.style.animation = '';
  }
}

gotoLogin.addEventListener('click', (e) => {
  e.preventDefault();
  clearFormErrors(regForm);
  showPage('login');
});

gotoRegister.addEventListener('click', (e) => {
  e.preventDefault();
  clearFormErrors(loginForm);
  loginGeneralError.textContent = '';
  loginGeneralError.classList.remove('visible');
  showPage('register');
});

function setFieldError(groupId, message) {
  const group = document.getElementById(groupId);
  group.classList.add('error');
  group.classList.remove('success');
  const errorEl = group.querySelector('.error-msg');
  if (errorEl) errorEl.textContent = message;

  const wrapper = group.querySelector('.input-wrapper');
  wrapper.classList.add('shake');
  setTimeout(() => wrapper.classList.remove('shake'), 400);
}

function setFieldSuccess(groupId) {
  const group = document.getElementById(groupId);
  group.classList.remove('error');
  group.classList.add('success');
  const errorEl = group.querySelector('.error-msg');
  if (errorEl) errorEl.textContent = '';
}

function clearFieldState(groupId) {
  const group = document.getElementById(groupId);
  group.classList.remove('error', 'success');
  const errorEl = group.querySelector('.error-msg');
  if (errorEl) errorEl.textContent = '';
}

function clearFormErrors(form) {
  form.querySelectorAll('.input-group').forEach(g => {
    g.classList.remove('error', 'success');
    const err = g.querySelector('.error-msg');
    if (err) err.textContent = '';
  });
}

function evaluatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score; // 0-5
}

function updateStrengthMeter(password) {
  if (!password) {
    regPwStrength.classList.remove('visible');
    return;
  }
  regPwStrength.classList.add('visible');

  const score = evaluatePasswordStrength(password);
  const levels = [
    { width: '10%', color: '#ff6b6b', label: 'Very Weak' },
    { width: '25%', color: '#ff6b6b', label: 'Weak' },
    { width: '50%', color: '#fdcb6e', label: 'Fair' },
    { width: '75%', color: '#74b9ff', label: 'Good' },
    { width: '90%', color: '#00b894', label: 'Strong' },
    { width: '100%', color: '#00b894', label: 'Excellent' }
  ];

  const level = levels[score];
  regStrengthFill.style.width = level.width;
  regStrengthFill.style.background = level.color;
  regStrengthLabel.textContent = level.label;
  regStrengthLabel.style.color = level.color;
}

regPassword.addEventListener('input', () => {
  updateStrengthMeter(regPassword.value);
});

function setupToggle(btn, input) {
  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('.eye-open').style.display = isPassword ? 'none' : 'block';
    btn.querySelector('.eye-closed').style.display = isPassword ? 'block' : 'none';
  });
}

setupToggle(regTogglePw, regPassword);
setupToggle(loginTogglePw, loginPassword);

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setButtonLoading(btn, loading) {
  if (loading) {
    btn.classList.add('loading');
  } else {
    btn.classList.remove('loading');
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(regForm);

  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value;
  const confirm = regConfirm.value;

  let isValid = true;

  if (!username) {
    setFieldError('reg-username-group', 'Username is required');
    isValid = false;
  } else if (username.length < 3) {
    setFieldError('reg-username-group', 'Username must be at least 3 characters');
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    setFieldError('reg-username-group', 'Only letters, numbers, and underscores allowed');
    isValid = false;
  } else {
    setFieldSuccess('reg-username-group');
  }

  if (!email) {
    setFieldError('reg-email-group', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('reg-email-group', 'Please enter a valid email address');
    isValid = false;
  } else {
    setFieldSuccess('reg-email-group');
  }

  if (!password) {
    setFieldError('reg-password-group', 'Password is required');
    isValid = false;
  } else if (password.length < 8) {
    setFieldError('reg-password-group', 'Password must be at least 8 characters');
    isValid = false;
  } else if (!/\d/.test(password)) {
    setFieldError('reg-password-group', 'Password must contain at least 1 number');
    isValid = false;
  } else {
    setFieldSuccess('reg-password-group');
  }

  if (!confirm) {
    setFieldError('reg-confirm-group', 'Please confirm your password');
    isValid = false;
  } else if (password && confirm !== password) {
    setFieldError('reg-confirm-group', 'Passwords do not match');
    isValid = false;
  } else if (password && confirm === password) {
    setFieldSuccess('reg-confirm-group');
  }

  if (!isValid) return;

  const users = getUsers();
  const usernameLower = username.toLowerCase();
  const emailLower = email.toLowerCase();

  if (users.some(u => u.username.toLowerCase() === usernameLower)) {
    setFieldError('reg-username-group', 'This username is already taken');
    return;
  }

  if (users.some(u => u.email.toLowerCase() === emailLower)) {
    setFieldError('reg-email-group', 'An account with this email already exists');
    return;
  }

  setButtonLoading(regBtn, true);

  const hashedPassword = await hashPassword(password);

  await new Promise(r => setTimeout(r, 800));

  users.push({
    username: username,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  });
  saveUsers(users);

  setButtonLoading(regBtn, false);
  showToast('Account created successfully!', 'success');

  regForm.reset();
  clearFormErrors(regForm);
  regPwStrength.classList.remove('visible');

  setTimeout(() => showPage('login'), 600);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(loginForm);
  loginGeneralError.textContent = '';
  loginGeneralError.classList.remove('visible');

  const identifier = loginUsername.value.trim();
  const password = loginPassword.value;

  let isValid = true;

  if (!identifier) {
    setFieldError('login-username-group', 'Please enter your username or email');
    isValid = false;
  }

  if (!password) {
    setFieldError('login-password-group', 'Please enter your password');
    isValid = false;
  }

  if (!isValid) return;

  setButtonLoading(loginBtn, true);

  const hashedPassword = await hashPassword(password);

  await new Promise(r => setTimeout(r, 800));

  const users = getUsers();
  const identifierLower = identifier.toLowerCase();
  const matchedUser = users.find(u =>
    (u.username.toLowerCase() === identifierLower || u.email.toLowerCase() === identifierLower)
    && u.password === hashedPassword
  );

  setButtonLoading(loginBtn, false);

  if (!matchedUser) {
    loginGeneralError.textContent = 'Invalid credentials. Please check your username/email and password.';
    loginGeneralError.classList.add('visible');

    const card = document.getElementById('login-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
    return;
  }

  setSession(matchedUser);
  loginForm.reset();
  showToast(`Welcome back, ${matchedUser.username}!`, 'success');

  setTimeout(() => {
    showPage('dashboard');
    populateDashboard(matchedUser);
  }, 400);
});

function populateDashboard(user) {
  const session = getSession();

  navUsername.textContent = user ? user.username : (session ? session.username : '');
  const displayName = user ? user.username : (session ? session.username : 'User');

  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else greeting = 'Good Evening';

  dashboardGreeting.textContent = `${greeting}, ${displayName} 👋`;

  const loginTime = session ? new Date(session.loginTime) : new Date();
  sessionTimeEl.textContent = loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const email = user ? user.email : (session ? session.email : '');
  accountEmailEl.textContent = email;

  activityList.innerHTML = '';
  const activities = [
    { dot: 'green', text: 'Successfully signed in', time: loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { dot: 'blue', text: 'Session token generated', time: loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { dot: 'purple', text: 'Dashboard access granted', time: loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ];

  activities.forEach(a => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-dot ${a.dot}"></span>
      <span class="activity-text">${a.text}</span>
      <span class="activity-time">${a.time}</span>
    `;
    activityList.appendChild(item);
  });
}

logoutBtn.addEventListener('click', () => {
  clearSession();
  showToast('You have been logged out', 'info');
  setTimeout(() => showPage('login'), 300);
});

function checkSession() {
  const session = getSession();
  if (session) {
    showPage('dashboard');
    populateDashboard(null);
  } else {
    showPage('register');
  }
}

regUsername.addEventListener('blur', () => {
  const val = regUsername.value.trim();
  if (val && val.length >= 3 && /^[a-zA-Z0-9_]+$/.test(val)) {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === val.toLowerCase())) {
      setFieldError('reg-username-group', 'This username is already taken');
    } else {
      setFieldSuccess('reg-username-group');
    }
  }
});

regEmail.addEventListener('blur', () => {
  const val = regEmail.value.trim();
  if (val && isValidEmail(val)) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === val.toLowerCase())) {
      setFieldError('reg-email-group', 'An account with this email already exists');
    } else {
      setFieldSuccess('reg-email-group');
    }
  }
})
checkSession();
