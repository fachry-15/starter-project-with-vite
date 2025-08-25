import { registerUser } from '../../data/api';

const RegisterPage = {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Create account</h1>
            <p>Fill in the form to get started</p>
          </div>
          
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Your full name"
                autocomplete="name"
              >
              <span class="error-message" id="name-error"></span>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="your@email.com"
                autocomplete="email"
              >
              <span class="error-message" id="email-error"></span>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-input">
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  placeholder="Choose a password"
                  autocomplete="new-password"
                >
                <button type="button" class="toggle-password" id="toggle-password">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <span class="error-message" id="password-error"></span>
              <div class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" id="strength-fill"></div>
                </div>
                <span class="strength-text" id="strength-text">Password strength</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm password</label>
              <div class="password-input">
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required 
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                >
                <button type="button" class="toggle-password" id="toggle-confirm-password">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <span class="error-message" id="confirm-password-error"></span>
            </div>
            
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="terms" name="terms" required>
                <span class="checkmark"></span>
                I agree to the <a href="#" class="auth-link">terms</a> and <a href="#" class="auth-link">privacy policy</a>
              </label>
              <span class="error-message" id="terms-error"></span>
            </div>
            
            <button type="submit" class="auth-submit-btn" id="register-btn">
              <span class="btn-text">Create account</span>
              <span class="btn-loading" style="display: none;">
                <i class="fas fa-spinner fa-spin"></i> Creating...
              </span>
            </button>
            
            <div class="auth-footer">
              <p>Already have an account? <a href="#/login" class="auth-link">Sign in</a></p>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Add auth-page class to main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('auth-page');
    }
    
    this._initializeRegisterForm();
    this._initializePasswordToggle();
    this._initializePasswordStrength();
  },

  _initializeRegisterForm() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(registerForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      const terms = formData.get('terms');
      
      // Clear previous errors
      this._clearErrors();
      
      // Validate form
      if (!this._validateForm(name, email, password, confirmPassword, terms)) {
        return;
      }
      
      // Show loading state
      this._setLoadingState(true);
      
      try {
        const result = await registerUser({ name, email, password });
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        // Show success message
        this._showNotification('Account created successfully! Please sign in.', 'success');
        
        // Redirect to login page after short delay
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
        
      } catch (error) {
        this._showNotification(error.message, 'error');
      } finally {
        this._setLoadingState(false);
      }
    });
  },

  _initializePasswordToggle() {
    // Toggle for password field
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const icon = toggleBtn.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // Toggle for confirm password field
    const toggleConfirmBtn = document.getElementById('toggle-confirm-password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    toggleConfirmBtn.addEventListener('click', () => {
      const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmPasswordInput.setAttribute('type', type);
      
      const icon = toggleConfirmBtn.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  },

  _initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const strength = this._calculatePasswordStrength(password);
      
      strengthFill.style.width = `${strength.percentage}%`;
      strengthFill.className = `strength-fill ${strength.class}`;
      strengthText.textContent = strength.text;
    });
  },

  _calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 25;
    else feedback.push('at least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('lowercase letter');
    
    // Number or special character check
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
  },

  _validateForm(name, email, password, confirmPassword, terms) {
    let isValid = true;
    
    // Name validation
    if (!name || name.trim().length < 2) {
      this._showFieldError('name-error', 'Name must be at least 2 characters long');
      isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this._showFieldError('email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (!password || password.length < 6) {
      this._showFieldError('password-error', 'Password must be at least 6 characters long');
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      this._showFieldError('confirm-password-error', 'Passwords do not match');
      isValid = false;
    }
    
    // Terms validation
    if (!terms) {
      this._showFieldError('terms-error', 'You must agree to the Terms of Service');
      isValid = false;
    }
    
    return isValid;
  },

  _clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
  },

  _showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    const formGroup = errorElement.closest('.form-group');
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    formGroup.classList.add('error');
  },

  _setLoadingState(loading) {
    const submitBtn = document.getElementById('register-btn');
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (!btnText || !btnLoading) {
      console.warn('Button text or loading elements not found');
      return;
    }
    
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.8';
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.setAttribute('aria-busy', 'true');
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      btnText.style.display = 'block';
      btnLoading.style.display = 'none';
      submitBtn.removeAttribute('aria-busy');
    }
  },

  _showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
};

export default RegisterPage;
