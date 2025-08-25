import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #isLoggedIn = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuth();
    
    // Initialize active navigation on load
    const currentRoute = getActiveRoute();
    this.#updateActiveNavigation(currentRoute);
    
    // Initialize auth state from localStorage
    this.#updateAuthUI();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #setupAuth() {
    // Desktop login button
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Mobile login/logout buttons
    const mobileLoginBtn = document.querySelector('.mobile-auth-when-out');
    const mobileLogoutBtn = document.querySelector('.mobile-auth-when-in');

    // Notification and subscribe buttons
    const notificationBtns = document.querySelectorAll('.notification-btn, .notification-btn-mobile');
    const subscribeBtns = document.querySelectorAll('.subscribe-btn, .subscribe-btn-mobile');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        this.#login();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.#logout();
      });
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.addEventListener('click', () => {
        this.#login();
        this.#navigationDrawer.classList.remove('open');
      });
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        this.#logout();
        this.#navigationDrawer.classList.remove('open');
      });
    }

    // Notification button handlers
    notificationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this._showNotification('🔔 Notifications feature coming soon!', 'info');
      });
    });

    // Subscribe button handlers
    subscribeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this._showNotification('❤️ Subscribe feature coming soon!', 'info');
      });
    });

    // Initialize auth state
    this.#updateAuthUI();
  }

  #login() {
    // Redirect to login page
    window.location.hash = '#/login';
  }

  #logout() {
    // Clear stored auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    this.#isLoggedIn = false;
    this.#updateAuthUI();
    
    // Show logout notification
    this._showNotification('👋 Logout successful! See you later!', 'success');
    
    // Redirect to home page
    window.location.hash = '#/';
  }

  #updateAuthUI() {
    // Check localStorage for auth token
    const token = localStorage.getItem('authToken');
    this.#isLoggedIn = !!token;
    
    // Desktop elements
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Mobile elements
    const mobileLoginBtn = document.querySelector('.mobile-auth-when-out');
    const mobileLogoutBtn = document.querySelector('.mobile-auth-when-in');

    if (this.#isLoggedIn) {
      // Show logout, hide login
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'flex';
      if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'flex';
    } else {
      // Show login, hide logout
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Remove auth-page class from previous pages
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }

    this.#content.innerHTML = await page.render();
    await page.afterRender();
    
    // Update active navigation
    this.#updateActiveNavigation(url);
  }

  #updateActiveNavigation(currentRoute) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current route
    const currentLink = document.querySelector(`.nav-link[href="#${currentRoute}"]`);
    if (currentLink) {
      currentLink.classList.add('active');
    }

    // Handle mobile navigation links
    document.querySelectorAll('.nav-list a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentRoute}`) {
        link.classList.add('active');
      }
    });
  }

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
    }, 3000);
  }
}

export default App;