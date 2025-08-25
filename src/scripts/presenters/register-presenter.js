import { registerUser } from '../data/api';

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  init() {
    this.view.initListeners({
      onRegister: this._handleRegister.bind(this),
      onPasswordInput: this._handlePasswordInput.bind(this),
    });
  }

  async _handleRegister(data) {
    this.view.clearErrors();
    const { name, email, password, confirmPassword, terms } = data;
    
    if (!this._validateForm(name, email, password, confirmPassword, terms)) {
      return;
    }
    
    this.view.setLoadingState(true);
    
    try {
      const result = await registerUser({ name, email, password });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      this.view.showNotification('Account created successfully! Please sign in.', 'success');
      
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);
      
    } catch (error) {
      this.view.showNotification(error.message, 'error');
    } finally {
      this.view.setLoadingState(false);
    }
  }

  _handlePasswordInput(password) {
    const strength = this._calculatePasswordStrength(password);
    this.view.updatePasswordStrength(strength);
  }

  _validateForm(name, email, password, confirmPassword, terms) {
    let isValid = true;
    
    if (!name || name.trim().length < 2) {
      this.view.showError('name-error', 'Name must be at least 2 characters long');
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.view.showError('email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password || password.length < 6) {
      this.view.showError('password-error', 'Password must be at least 6 characters long');
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      this.view.showError('confirm-password-error', 'Passwords do not match');
      isValid = false;
    }
    
    if (!terms) {
      this.view.showError('terms-error', 'You must agree to the Terms of Service');
      isValid = false;
    }
    
    return isValid;
  }

  _calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 25;
    else feedback.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('uppercase letter');
    
    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('lowercase letter');
    
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;
    else feedback.push('number or special character');
    
    let strengthClass, strengthText;
    
    if (score < 50) {
      strengthClass = 'weak';
      strengthText = 'Weak - Add ' + feedback.slice(0, 2).join(', ');
    } else if (score < 75) {
      strengthClass = 'medium';
      strengthText = 'Medium - Add ' + feedback.join(', ');
    } else if (score < 100) {
      strengthClass = 'good';
      strengthText = 'Good - Add ' + feedback.join(', ');
    } else {
      strengthClass = 'strong';
      strengthText = 'Strong password!';
    }
    
    return {
      percentage: score,
      class: strengthClass,
      text: strengthText
    };
  }
}

export default RegisterPresenter;