/**
 * ServicePro Admin Portal - Login Controller
 * Authenticates exclusively via backend API (POST http://localhost:5000/api/admin/login)
 */

(function(root) {
  const API_LOGIN_URL = "http://localhost:5000/api/admin/login";

  class LoginController {
    constructor(options = {}) {
      this.onLoginSuccess = options.onLoginSuccess || (() => {});
      this.initElements();
      this.initEvents();
    }

    initElements() {
      this.loginView = document.getElementById("auth-login-screen");
      this.emailInput = document.getElementById("login-email");
      this.passwordInput = document.getElementById("login-password");
      this.submitBtn = document.getElementById("login-submit-btn");
      this.errorBox = document.getElementById("login-error-msg");
      this.togglePasswordBtn = document.getElementById("toggle-password-btn");
      this.rememberMeCheckbox = document.getElementById("login-remember-me");

      // Auto-restore remembered email and remember me checkbox preference
      if (typeof localStorage !== "undefined") {
        const savedEmail = localStorage.getItem("rememberedAdminEmail");
        if (savedEmail && this.emailInput && !this.emailInput.value) {
          this.emailInput.value = savedEmail;
        }
        const savedKeepMe = localStorage.getItem("keepMeSignedIn");
        if (savedKeepMe !== null && this.rememberMeCheckbox) {
          this.rememberMeCheckbox.checked = (savedKeepMe === "true");
        }
      }
    }

    initEvents() {
      if (this.submitBtn) {
        this.submitBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleLogin();
        });
      }

      if (this.togglePasswordBtn && this.passwordInput) {
        this.togglePasswordBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const currentType = this.passwordInput.getAttribute("type");
          this.passwordInput.setAttribute("type", currentType === "password" ? "text" : "password");
        });
      }

      // Allow pressing Enter key on input fields to submit
      [this.emailInput, this.passwordInput].forEach(input => {
        if (input) {
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              this.handleLogin();
            }
          });
        }
      });
    }

    showError(msg) {
      if (!this.errorBox) return;
      this.errorBox.innerHTML = `
        <div class="flex items-start gap-2.5">
          <svg class="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-rose-800 leading-snug">${msg}</p>
          </div>
        </div>
      `;
      this.errorBox.classList.remove("hidden");
    }

    hideError() {
      if (this.errorBox) {
        this.errorBox.innerHTML = "";
        this.errorBox.classList.add("hidden");
      }
    }

    async handleLogin() {
      const email = this.emailInput ? this.emailInput.value.trim() : "";
      const password = this.passwordInput ? this.passwordInput.value : "";
      const rememberMe = this.rememberMeCheckbox ? this.rememberMeCheckbox.checked : true;

      if (!email || !password) {
        this.showError("Please enter both admin email and password.");
        return;
      }

      this.hideError();

      // Show spinner on submit button
      if (this.submitBtn) {
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Signing in...
        `;
      }

      const store = (root && root.ServiceProData) ? root.ServiceProData.store : (window.ServiceProData ? window.ServiceProData.store : null);

      try {
        const response = await fetch(API_LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          // Backend login successful
          const adminData = data.admin || data.user || data.data || {};
          const adminUser = {
            id: adminData.id || adminData._id || null,
            name: adminData.name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)),
            email: adminData.email || email,
            role: adminData.role || "admin"
          };

          const accessToken = data.accessToken || data.token || (data.data && data.data.accessToken) || null;
          const refreshToken = data.refreshToken || (data.data && data.data.refreshToken) || null;

          // Remember or forget admin email in persistent localStorage based on "Keep me signed in"
          if (typeof localStorage !== "undefined") {
            if (rememberMe) {
              localStorage.setItem("rememberedAdminEmail", adminUser.email || email);
            } else {
              localStorage.removeItem("rememberedAdminEmail");
            }
          }

          // Save accessToken, refreshToken and admin profile to store (with rememberMe mode)
          if (store) {
            store.setAuthSession({
              accessToken: accessToken,
              refreshToken: refreshToken,
              admin: adminUser,
              user: adminUser,
              raw: data,
              rememberMe: rememberMe
            });
          } else if (typeof localStorage !== "undefined") {
            if (rememberMe) {
              localStorage.setItem("keepMeSignedIn", "true");
              if (accessToken) localStorage.setItem("accessToken", accessToken);
              if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
              if (adminUser) localStorage.setItem("adminUser", JSON.stringify(adminUser));
            } else {
              localStorage.setItem("keepMeSignedIn", "false");
              if (typeof sessionStorage !== "undefined") {
                if (accessToken) sessionStorage.setItem("accessToken", accessToken);
                if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
                if (adminUser) sessionStorage.setItem("adminUser", JSON.stringify(adminUser));
              }
            }
          }

          this.onLoginSuccess(adminUser);
        } else {
          // Backend returned error (400, 401, 403, 500, etc.)
          const errorMsg = data.message || data.error || data.msg || `Login failed (${response.status}: ${response.statusText})`;
          this.showError(errorMsg);
        }
      } catch (err) {
        console.error("Login API Request Failed:", err);
        this.showError(`Connection Error: Unable to reach ${API_LOGIN_URL}. Please ensure your backend server is running on port 5000.`);
      } finally {
        if (this.submitBtn) {
          this.submitBtn.disabled = false;
          this.submitBtn.innerHTML = `Sign In to Admin Portal`;
        }
      }
    }
  }

  if (typeof window !== "undefined") {
    window.ServiceProLogin = { LoginController, API_LOGIN_URL };
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LoginController, API_LOGIN_URL };
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
