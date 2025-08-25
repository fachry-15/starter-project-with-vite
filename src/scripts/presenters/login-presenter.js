class LoginPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  init() {
    this.view.initListeners({
      onLogin: this._handleLogin.bind(this),
    });
  }

  async _handleLogin(email, password) {
    this.view.clearErrors();

    if (!this._validateForm(email, password)) {
      return;
    }

    this.view.setLoadingState(true);

    try {
      const loginResult = await this.model.login(email, password);
      
      localStorage.setItem('authToken', loginResult.token);
      localStorage.setItem('userData', JSON.stringify({
        userId: loginResult.userId,
        name: loginResult.name,
        email: email
      }));
      
      this.view.showNotification('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.hash = '#/';
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      this.view.showNotification(error.message, 'error');
    } finally {
      this.view.setLoadingState(false);
    }
  }

  _validateForm(email, password) {
    let isValid = true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.view.showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password || password.length < 6) {
      this.view.showError('password', 'Password must be at least 6 characters long');
      isValid = false;
    }
    
    return isValid;
  }
}

export default LoginPresenter;