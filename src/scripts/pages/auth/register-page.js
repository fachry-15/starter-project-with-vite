import RegisterView from '../../views/register-view';
import RegisterPresenter from '../../presenters/register-presenter';

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
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('auth-page');
    }
    
    const registerView = new RegisterView();
    const registerPresenter = new RegisterPresenter(registerView);
    registerPresenter.init();
  },
};

export default RegisterPage;