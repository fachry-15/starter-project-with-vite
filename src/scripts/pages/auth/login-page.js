import AuthModel from '../../models/auth-model';
import LoginView from '../../views/login-view';
import LoginPresenter from '../../presenters/login-presenter';

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
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('auth-page');
    }
    
    const loginView = new LoginView();
    const loginPresenter = new LoginPresenter(loginView, AuthModel);
    loginPresenter.init();
  },
};

export default LoginPage;