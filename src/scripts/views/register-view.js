class RegisterView {
  constructor() {
    this.form = document.getElementById('register-form');
    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.termsCheckbox = document.getElementById('terms');
    this.submitBtn = document.getElementById('register-btn');
    this.togglePasswordBtn = document.getElementById('toggle-password');
    this.toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    this.strengthFill = document.getElementById('strength-fill');
    this.strengthText = document.getElementById('strength-text');
  }

  initListeners(handlers) {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = this.getFormData();
        handlers.onRegister(data);
      });
    }

    if (this.passwordInput) {
      this.passwordInput.addEventListener('input', () => {
        handlers.onPasswordInput(this.passwordInput.value);
      });
    }

    if (this.togglePasswordBtn && this.passwordInput) {
      this.togglePasswordBtn.addEventListener('click', () => {
        this._togglePasswordVisibility(this.passwordInput, this.togglePasswordBtn);
      });
    }
    
    if (this.toggleConfirmPasswordBtn && this.confirmPasswordInput) {
      this.toggleConfirmPasswordBtn.addEventListener('click', () => {
        this._togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPasswordBtn);
      });
    }
  }

  getFormData() {
    return {
      name: this.nameInput.value,
      email: this.emailInput.value,
      password: this.passwordInput.value,
      confirmPassword: this.confirmPasswordInput.value,
      terms: this.termsCheckbox.checked,
    };
  }
  
  _togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    const icon = button.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  }

  updatePasswordStrength(strength) {
    if (this.strengthFill && this.strengthText) {
      this.strengthFill.style.width = `${strength.percentage}%`;
      this.strengthFill.className = `strength-fill ${strength.class}`;
      this.strengthText.textContent = strength.text;
    }
  }

  showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      const formGroup = errorElement.closest('.form-group');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      if (formGroup) {
        formGroup.classList.add('error');
      }
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
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
      
      this.submitBtn.setAttribute('aria-busy', loading);
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

export default RegisterView;