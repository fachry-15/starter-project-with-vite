import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { showNotification } from '../utils/index.js';

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
    
    const currentRoute = getActiveRoute();
    this.#updateActiveNavigation(currentRoute);
    
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
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLoginBtn = document.querySelector('.mobile-auth-when-out');
    const mobileLogoutBtn = document.querySelector('.mobile-auth-when-in');

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

    notificationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showNotification('🔔 Notifications feature coming soon!', 'info');
      });
    });

    subscribeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showNotification('❤️ Subscribe feature coming soon!', 'info');
      });
    });

    this.#updateAuthUI();
  }

  #login() {
    window.location.hash = '#/login';
  }

  #logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    this.#isLoggedIn = false;
    this.#updateAuthUI();
    
    showNotification('👋 Logout successful! See you later!', 'success');
    
    window.location.hash = '#/';
  }

  #updateAuthUI() {
    const token = localStorage.getItem('authToken');
    this.#isLoggedIn = !!token;
    
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLoginBtn = document.querySelector('.mobile-auth-when-out');
    const mobileLogoutBtn = document.querySelector('.mobile-auth-when-in');

    if (this.#isLoggedIn) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'flex';
      if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'flex';
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (document.startViewTransition) {
        document.startViewTransition(async () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.classList.remove('auth-page');
            }

            this.#content.innerHTML = await page.render();
            await page.afterRender();
            
            this.#updateActiveNavigation(url);
        });
    } else {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('auth-page');
        }

        this.#content.innerHTML = await page.render();
        await page.afterRender();
        
        this.#updateActiveNavigation(url);
    }
  }

  #updateActiveNavigation(currentRoute) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    const currentLink = document.querySelector(`.nav-link[href="#${currentRoute}"]`);
    if (currentLink) {
      currentLink.classList.add('active');
    }

    document.querySelectorAll('.nav-list a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentRoute}`) {
        link.classList.add('active');
      }
    });
  }
}

export default App;