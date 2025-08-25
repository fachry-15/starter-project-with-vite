import { loginUser } from '../../data/api';

const LoginPage = {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Sign in</h1>
            <p>Welcome back! Please sign in to continue</p>
          </div>
          
          <form id="login-form" class="auth-form">
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
                  placeholder="Your password"
                  autocomplete="current-password"
                >
                <button type="button" class="toggle-password" id="toggle-password">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <span class="error-message" id="password-error"></span>
            </div>
            
            <button type="submit" class="auth-submit-btn" id="login-submit-btn">
              <span class="btn-text">SIGN IN</span>
              <span class="btn-loading" style="display: none;">
                <i class="fas fa-spinner fa-spin"></i> Signing in...
              </span>
            </button>
            
            <div class="auth-footer">
              <p>Don't have an account? <a href="#/register" class="auth-link">Create one</a></p>
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
    
    // Wait for DOM to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this._initializeLoginForm();
    this._initializePasswordToggle();
  },

  _initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit-btn');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');
      
      // Clear previous errors
      this._clearErrors();
      
      // Validate form
      if (!this._validateForm(email, password)) {
        return;
      }
      
      // Show loading state immediately
      this._setLoadingState(true);
      
      // Small delay to ensure DOM update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        console.log('Attempting login with:', { email, password: '***' });
        
        // Add minimum loading time for better UX
        const loginPromise = loginUser({ email, password });
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        
        const [result] = await Promise.all([loginPromise, minLoadingTime]);
        console.log('Login result:', result);
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        // Store token and user data
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('userData', JSON.stringify({
          userId: result.data.userId,
          name: result.data.name,
          email: email
        }));
        
        // Show success message
        this._showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to home page after short delay
        setTimeout(() => {
          window.location.hash = '#/';
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        this._showNotification(error.message, 'error');
      } finally {
        this._setLoadingState(false);
      }
    });
  },

  _initializePasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const icon = toggleBtn.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  },

  _validateForm(email, password) {
    let isValid = true;
    
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
    if (!errorElement) {
      console.warn(`Error element with id ${errorId} not found`);
      return;
    }
    
    const formGroup = errorElement.closest('.form-group');
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    if (formGroup) {
      formGroup.classList.add('error');
    }
  },

  _setLoadingState(loading) {
    // Use more specific selector to ensure we get the login form button
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    const submitBtn = loginForm.querySelector('#login-submit-btn');
    if (!submitBtn) return;
    
    let btnText = submitBtn.querySelector('.btn-text');
    let btnLoading = submitBtn.querySelector('.btn-loading');
    
    // If elements don't exist, recreate the button structure
    if (!btnText || !btnLoading) {
      submitBtn.innerHTML = `
        <span class="btn-text">SIGN IN</span>
        <span class="btn-loading" style="display: none;">
          <i class="fas fa-spinner fa-spin"></i> Signing in...
        </span>
      `;
      btnText = submitBtn.querySelector('.btn-text');
      btnLoading = submitBtn.querySelector('.btn-loading');
    }
    
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'flex';
      
      submitBtn.setAttribute('aria-busy', 'true');
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      
      if (btnText) btnText.style.display = 'block';
      if (btnLoading) btnLoading.style.display = 'none';
      
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

export default LoginPage;
