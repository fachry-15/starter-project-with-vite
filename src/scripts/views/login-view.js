class LoginView {
  constructor() {
    this.form = document.getElementById('login-form');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.togglePasswordBtn = document.getElementById('toggle-password');
    this.submitBtn = document.getElementById('login-submit-btn');
  }

  initListeners(handlers) {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        handlers.onLogin(email, password);
      });
    }

    if (this.togglePasswordBtn && this.passwordInput) {
      this.togglePasswordBtn.addEventListener('click', () => {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.togglePasswordBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
      });
    }
  }

  getFormData() {
    return {
      email: this.emailInput.value,
      password: this.passwordInput.value,
    };
  }

  showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.closest('.form-group').classList.add('error');
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
      el.closest('.form-group').classList.remove('error');
    });
  }

  setLoadingState(loading) {
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector('.btn-text');
      const btnLoading = this.submitBtn.querySelector('.btn-loading');
      
      this.submitBtn.disabled = loading;
      this.submitBtn.classList.toggle('loading', loading);
      
      if (btnText) btnText.style.display = loading ? 'none' : 'block';
      if (btnLoading) btnLoading.style.display = loading ? 'flex' : 'none';
    }
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}

export default LoginView;