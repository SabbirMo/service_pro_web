/**
 * ServicePro Admin Portal - Master Application Bootstrap
 * Orchestrates Authentication, Login Screen, and Dashboard
 */

(function(root) {
  const store = (root && root.ServiceProData) ? root.ServiceProData.store : (window.ServiceProData ? window.ServiceProData.store : null);

  class AppMaster {
    constructor() {
      this.loginScreen = document.getElementById("auth-login-screen");
      this.dashboardWrapper = document.getElementById("app-dashboard-wrapper");
      this.loginController = null;
      this.dashboardController = null;

      this.init();
    }

    init() {
      // Check auth state from store
      const isLoggedIn = store ? store.isAuthenticated() : false;

      if (isLoggedIn) {
        this.showDashboard();
      } else {
        this.showLogin();
      }
    }

    showLogin() {
      if (this.dashboardWrapper) {
        this.dashboardWrapper.classList.add("hidden");
      }
      if (this.loginScreen) {
        this.loginScreen.classList.remove("hidden");
      }

      // Initialize or reset Login Controller
      if (window.ServiceProLogin && window.ServiceProLogin.LoginController) {
        this.loginController = new window.ServiceProLogin.LoginController({
          onLoginSuccess: (user) => {
            this.showDashboard();
          }
        });
      }
    }

    showDashboard() {
      if (this.loginScreen) {
        this.loginScreen.classList.add("hidden");
      }
      if (this.dashboardWrapper) {
        this.dashboardWrapper.classList.remove("hidden");
      }

      // Initialize or refresh Dashboard Controller
      if (window.ServiceProDashboard && window.ServiceProDashboard.DashboardController) {
        this.dashboardController = new window.ServiceProDashboard.DashboardController({
          onSignOut: () => {
            this.showLogin();
          }
        });
      }

      // Update current user info in sidebar if available
      if (store) {
        const user = store.getCurrentUser();
        const userNameEl = document.getElementById("sidebar-user-name");
        const userRoleEl = document.getElementById("sidebar-user-role");
        const userAvatarEl = document.getElementById("sidebar-user-avatar");
        if (userNameEl && user.name) userNameEl.textContent = user.name;
        if (userRoleEl && user.role) {
          userRoleEl.textContent = user.role.toLowerCase() === "admin" ? "Administrator" : user.role;
        }
        if (userAvatarEl && user.avatar) userAvatarEl.src = user.avatar;
      }
    }
  }

  function bootstrap() {
    window.serviceProMasterApp = new AppMaster();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
