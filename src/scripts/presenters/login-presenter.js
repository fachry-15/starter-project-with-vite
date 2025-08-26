import AuthModel from '../models/auth-model';

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
      // Presenter memanggil Model, dan Model yang mengurus penyimpanan
      await this.model.login(email, password);
      
      this.view.showNotification('Login berhasil! Mengalihkan halaman...', 'success');
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
      this.view.showError('email', 'Harap masukkan alamat email yang valid');
      isValid = false;
    }
    
    if (!password || password.length < 6) {
      this.view.showError('password', 'Kata sandi minimal 6 karakter');
      isValid = false;
    }
    
    return isValid;
  }
}

export default LoginPresenter;