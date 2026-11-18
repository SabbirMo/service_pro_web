/**
 * ServicePro Admin Portal - Dashboard Controller
 * Manages Dashboard Views, Real-time Filters, Header Notification Dropdown, and Sign Out
 */

(function(root) {
  const DataStore = (root && root.ServiceProData) ? root.ServiceProData : (typeof window !== "undefined" ? window.ServiceProData : {});
  const UI = (root && root.ServiceProUI) ? root.ServiceProUI : (typeof window !== "undefined" ? window.ServiceProUI : {});

  const store = DataStore.store;
  const CATEGORIES = DataStore.CATEGORIES || [
    "Plumbing", "Electrical", "Painting", "AC & Appliances", "Cleaning", "Spa"
  ];
  const API_DASHBOARD_URL = "http://localhost:5000/api/admin/dashboard";
  const API_SERVICES_URL = "http://localhost:5000/api/admin/services";
  const API_BOOKINGS_URL = "http://localhost:5000/api/admin/bookings";
  const API_NOTIFICATIONS_URL = "http://localhost:5000/api/notifications";
  const API_ANALYTICS_URL = "http://localhost:5000/api/admin/analytics";

  class DashboardController {
    constructor(options = {}) {
      this.onSignOut = options.onSignOut || (() => {});
      this.currentView = "dashboard";
      this.bookingStatusFilter = "All";
      this.bookingSearchQuery = "";
      this.serviceCategoryFilter = "All";
      this.statusCounts = null;
      this.unreadNotifCount = 0;
      this.notificationsList = [];
      this.hasLoadedNotifications = false;
      this.notifPollTimer = null;
      this.isNotificationDropdownOpen = false;
      this.toastTimer = null;
      this.activeImageSourceTab = "upload";
      this.uploadedImageFile = null;
      this.uploadedImageBase64 = null;
      this.uploadedFileName = "";
      this.uploadedFileSize = "";
      this.editingServiceId = null;
      this.analyticsTimeframe = "7d";
      this.analyticsData = (store && store.getAnalyticsData && store.getAnalyticsData()) || null;

      this.initElements();
      this.initEvents();
      this.render();

      // Poll notifications every 25 seconds for live mobile client alerts
      this.notifPollTimer = setInterval(() => this.fetchNotifications(), 25000);
    }

    initElements() {
      // Nav links (Dashboard, Bookings, Services)
      this.navLinks = document.querySelectorAll("[data-nav-target]");
      this.sidebarPendingBadge = document.getElementById("sidebar-pending-badge");
      this.headerPendingBadge = document.getElementById("header-pending-badge");
      this.analyticsChartsContainer = document.getElementById("dashboard-analytics-charts");

      // Containers
      this.viewContainers = {
        dashboard: document.getElementById("view-dashboard"),
        bookings: document.getElementById("view-bookings"),
        services: document.getElementById("view-services")
      };

      // Header elements
      this.viewTitle = document.getElementById("current-view-title");
      this.viewSubtitle = document.getElementById("current-view-subtitle");
      this.mobileMenuBtn = document.getElementById("mobile-menu-btn");
      this.sidebar = document.getElementById("sidebar-drawer");
      this.sidebarBackdrop = document.getElementById("sidebar-backdrop");

      // Notification Popover Elements
      this.notifBellBtn = document.getElementById("header-notification-bell-btn");
      this.notifDropdown = document.getElementById("header-notification-dropdown");
      this.notifDropdownList = document.getElementById("notif-dropdown-list");
      this.notifBellBadge = document.getElementById("header-notif-bell-badge");
      this.notifUnreadBadge = document.getElementById("notif-dropdown-unread-badge");
      this.clearNotifBtn = document.getElementById("clear-notif-dropdown-btn");

      // Sign Out Button at bottom of sidebar
      this.signOutBtn = document.getElementById("sidebar-signout-btn");

      // Modal elements
      this.postServiceModal = document.getElementById("post-service-modal");
      this.postServiceForm = document.getElementById("post-service-form");
      this.openPostModalBtns = document.querySelectorAll("[data-action='open-post-modal']");
      this.closePostModalBtns = document.querySelectorAll("[data-action='close-post-modal']");
      this.serviceImageInput = document.getElementById("service-image-url");
      this.serviceImagePreview = document.getElementById("service-image-preview");
      this.serviceImagePreviewPlaceholder = document.getElementById("service-image-preview-placeholder");
      this.modalHeaderTitle = document.getElementById("service-modal-header-title");
      this.modalHeaderSubtitle = document.getElementById("service-modal-header-subtitle");
      this.modalSubmitBtn = document.getElementById("service-modal-submit-btn");
      this.modalSubmitText = document.getElementById("service-modal-submit-text");

      // Dual-Source Image Upload & URL Elements
      this.tabBtnUploadFile = document.getElementById("tab-btn-upload-file");
      this.tabBtnImageUrl = document.getElementById("tab-btn-image-url");
      this.imagePaneUpload = document.getElementById("image-pane-upload");
      this.imagePaneUrl = document.getElementById("image-pane-url");
      this.serviceFileInput = document.getElementById("service-file-input");
      this.serviceUploadDropzone = document.getElementById("service-upload-dropzone");
      this.serviceUploadedPreviewCard = document.getElementById("service-uploaded-preview-card");
      this.serviceUploadedPreviewImg = document.getElementById("service-uploaded-preview-img");
      this.serviceUploadedFileName = document.getElementById("service-uploaded-file-name");
      this.serviceUploadedFileSize = document.getElementById("service-uploaded-file-size");
      this.btnChangeUploadedFile = document.getElementById("btn-change-uploaded-file");
      this.btnRemoveUploadedFile = document.getElementById("btn-remove-uploaded-file");

      // Delete Confirmation Dialog Elements
      this.deleteServiceModal = document.getElementById("delete-service-modal");
      this.deleteServiceTitleEl = document.getElementById("delete-service-title");
      this.btnCancelDelete = document.getElementById("btn-cancel-delete-service");
      this.btnConfirmDelete = document.getElementById("btn-confirm-delete-service");
      this.servicePendingDeletion = null;

      // Sign Out Confirmation Modal Elements
      this.signOutModal = document.getElementById("signout-confirm-modal");
      this.btnCancelSignOut = document.getElementById("btn-cancel-signout");
      this.btnConfirmSignOut = document.getElementById("btn-confirm-signout");

      // Toast Container
      this.toastContainer = document.getElementById("notification-toast-container");
      this.toastTitle = document.getElementById("toast-title");
      this.toastMessage = document.getElementById("toast-message");
      this.toastTarget = document.getElementById("toast-target");
      this.toastCloseBtn = document.getElementById("toast-close-btn");
    }

    initEvents() {
      // 1. Navigation handling
      this.navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetView = link.getAttribute("data-nav-target");
          if (targetView && this.viewContainers[targetView]) {
            this.switchView(targetView);
            this.closeMobileDrawer();
          }
        });
      });

      // 1.5 Analytics chart timeframe switch delegation
      if (this.analyticsChartsContainer) {
        this.analyticsChartsContainer.addEventListener("click", async (e) => {
          const btn = e.target.closest("[data-analytics-timeframe]");
          if (btn) {
            const tf = btn.getAttribute("data-analytics-timeframe");
            if (tf && tf !== this.analyticsTimeframe) {
              this.analyticsTimeframe = tf;
              await this.fetchAndRenderAnalytics(tf);
            }
          }
        });
      }

      // 2. Sign Out button at bottom of sidebar (opens modal dialog)
      if (this.signOutBtn) {
        this.signOutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openSignOutDialog();
        });
      }

      if (this.btnCancelSignOut) {
        this.btnCancelSignOut.addEventListener("click", () => {
          this.closeSignOutDialog();
        });
      }

      if (this.btnConfirmSignOut) {
        this.btnConfirmSignOut.addEventListener("click", () => {
          this.executeSignOut();
        });
      }

      if (this.signOutModal) {
        this.signOutModal.addEventListener("click", (e) => {
          if (e.target === this.signOutModal) {
            this.closeSignOutDialog();
          }
        });
      }

      // 3. Notification Bell Dropdown Toggle
      if (this.notifBellBtn) {
        this.notifBellBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleNotificationDropdown();
        });
      }

      // Close notification dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (this.isNotificationDropdownOpen && this.notifDropdown) {
          if (!this.notifDropdown.contains(e.target) && !this.notifBellBtn.contains(e.target)) {
            this.closeNotificationDropdown();
          }
        }
      });

      // Mark all notifications as read button in dropdown
      if (this.clearNotifBtn) {
        this.clearNotifBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          await this.markAllNotificationsAsRead();
        });
      }

      // Individual notification click to mark as read
      if (this.notifDropdownList) {
        this.notifDropdownList.addEventListener("click", async (e) => {
          const item = e.target.closest("[data-notif-id]");
          if (item) {
            const notifId = item.getAttribute("data-notif-id");
            const isRead = item.getAttribute("data-is-read") === "true";
            if (!isRead && notifId) {
              await this.markNotificationAsRead(notifId);
            }
          }
        });
      }

      // 4. Mobile Drawer Toggle
      if (this.mobileMenuBtn) {
        this.mobileMenuBtn.addEventListener("click", () => this.toggleMobileDrawer());
      }
      if (this.sidebarBackdrop) {
        this.sidebarBackdrop.addEventListener("click", () => this.closeMobileDrawer());
      }

      // 5. Post Service Modal
      this.openPostModalBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openPostModal();
        });
      });
      this.closePostModalBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.closePostModal();
        });
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closePostModal();
          this.closeNotificationDropdown();
        }
      });

      if (this.postServiceModal) {
        this.postServiceModal.addEventListener("click", (e) => {
          if (e.target === this.postServiceModal) {
            this.closePostModal();
          }
        });
      }

      // Dual-Source Image Tabs & File Upload Handling
      if (this.tabBtnUploadFile) {
        this.tabBtnUploadFile.addEventListener("click", () => this.switchImageSourceTab("upload"));
      }
      if (this.tabBtnImageUrl) {
        this.tabBtnImageUrl.addEventListener("click", () => this.switchImageSourceTab("url"));
      }

      if (this.serviceUploadDropzone) {
        this.serviceUploadDropzone.addEventListener("click", () => {
          if (this.serviceFileInput) this.serviceFileInput.click();
        });

        ["dragenter", "dragover"].forEach(eventName => {
          this.serviceUploadDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.serviceUploadDropzone.classList.add("dropzone-active");
          });
        });

        ["dragleave", "drop"].forEach(eventName => {
          this.serviceUploadDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.serviceUploadDropzone.classList.remove("dropzone-active");
          });
        });

        this.serviceUploadDropzone.addEventListener("drop", (e) => {
          const dt = e.dataTransfer;
          const files = dt ? dt.files : null;
          if (files && files.length > 0) {
            this.handleFileSelect(files);
          }
        });
      }

      if (this.serviceFileInput) {
        this.serviceFileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files.length > 0) {
            this.handleFileSelect(e.target.files);
          }
        });
      }

      if (this.btnChangeUploadedFile) {
        this.btnChangeUploadedFile.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.serviceFileInput) this.serviceFileInput.click();
        });
      }

      if (this.btnRemoveUploadedFile) {
        this.btnRemoveUploadedFile.addEventListener("click", (e) => {
          e.preventDefault();
          this.clearUploadedImage();
        });
      }

      if (this.serviceImageInput && this.serviceImagePreview) {
        this.serviceImageInput.addEventListener("input", () => {
          const val = this.serviceImageInput.value.trim();
          if (val) {
            this.serviceImagePreview.src = val;
            this.serviceImagePreview.classList.remove("hidden");
            if (this.serviceImagePreviewPlaceholder) {
              this.serviceImagePreviewPlaceholder.classList.add("hidden");
            }
          } else {
            this.serviceImagePreview.src = "";
            this.serviceImagePreview.classList.add("hidden");
            if (this.serviceImagePreviewPlaceholder) {
              this.serviceImagePreviewPlaceholder.classList.remove("hidden");
            }
          }
        });
      }

      if (this.postServiceForm) {
        this.postServiceForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleCreateServiceSubmit();
        });
      }

      // Delete Dialog Events
      if (this.btnCancelDelete) {
        this.btnCancelDelete.addEventListener("click", () => this.closeDeleteDialog());
      }
      if (this.btnConfirmDelete) {
        this.btnConfirmDelete.addEventListener("click", () => this.executeDeleteService());
      }
      if (this.deleteServiceModal) {
        this.deleteServiceModal.addEventListener("click", (e) => {
          if (e.target === this.deleteServiceModal) {
            this.closeDeleteDialog();
          }
        });
      }

      // 6. Global Action Delegation
      document.addEventListener("click", (e) => {
        const confirmBtn = e.target.closest("[data-action='confirm-booking']");
        if (confirmBtn) {
          const id = confirmBtn.getAttribute("data-id");
          this.handleBookingStatusChange(id, "Confirmed");
          return;
        }

        const completeBtn = e.target.closest("[data-action='complete-booking']");
        if (completeBtn) {
          const id = completeBtn.getAttribute("data-id");
          this.handleBookingStatusChange(id, "Completed");
          return;
        }

        const cancelBtn = e.target.closest("[data-action='cancel-booking']");
        if (cancelBtn) {
          const id = cancelBtn.getAttribute("data-id");
          this.handleBookingStatusChange(id, "Cancelled");
          return;
        }

        const deleteServiceBtn = e.target.closest("[data-action='delete-service']");
        if (deleteServiceBtn) {
          const id = deleteServiceBtn.getAttribute("data-id");
          const title = deleteServiceBtn.getAttribute("data-title") || "";
          this.openDeleteDialog(id, title);
          return;
        }

        const editServiceBtn = e.target.closest("[data-action='edit-service']");
        if (editServiceBtn) {
          const id = editServiceBtn.getAttribute("data-id");
          this.openEditModal(id);
          return;
        }

        const bookingPill = e.target.closest("[data-booking-filter]");
        if (bookingPill) {
          const status = bookingPill.getAttribute("data-booking-filter");
          this.setBookingFilter(status);
          return;
        }

        const servicePill = e.target.closest("[data-service-filter]");
        if (servicePill) {
          const cat = servicePill.getAttribute("data-service-filter");
          this.setServiceCategoryFilter(cat);
          return;
        }
      });

      // 7. Live Search Input
      const bookingSearchInput = document.getElementById("booking-search-input");
      if (bookingSearchInput) {
        let searchDebounceTimer = null;
        bookingSearchInput.addEventListener("input", (e) => {
          this.bookingSearchQuery = e.target.value.toLowerCase().trim();
          this.renderBookingsTable();

          if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(async () => {
            const list = await this.fetchBookings(this.bookingStatusFilter, this.bookingSearchQuery);
            if (list) {
              this.renderBookingsTable(list);
            }
          }, 250);
        });
      }

      // 8. Toast Close
      if (this.toastCloseBtn) {
        this.toastCloseBtn.addEventListener("click", () => this.hideToast());
      }
    }

    // --- Notification Popover Dropdown Controls (API Integration) ---
    async fetchNotifications() {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      if (!token) return null;

      try {
        const response = await fetch(API_NOTIFICATIONS_URL, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            this.hasLoadedNotifications = true;
            this.unreadNotifCount = typeof data.unreadCount === "number" ? data.unreadCount : 0;
            this.notificationsList = Array.isArray(data.notifications) ? data.notifications : [];
            if (store && store.setNotifications) {
              store.setNotifications(this.notificationsList);
            }
            this.updateNotificationBellBadge();
            this.renderNotificationDropdown();
            return data;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch notifications from API:", err);
      }
      return null;
    }

    async toggleNotificationDropdown() {
      if (this.isNotificationDropdownOpen) {
        this.closeNotificationDropdown();
      } else {
        await this.openNotificationDropdown();
      }
    }

    async openNotificationDropdown() {
      if (!this.notifDropdown) return;
      this.isNotificationDropdownOpen = true;
      this.notifDropdown.classList.remove("hidden");
      this.renderNotificationDropdown();
      await this.fetchNotifications();
    }

    closeNotificationDropdown() {
      if (!this.notifDropdown) return;
      this.isNotificationDropdownOpen = false;
      this.notifDropdown.classList.add("hidden");
    }

    renderNotificationDropdown() {
      if (!this.notifDropdownList || !UI) return;
      const notifications = this.hasLoadedNotifications
        ? (this.notificationsList || [])
        : ((this.notificationsList && this.notificationsList.length > 0)
            ? this.notificationsList
            : (store ? store.getNotifications() : []));

      this.notifDropdownList.innerHTML = UI.renderNotificationDropdown(notifications);

      const unread = this.unreadNotifCount !== undefined && this.unreadNotifCount !== null
        ? this.unreadNotifCount
        : notifications.filter(n => !n.isRead).length;

      if (this.notifUnreadBadge) {
        this.notifUnreadBadge.textContent = `${unread} Unread`;
      }
      this.updateNotificationBellBadge();
    }

    updateNotificationBellBadge() {
      if (!this.notifBellBadge) return;
      const count = this.unreadNotifCount !== undefined && this.unreadNotifCount !== null
        ? this.unreadNotifCount
        : (this.notificationsList && this.notificationsList.length > 0
            ? this.notificationsList.filter(n => !n.isRead).length
            : (store ? store.getUnreadNotificationsCount() : 0));

      if (count > 0) {
        this.notifBellBadge.textContent = count > 99 ? "99+" : count;
        this.notifBellBadge.classList.remove("hidden");
      } else {
        this.notifBellBadge.classList.add("hidden");
      }

      if (this.notifUnreadBadge) {
        this.notifUnreadBadge.textContent = `${count} Unread`;
      }
    }

    async markAllNotificationsAsRead() {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);

      try {
        if (token) {
          const response = await fetch(`${API_NOTIFICATIONS_URL}/read-all`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            this.notificationsList.forEach(n => { n.isRead = true; });
            this.unreadNotifCount = 0;
            if (store && store.markAllNotificationsRead) {
              store.markAllNotificationsRead();
            }
            this.updateNotificationBellBadge();
            this.renderNotificationDropdown();
            return data;
          }
        }
      } catch (err) {
        console.warn("Failed to mark all as read via API:", err);
      }

      // Local fallback
      if (store && store.markAllNotificationsRead) {
        store.markAllNotificationsRead();
      }
      this.notificationsList.forEach(n => { n.isRead = true; });
      this.unreadNotifCount = 0;
      this.updateNotificationBellBadge();
      this.renderNotificationDropdown();
    }

    async markNotificationAsRead(notifId) {
      if (!notifId) return;
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);

      try {
        if (token) {
          const response = await fetch(`${API_NOTIFICATIONS_URL}/${notifId}/read`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            const item = this.notificationsList.find(n => (n._id || n.id) === notifId);
            if (item && !item.isRead) {
              item.isRead = true;
              if (this.unreadNotifCount > 0) this.unreadNotifCount--;
            }
            if (data && typeof data.unreadCount === "number") {
              this.unreadNotifCount = data.unreadCount;
            }
            if (store && store.markNotificationRead) {
              store.markNotificationRead(notifId);
            }
            this.updateNotificationBellBadge();
            this.renderNotificationDropdown();
            return data;
          }
        }
      } catch (err) {
        console.warn("Failed to mark notification as read via API:", err);
      }

      // Local fallback
      const item = this.notificationsList.find(n => (n._id || n.id) === notifId);
      if (item && !item.isRead) {
        item.isRead = true;
        if (this.unreadNotifCount > 0) this.unreadNotifCount--;
      }
      if (store && store.markNotificationRead) {
        store.markNotificationRead(notifId);
      }
      this.updateNotificationBellBadge();
      this.renderNotificationDropdown();
    }

    // --- Mobile Drawer Controls ---
    toggleMobileDrawer() {
      if (!this.sidebar) return;
      const isHidden = this.sidebar.classList.contains("-translate-x-full");
      if (isHidden) {
        this.sidebar.classList.remove("-translate-x-full");
        if (this.sidebarBackdrop) this.sidebarBackdrop.classList.remove("hidden");
      } else {
        this.closeMobileDrawer();
      }
    }

    closeMobileDrawer() {
      if (!this.sidebar) return;
      this.sidebar.classList.add("-translate-x-full");
      if (this.sidebarBackdrop) this.sidebarBackdrop.classList.add("hidden");
    }

    // --- View Switcher ---
    switchView(viewName) {
      this.currentView = viewName;

      this.navLinks.forEach(link => {
        const target = link.getAttribute("data-nav-target");
        if (target === viewName) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      Object.keys(this.viewContainers).forEach(key => {
        const container = this.viewContainers[key];
        if (container) {
          if (key === viewName) {
            container.classList.remove("hidden");
          } else {
            container.classList.add("hidden");
          }
        }
      });

      if (this.viewTitle && this.viewSubtitle) {
        switch (viewName) {
          case "dashboard":
            this.viewTitle.textContent = "Dashboard Overview";
            this.viewSubtitle.textContent = "Real-time dispatch metrics, pending queue & platform KPIs";
            this.renderDashboardView();
            break;
          case "bookings":
            this.viewTitle.textContent = "Manage Bookings";
            this.viewSubtitle.textContent = "Search, filter, confirm, or complete customer service orders";
            this.renderBookingsView();
            break;
          case "services":
            this.viewTitle.textContent = "Category Services";
            this.viewSubtitle.textContent = "Browse and publish services across 6 lifestyle verticals";
            this.renderServicesView();
            break;
        }
      }

      this.updateBadges();
    }

    updateBadges() {
      if (!store) return;
      const kpis = store.getKPIs();
      const pendingCount = (this.statusCounts && this.statusCounts.Pending !== undefined)
        ? this.statusCounts.Pending
        : (kpis.pendingCount || 0);

      if (this.sidebarPendingBadge) {
        this.sidebarPendingBadge.textContent = pendingCount;
        if (pendingCount > 0) {
          this.sidebarPendingBadge.classList.remove("hidden");
        } else {
          this.sidebarPendingBadge.classList.add("hidden");
        }
      }
      if (this.headerPendingBadge) {
        this.headerPendingBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>${pendingCount} Pending</span>
        `;
      }
      this.updateNotificationBellBadge();
    }

    render() {
      this.updateBadges();
      this.switchView(this.currentView);
      this.renderNotificationDropdown();
      this.fetchNotifications();
    }

    // =========================================================================
    // 1. Dashboard View (Real-time Backend API Integration)
    // =========================================================================
    async fetchDashboardMetrics() {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      if (!token) {
        console.warn("No admin Bearer token found. Skipping remote dashboard fetch.");
        return null;
      }

      try {
        const response = await fetch(API_DASHBOARD_URL, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.warn(`Dashboard API responded with ${response.status}: ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        if (data && data.success) {
          return data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching real-time dashboard data:", error);
        return null;
      }
    }

    async fetchAnalytics(timeframe = "7d") {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      if (!token) {
        console.warn("No admin Bearer token found. Skipping remote analytics fetch.");
        return null;
      }

      try {
        const response = await fetch(`${API_ANALYTICS_URL}?range=${timeframe}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.warn(`Analytics API responded with ${response.status}: ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        if (data && data.success) {
          this.analyticsData = data;
          if (store && store.setAnalyticsData) {
            store.setAnalyticsData(data);
          }
          return data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        return null;
      }
    }

    async fetchAndRenderAnalytics(timeframe = null) {
      if (timeframe) {
        this.analyticsTimeframe = timeframe;
      }
      const tf = this.analyticsTimeframe || "7d";
      const analyticsContainer = document.getElementById("dashboard-analytics-charts");
      if (!analyticsContainer || !UI || !UI.renderAnalyticsCharts) return;

      const data = await this.fetchAnalytics(tf);
      if (data) {
        analyticsContainer.innerHTML = UI.renderAnalyticsCharts(data, tf);
      } else {
        const fallbackData = this.analyticsData || (store && store.getKPIs()) || {};
        analyticsContainer.innerHTML = UI.renderAnalyticsCharts(fallbackData, tf);
      }
    }

    async renderDashboardView() {
      if (!UI) return;

      const kpiContainer = document.getElementById("dashboard-kpis-container");
      const distContainer = document.getElementById("dashboard-category-distribution");
      const recentTableBody = document.getElementById("dashboard-pending-tbody");
      const recentEmptyState = document.getElementById("dashboard-pending-empty");

      // 1. Attempt to fetch real-time data from GET /api/admin/dashboard
      const remoteData = await this.fetchDashboardMetrics();

      if (remoteData) {
        // Sync with local reactive store
        if (store && store.setDashboardData) {
          store.setDashboardData(remoteData);
        }

        const { kpis, catalogStats, recentPendingBookings } = remoteData;

        // (1) Render KPIs (totalBookings, pendingCount, confirmedCount, completedCount, grossRevenue, fulfilledRate)
        if (kpiContainer && UI.renderKPICards) {
          kpiContainer.innerHTML = UI.renderKPICards(kpis);
        }

        // (1.5) Render Dynamic Analytics Charts
        await this.fetchAndRenderAnalytics(this.analyticsTimeframe || "7d");

        // (2) Render Category Distribution
        if (distContainer && UI.renderCategoryDistribution && catalogStats) {
          const categoryCounts = catalogStats.categoryCounts || {};
          if (!catalogStats.categoryCounts && Array.isArray(catalogStats.categoryDistribution)) {
            catalogStats.categoryDistribution.forEach(cat => {
              categoryCounts[cat.category || cat.name] = cat.count;
            });
          }
          distContainer.innerHTML = UI.renderCategoryDistribution(
            categoryCounts, 
            catalogStats.totalServices || 0, 
            catalogStats.categoryDistribution
          );
        }

        // (3) Render Recent Pending Bookings (populated latest 10 Pending bookings)
        const pendingList = Array.isArray(recentPendingBookings) ? recentPendingBookings : [];
        if (recentTableBody && UI.renderBookingTableRow) {
          if (pendingList.length === 0) {
            recentTableBody.innerHTML = "";
            if (recentEmptyState) recentEmptyState.classList.remove("hidden");
          } else {
            if (recentEmptyState) recentEmptyState.classList.add("hidden");
            recentTableBody.innerHTML = pendingList
              .slice(0, 10)
              .map(b => UI.renderBookingTableRow(b, false))
              .join("");
          }
        }

        // Synchronize pending count badge in sidebar and header
        if (this.sidebarPendingBadge && kpis.pendingCount !== undefined) {
          this.sidebarPendingBadge.textContent = kpis.pendingCount;
          if (kpis.pendingCount > 0) {
            this.sidebarPendingBadge.classList.remove("hidden");
          } else {
            this.sidebarPendingBadge.classList.add("hidden");
          }
        }
        if (this.headerPendingBadge && kpis.pendingCount !== undefined) {
          this.headerPendingBadge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>${kpis.pendingCount} Pending</span>
          `;
        }
        return;
      }

      // Fallback: If backend is unreachable or no token, render cached/local store data
      if (store) {
        const kpis = store.getKPIs();
        const services = store.getServices();
        const categoryCounts = store.getCategoryCounts();
        const allBookings = store.getBookings();

        if (kpiContainer && UI.renderKPICards) {
          kpiContainer.innerHTML = UI.renderKPICards(kpis);
        }

        const analyticsContainer = document.getElementById("dashboard-analytics-charts");
        if (analyticsContainer && UI.renderAnalyticsCharts) {
          analyticsContainer.innerHTML = UI.renderAnalyticsCharts(this.analyticsData || kpis, allBookings, this.analyticsTimeframe || "7d");
        }

        if (distContainer && UI.renderCategoryDistribution) {
          distContainer.innerHTML = UI.renderCategoryDistribution(categoryCounts, services.length);
        }

        const pendingBookings = allBookings.filter(b => b.status === "Pending");
        if (recentTableBody && UI.renderBookingTableRow) {
          if (pendingBookings.length === 0) {
            recentTableBody.innerHTML = "";
            if (recentEmptyState) recentEmptyState.classList.remove("hidden");
          } else {
            if (recentEmptyState) recentEmptyState.classList.add("hidden");
            recentTableBody.innerHTML = pendingBookings
              .slice(0, 10)
              .map(b => UI.renderBookingTableRow(b, false))
              .join("");
          }
        }
      }
    }

    // =========================================================================
    // 2. Manage Bookings View (GET & PATCH API Integration)
    // =========================================================================
    async fetchBookings(status = null, search = null) {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      try {
        let url = API_BOOKINGS_URL;
        const params = new URLSearchParams();
        if (status && status !== "All") {
          params.append("status", status);
        }
        if (search && search.trim()) {
          params.append("search", search.trim());
        }
        const qs = params.toString();
        if (qs) {
          url += `?${qs}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            if (data.statusCounts) {
              this.statusCounts = data.statusCounts;
              this.updateBadges();
            }
            const list = Array.isArray(data.bookings) ? data.bookings : [];
            if (!search && (!status || status === "All")) {
              if (store && store.setBookings) {
                store.setBookings(list);
              }
            }
            return list;
          }
        }
      } catch (e) {
        console.warn("Backend GET /api/admin/bookings failed, falling back to local store", e);
      }
      return null;
    }

    async renderBookingsView() {
      // 1. Initial render from local store
      this.renderBookingFilterPills();
      this.renderBookingsTable();

      // 2. Fetch real-time from backend GET /api/admin/bookings
      const list = await this.fetchBookings(this.bookingStatusFilter, this.bookingSearchQuery);
      if (list) {
        this.renderBookingFilterPills();
        this.renderBookingsTable(list);
      }
    }

    async setBookingFilter(status) {
      this.bookingStatusFilter = status;
      this.renderBookingFilterPills();
      this.renderBookingsTable();

      const list = await this.fetchBookings(this.bookingStatusFilter, this.bookingSearchQuery);
      if (list) {
        this.renderBookingFilterPills();
        this.renderBookingsTable(list);
      }
    }

    renderBookingFilterPills() {
      if (!store) return;
      const allBookings = store.getBookings();
      const counts = this.statusCounts || {
        All: allBookings.length,
        Pending: allBookings.filter(b => b.status === "Pending").length,
        Confirmed: allBookings.filter(b => b.status === "Confirmed").length,
        Completed: allBookings.filter(b => b.status === "Completed").length,
        Cancelled: allBookings.filter(b => b.status === "Cancelled").length
      };

      const pills = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];
      const container = document.getElementById("booking-filter-pills");
      if (!container) return;

      container.innerHTML = pills.map(pill => {
        const isActive = this.bookingStatusFilter === pill;
        let badgeClass = "bg-slate-200 text-slate-700";
        if (pill === "Pending") badgeClass = "bg-amber-200 text-amber-900";
        if (pill === "Confirmed") badgeClass = "bg-blue-200 text-blue-900";
        if (pill === "Completed") badgeClass = "bg-emerald-200 text-emerald-900";
        if (pill === "Cancelled") badgeClass = "bg-rose-200 text-rose-900";

        const countVal = counts[pill] !== undefined ? counts[pill] : 0;

        return `
          <button data-booking-filter="${pill}" 
                  class="filter-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-2 cursor-pointer ${isActive ? 'active' : 'bg-white text-slate-600 hover:bg-slate-50'}">
            <span>${pill}</span>
            <span class="pill-badge px-1.5 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-white/30 text-white' : badgeClass}">
              ${countVal}
            </span>
          </button>
        `;
      }).join("");
    }

    renderBookingsTable(customList = null) {
      if (!store || !UI) return;
      const tableBody = document.getElementById("bookings-table-tbody");
      const emptyState = document.getElementById("bookings-empty-state");
      const resultsCount = document.getElementById("bookings-results-count");
      if (!tableBody) return;

      let list = Array.isArray(customList) ? customList : store.getBookings();

      if (!customList && this.bookingStatusFilter !== "All") {
        list = list.filter(b => b.status === this.bookingStatusFilter);
      }

      if (!customList && this.bookingSearchQuery) {
        const q = this.bookingSearchQuery.toLowerCase();
        list = list.filter(b => {
          const id = (b.id || b._id || "").toLowerCase();
          const custName = ((b.customer && b.customer.name) || (b.user && b.user.name) || "").toLowerCase();
          const custPhone = ((b.customer && (b.customer.phone || b.customer.email)) || (b.user && (b.user.phone || b.user.email)) || "").toLowerCase();
          const street = ((b.address && (b.address.street || b.address)) || (b.user && b.user.address) || "").toLowerCase();
          const city = (b.address && typeof b.address === "object" && b.address.city ? b.address.city : "").toLowerCase();
          const title = (b.serviceTitle || (b.service && (b.service.title || b.service.name)) || "").toLowerCase();
          const cat = (b.category || (b.service && b.service.category) || "").toLowerCase();
          return (
            id.includes(q) ||
            custName.includes(q) ||
            custPhone.includes(q) ||
            street.includes(q) ||
            city.includes(q) ||
            title.includes(q) ||
            cat.includes(q)
          );
        });
      }

      if (resultsCount) {
        resultsCount.textContent = `Showing ${list.length} booking${list.length === 1 ? '' : 's'}`;
      }

      if (list.length === 0) {
        tableBody.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
      } else {
        if (emptyState) emptyState.classList.add("hidden");
        tableBody.innerHTML = list.map(b => UI.renderBookingTableRow(b, false)).join("");
      }
    }

    async handleBookingStatusChange(bookingId, newStatus) {
      if (newStatus === "Cancelled") {
        if (!confirm(`Are you sure you want to cancel booking #${bookingId}?`)) {
          return;
        }
      }

      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);

      try {
        const response = await fetch(`${API_BOOKINGS_URL}/${bookingId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          const booking = data.booking || {};
          const notification = data.notification || {};
          const customerName = (booking.customer && booking.customer.name) || (booking.user && booking.user.name) || "Customer";

          if (store && store.updateBookingStatus) {
            store.updateBookingStatus(bookingId, newStatus);
          }

          if (notification && notification.title && store && store.addNotification) {
            store.addNotification({
              ...notification,
              customerName: customerName
            });
          }

          // Show confirmation toast
          this.showToast({
            title: notification.title || (newStatus === "Confirmed" ? "Booking Confirmed! 🚀" : (newStatus === "Completed" ? "Service Completed! ✨" : "Booking Cancelled ⚠️")),
            message: notification.message || data.message || `Booking #${bookingId} has been updated to ${newStatus}.`,
            customerName: customerName
          });

          // Refresh both Manage Bookings table & Dashboard Overview KPIs
          const list = await this.fetchBookings(this.bookingStatusFilter, this.bookingSearchQuery);
          this.renderBookingFilterPills();
          this.renderBookingsTable(list || undefined);

          await this.renderDashboardView();
          this.updateBadges();
          this.renderNotificationDropdown();
          return;
        } else {
          alert(data.message || `Failed to update booking status (${response.status})`);
        }
      } catch (err) {
        console.error("Failed to update booking status via API:", err);
      }

      // Offline / fallback execution
      if (store) {
        const result = store.updateBookingStatus(bookingId, newStatus);
        if (result) {
          const { booking, notification } = result;
          const customerName = (booking.customer && booking.customer.name) || (booking.user && booking.user.name) || "Customer";

          this.showToast({
            title: notification.title,
            message: notification.message,
            customerName: customerName
          });

          this.renderBookingFilterPills();
          this.renderBookingsTable();
          this.renderDashboardView();
          this.updateBadges();
          this.renderNotificationDropdown();
        }
      }
    }

    // =========================================================================
    // 3. Category Services View (GET, PATCH, DELETE API Integration)
    // =========================================================================
    async fetchServices(category = null, search = null) {
      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      try {
        let url = API_SERVICES_URL;
        const params = new URLSearchParams();
        if (category && category !== "All") {
          params.append("category", category);
        }
        if (search) {
          params.append("search", search);
        }
        const qs = params.toString();
        if (qs) {
          url += `?${qs}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          const list = data.services || data.data || (Array.isArray(data) ? data : null);
          if (Array.isArray(list)) {
            if (!category || category === "All") {
              if (store && store.setServices) {
                store.setServices(list);
              }
            }
            return list;
          }
        }
      } catch (e) {
        console.warn("Backend GET /services failed, falling back to local store", e);
      }
      return null;
    }

    async renderServicesView() {
      this.renderServiceCategoryPills();
      this.renderServicesGrid();

      // Fetch all services from backend to ensure category pill counts and grid are 100% accurate
      const list = await this.fetchServices();
      if (list) {
        this.renderServiceCategoryPills();
        this.renderServicesGrid();
      }
    }

    async setServiceCategoryFilter(category) {
      this.serviceCategoryFilter = category;
      this.renderServiceCategoryPills();
      this.renderServicesGrid();
    }

    renderServiceCategoryPills() {
      if (!store) return;
      const services = store.getServices();
      const categoryCounts = store.getCategoryCounts();
      const container = document.getElementById("service-category-pills");
      if (!container) return;

      const pills = ["All", ...CATEGORIES];

      container.innerHTML = pills.map(cat => {
        const isActive = this.serviceCategoryFilter === cat;
        const count = cat === "All" ? services.length : (categoryCounts[cat] || 0);

        return `
          <button data-service-filter="${cat}" 
                  class="filter-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-2 cursor-pointer ${isActive ? 'active' : 'bg-white text-slate-600 hover:bg-slate-50'}">
            <span>${cat}</span>
            <span class="pill-badge px-1.5 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-700'}">
              ${count}
            </span>
          </button>
        `;
      }).join("");
    }

    renderServicesGrid(customList = null) {
      if (!store || !UI) return;
      const grid = document.getElementById("services-cards-grid");
      const emptyState = document.getElementById("services-empty-state");
      const countLabel = document.getElementById("services-count-label");
      if (!grid) return;

      let list = Array.isArray(customList) ? customList : store.getServices();
      if (!customList && this.serviceCategoryFilter !== "All") {
        list = list.filter(s => s.category === this.serviceCategoryFilter);
      }

      if (countLabel) {
        countLabel.textContent = `${list.length} Services in Catalog`;
      }

      if (list.length === 0) {
        grid.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
      } else {
        if (emptyState) emptyState.classList.add("hidden");
        grid.innerHTML = list.map(s => UI.renderServiceCard(s)).join("");
      }
    }

    // =========================================================================
    // Custom Sign Out Confirmation Dialog
    // =========================================================================
    openSignOutDialog() {
      if (this.signOutModal) {
        this.signOutModal.classList.remove("hidden");
        this.signOutModal.classList.add("flex");
        document.body.classList.add("overflow-hidden");
      }
    }

    closeSignOutDialog() {
      if (this.signOutModal) {
        this.signOutModal.classList.add("hidden");
        this.signOutModal.classList.remove("flex");
        document.body.classList.remove("overflow-hidden");
      }
    }

    executeSignOut() {
      this.closeSignOutDialog();
      if (this.notifPollTimer) {
        clearInterval(this.notifPollTimer);
        this.notifPollTimer = null;
      }
      if (store) {
        store.logout();
      }
      // Ensure all tokens and session state are wiped completely
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("servicepro_admin_session_v5");
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
      }
      this.onSignOut();
    }

    // =========================================================================
    // Custom Delete Service Confirmation Dialog
    // =========================================================================
    openDeleteDialog(serviceId, serviceTitle = "") {
      if (!serviceId) return;

      // If title not passed from attribute, look it up in store
      if (!serviceTitle && store) {
        const srv = store.getServices().find(s => (s.id || s._id) === serviceId);
        if (srv) serviceTitle = srv.name || srv.title || "";
      }

      this.servicePendingDeletion = { id: serviceId, title: serviceTitle };
      if (this.deleteServiceTitleEl) {
        this.deleteServiceTitleEl.textContent = serviceTitle ? `'${serviceTitle}'` : "this service";
      }

      if (this.deleteServiceModal) {
        this.deleteServiceModal.classList.remove("hidden");
        this.deleteServiceModal.classList.add("flex");
        document.body.classList.add("overflow-hidden");
      }
    }

    closeDeleteDialog() {
      if (this.deleteServiceModal) {
        this.deleteServiceModal.classList.add("hidden");
        this.deleteServiceModal.classList.remove("flex");
        document.body.classList.remove("overflow-hidden");
      }
      this.servicePendingDeletion = null;
    }

    async executeDeleteService() {
      if (!this.servicePendingDeletion || !this.servicePendingDeletion.id) return;
      const { id: serviceId, title: serviceTitle } = this.servicePendingDeletion;

      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);

      if (this.btnConfirmDelete) {
        this.btnConfirmDelete.disabled = true;
        this.btnConfirmDelete.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Deleting...
        `;
      }

      try {
        const response = await fetch(`${API_SERVICES_URL}/${serviceId}`, {
          method: "DELETE",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          if (store && store.deleteService) {
            store.deleteService(serviceId);
          }
          this.closeDeleteDialog();
          await this.fetchServices();
          this.renderServicesView();
          await this.renderDashboardView();
          this.updateBadges();

          this.showToast({
            title: "Service Deleted",
            message: data.message || `'${serviceTitle || "Service"}' was removed from the live mobile app catalog.`,
            customerName: "Catalog Manager"
          });
          return;
        } else {
          alert(data.message || `Failed to delete service (${response.status}: ${response.statusText})`);
        }
      } catch (err) {
        console.error("Failed to delete service via API:", err);
        // Fallback: Delete locally
        if (store) {
          store.deleteService(serviceId);
          this.closeDeleteDialog();
          this.renderServicesView();
          this.updateBadges();

          this.showToast({
            title: "Service Removed (Offline)",
            message: `'${serviceTitle || "Service"}' was removed from local storage.`,
            customerName: "Catalog Manager"
          });
          return;
        }
      } finally {
        if (this.btnConfirmDelete) {
          this.btnConfirmDelete.disabled = false;
          this.btnConfirmDelete.innerHTML = `<span>Delete Service</span>`;
        }
      }
    }

    openPostModal() {
      if (!this.postServiceModal) return;
      this.editingServiceId = null;
      const idInput = document.getElementById("modal-service-id");
      if (idInput) idInput.value = "";

      if (this.modalHeaderTitle) {
        this.modalHeaderTitle.textContent = "Post New Service";
      }
      if (this.modalHeaderSubtitle) {
        this.modalHeaderSubtitle.textContent = "Publish a new service to consumer mobile app catalog";
      }
      if (this.modalSubmitText) {
        this.modalSubmitText.textContent = "Publish to App Catalog";
      }

      this.postServiceModal.classList.remove("hidden");
      this.postServiceModal.classList.add("flex");
      document.body.classList.add("overflow-hidden");

      const select = document.getElementById("modal-service-category");
      if (select) {
        select.innerHTML = CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join("");
        if (this.serviceCategoryFilter !== "All") {
          select.value = this.serviceCategoryFilter;
        }
      }
      const durationInput = document.getElementById("modal-service-duration");
      if (durationInput) durationInput.value = "60";
      const featuredInput = document.getElementById("modal-service-featured");
      if (featuredInput) featuredInput.checked = false;
      this.clearUploadedImage();
      this.switchImageSourceTab("upload");
    }

    openEditModal(serviceId) {
      if (!this.postServiceModal || !store) return;

      const services = store.getServices();
      const service = services.find(s => (s.id || s._id) === serviceId || String(s.id) === String(serviceId) || String(s._id) === String(serviceId));

      if (!service) {
        alert("Service not found in catalog.");
        return;
      }

      this.editingServiceId = serviceId;
      const idInput = document.getElementById("modal-service-id");
      if (idInput) idInput.value = serviceId;

      if (this.modalHeaderTitle) {
        this.modalHeaderTitle.textContent = "Edit Service";
      }
      if (this.modalHeaderSubtitle) {
        this.modalHeaderSubtitle.textContent = "Update service details, pricing, duration, or cover image";
      }
      if (this.modalSubmitText) {
        this.modalSubmitText.textContent = "Save Changes";
      }

      const select = document.getElementById("modal-service-category");
      if (select) {
        select.innerHTML = CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join("");
        select.value = service.category || CATEGORIES[0];
      }

      const priceInput = document.getElementById("modal-service-price");
      if (priceInput) priceInput.value = service.price !== undefined ? service.price : "";

      const titleInput = document.getElementById("modal-service-title");
      if (titleInput) titleInput.value = service.name || service.title || "";

      const descInput = document.getElementById("modal-service-desc");
      if (descInput) descInput.value = service.description || "";

      const durationInput = document.getElementById("modal-service-duration");
      if (durationInput) durationInput.value = service.durationMinutes || service.duration || 60;

      const featuredInput = document.getElementById("modal-service-featured");
      if (featuredInput) featuredInput.checked = Boolean(service.isFeatured);

      // Pre-fill image
      this.clearUploadedImage();
      const currentImg = service.image || service.imageUrl || "";
      if (this.serviceImageInput) {
        this.serviceImageInput.value = currentImg;
      }

      if (currentImg) {
        if (this.serviceImagePreview) {
          this.serviceImagePreview.src = currentImg;
          this.serviceImagePreview.classList.remove("hidden");
        }
        if (this.serviceImagePreviewPlaceholder) {
          this.serviceImagePreviewPlaceholder.classList.add("hidden");
        }
        this.switchImageSourceTab("url");
      } else {
        this.switchImageSourceTab("upload");
      }

      this.postServiceModal.classList.remove("hidden");
      this.postServiceModal.classList.add("flex");
      document.body.classList.add("overflow-hidden");
    }

    switchImageSourceTab(mode) {
      this.activeImageSourceTab = mode;
      if (mode === "upload") {
        if (this.tabBtnUploadFile) {
          this.tabBtnUploadFile.className = "px-2.5 py-1 rounded-lg transition-all text-brand-indigo font-bold bg-white shadow-2xs cursor-pointer flex items-center gap-1.5";
        }
        if (this.tabBtnImageUrl) {
          this.tabBtnImageUrl.className = "px-2.5 py-1 rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5";
        }
        if (this.imagePaneUpload) this.imagePaneUpload.classList.remove("hidden");
        if (this.imagePaneUrl) this.imagePaneUrl.classList.add("hidden");
      } else {
        if (this.tabBtnImageUrl) {
          this.tabBtnImageUrl.className = "px-2.5 py-1 rounded-lg transition-all text-brand-indigo font-bold bg-white shadow-2xs cursor-pointer flex items-center gap-1.5";
        }
        if (this.tabBtnUploadFile) {
          this.tabBtnUploadFile.className = "px-2.5 py-1 rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5";
        }
        if (this.imagePaneUrl) this.imagePaneUrl.classList.remove("hidden");
        if (this.imagePaneUpload) this.imagePaneUpload.classList.add("hidden");
      }
    }

    handleFileSelect(files) {
      if (!files || files.length === 0) return;
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPG, PNG, WEBP, or SVG).");
        return;
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert("Selected image is larger than 5MB. Please choose a smaller image.");
        return;
      }

      this.uploadedImageFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImageBase64 = e.target.result;
        this.uploadedFileName = file.name;
        this.uploadedFileSize = file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
          : (file.size / 1024).toFixed(1) + " KB";

        if (this.serviceUploadedPreviewImg) {
          this.serviceUploadedPreviewImg.src = this.uploadedImageBase64;
        }
        if (this.serviceUploadedFileName) {
          this.serviceUploadedFileName.textContent = this.uploadedFileName;
        }
        if (this.serviceUploadedFileSize) {
          this.serviceUploadedFileSize.textContent = this.uploadedFileSize;
        }

        if (this.serviceUploadDropzone) {
          this.serviceUploadDropzone.classList.add("hidden");
        }
        if (this.serviceUploadedPreviewCard) {
          this.serviceUploadedPreviewCard.classList.remove("hidden");
        }
      };

      reader.readAsDataURL(file);
    }

    clearUploadedImage() {
      this.uploadedImageFile = null;
      this.uploadedImageBase64 = null;
      this.uploadedFileName = "";
      this.uploadedFileSize = "";
      if (this.serviceFileInput) {
        this.serviceFileInput.value = "";
      }
      if (this.serviceUploadedPreviewCard) {
        this.serviceUploadedPreviewCard.classList.add("hidden");
      }
      if (this.serviceUploadDropzone) {
        this.serviceUploadDropzone.classList.remove("hidden");
      }
    }

    closePostModal() {
      if (!this.postServiceModal) return;
      this.editingServiceId = null;
      const idInput = document.getElementById("modal-service-id");
      if (idInput) idInput.value = "";

      if (this.modalHeaderTitle) {
        this.modalHeaderTitle.textContent = "Post New Service";
      }
      if (this.modalHeaderSubtitle) {
        this.modalHeaderSubtitle.textContent = "Publish a new service to consumer mobile app catalog";
      }
      if (this.modalSubmitText) {
        this.modalSubmitText.textContent = "Publish to App Catalog";
      }
      this.postServiceModal.classList.add("hidden");
      this.postServiceModal.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
      if (this.postServiceForm) {
        this.postServiceForm.reset();
      }
      this.clearUploadedImage();
      this.switchImageSourceTab("upload");
      if (this.serviceImagePreview) {
        this.serviceImagePreview.src = "";
        this.serviceImagePreview.classList.add("hidden");
      }
      if (this.serviceImagePreviewPlaceholder) {
        this.serviceImagePreviewPlaceholder.classList.remove("hidden");
      }
      if (this.serviceImageInput) {
        this.serviceImageInput.value = "";
      }
    }

    async handleCreateServiceSubmit() {
      const isEditing = Boolean(this.editingServiceId);
      const serviceIdToEdit = this.editingServiceId;

      const category = document.getElementById("modal-service-category")?.value;
      const title = document.getElementById("modal-service-title")?.value.trim();
      const description = document.getElementById("modal-service-desc")?.value.trim();
      const price = document.getElementById("modal-service-price")?.value;
      const duration = document.getElementById("modal-service-duration")?.value;
      const isFeatured = Boolean(document.getElementById("modal-service-featured")?.checked);

      if (!title || !price || !category) {
        alert("Please fill in the required fields: Title, Category, and Price.");
        return;
      }

      const fileToUpload = this.uploadedImageFile || (this.serviceFileInput && this.serviceFileInput.files && this.serviceFileInput.files[0]);
      const urlVal = document.getElementById("service-image-url")?.value.trim();

      if (!isEditing) {
        if (this.activeImageSourceTab === "upload" && !fileToUpload && !this.uploadedImageBase64) {
          alert("Please select or drop an image file (up to 5MB).");
          return;
        }
        if (this.activeImageSourceTab === "url" && !urlVal) {
          alert("Please enter a valid image URL.");
          return;
        }
      }

      const submitBtn = document.querySelector("#post-service-modal button[type='submit']");
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : (isEditing ? "Save Changes" : "Publish to App Catalog");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          ${isEditing ? "Saving Changes..." : "Publishing..."}
        `;
      }

      const token = (store && store.getAccessToken()) || (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
      if (!token) {
        alert("Authorization required. Please log in as an administrator first.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }

      // Construct FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append("name", title);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description || "");
      formData.append("price", price);
      formData.append("durationMinutes", duration || "60");
      formData.append("duration", duration || "60");
      formData.append("isFeatured", isFeatured ? "true" : "false");

      if (this.activeImageSourceTab === "upload" && fileToUpload) {
        formData.append("imageFile", fileToUpload);
      } else if (urlVal) {
        formData.append("image", urlVal);
        formData.append("imageUrl", urlVal);
      } else if (this.uploadedImageBase64) {
        formData.append("image", this.uploadedImageBase64);
      }

      try {
        const requestUrl = isEditing ? `${API_SERVICES_URL}/${serviceIdToEdit}` : API_SERVICES_URL;
        const requestMethod = isEditing ? "PUT" : "POST";

        const response = await fetch(requestUrl, {
          method: requestMethod,
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json().catch(() => ({}));

        if ((response.ok || response.status === 200 || response.status === 201) && data.success) {
          const respService = data.service || {};

          if (isEditing) {
            if (store && store.updateService) {
              store.updateService(serviceIdToEdit, {
                name: respService.name || title,
                title: respService.name || title,
                category: respService.category || category,
                description: respService.description !== undefined ? respService.description : description,
                price: respService.price !== undefined ? respService.price : parseFloat(price),
                duration: respService.durationMinutes || duration || 60,
                durationMinutes: respService.durationMinutes || duration || 60,
                imageUrl: respService.image || urlVal || "",
                image: respService.image || urlVal || "",
                isFeatured: respService.isFeatured !== undefined ? respService.isFeatured : isFeatured
              });
            }
          } else {
            // Update local store state for immediate view rendering
            if (store && store.addService) {
              store.addService({
                id: respService._id || respService.id || `srv-${Date.now()}`,
                _id: respService._id || respService.id,
                name: respService.name || title,
                title: respService.name || title,
                category: respService.category || category,
                description: respService.description || description,
                price: respService.price !== undefined ? respService.price : price,
                duration: respService.durationMinutes || duration || 60,
                durationMinutes: respService.durationMinutes || duration || 60,
                imageUrl: respService.image || urlVal || "",
                image: respService.image || urlVal || "",
                rating: respService.rating !== undefined ? respService.rating : 5.0,
                reviewCount: respService.reviewCount || 0,
                isFeatured: respService.isFeatured !== undefined ? respService.isFeatured : isFeatured
              });
            }
          }

          this.closePostModal();

          await this.fetchServices();
          if (this.currentView === "services") {
            this.renderServiceCategoryPills();
            this.renderServicesGrid();
          } else {
            this.switchView("services");
          }
          await this.renderDashboardView();
          this.updateBadges();

          this.showToast({
            title: isEditing ? "Service Updated ✨" : (isFeatured ? "Service Published & Featured! ⭐" : "Service Published to App 🚀"),
            message: isEditing 
              ? `'${respService.name || title}' details were successfully updated.`
              : `'${respService.name || title}' is now live in '${respService.category || category}' at $${Number(respService.price || price).toFixed(2)}.`,
            customerName: "Consumer App Catalog"
          });

          this.renderNotificationDropdown();
        } else {
          const errMsg = data.message || `Failed to ${isEditing ? 'update' : 'create'} service (${response.status}: ${response.statusText})`;
          alert(errMsg);
        }
      } catch (err) {
        console.error(`Failed to ${isEditing ? 'update' : 'post'} service:`, err);
        // Fallback: If network/server is completely unreachable, save locally so workflow isn't blocked
        if (isEditing) {
          if (store && store.updateService) {
            store.updateService(serviceIdToEdit, {
              title,
              name: title,
              category,
              description,
              price: parseFloat(price),
              duration: parseInt(duration, 10) || 60,
              durationMinutes: parseInt(duration, 10) || 60,
              isFeatured
            });
          }
        } else {
          if (store && store.addService) {
            const fallbackImg = (this.activeImageSourceTab === "upload" ? this.uploadedImageBase64 : urlVal) || "";
            store.addService({
              title,
              name: title,
              category,
              description,
              price: parseFloat(price),
              duration: parseInt(duration, 10) || 60,
              durationMinutes: parseInt(duration, 10) || 60,
              imageUrl: fallbackImg,
              image: fallbackImg,
              isFeatured
            });
          }
        }

        this.closePostModal();
        this.renderServicesView();
        this.renderDashboardView();
        this.updateBadges();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    }

    // =========================================================================
    // Live Push Notification Toast Banner
    // =========================================================================
    showToast({ title, message, customerName }) {
      if (!this.toastContainer) return;

      if (this.toastTitle) this.toastTitle.textContent = title;
      if (this.toastMessage) this.toastMessage.textContent = message;
      if (this.toastTarget) {
        this.toastTarget.textContent = customerName ? `Push target: ${customerName}` : "Target: Mobile Device";
      }

      this.toastContainer.classList.remove("hidden", "animate-toast-out");
      this.toastContainer.classList.add("flex", "animate-toast-in");

      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.hideToast();
      }, 5500);
    }

    hideToast() {
      if (!this.toastContainer) return;
      this.toastContainer.classList.remove("animate-toast-in");
      this.toastContainer.classList.add("animate-toast-out");

      setTimeout(() => {
        this.toastContainer.classList.add("hidden");
        this.toastContainer.classList.remove("flex", "animate-toast-out");
      }, 250);
    }
  }

  if (typeof window !== "undefined") {
    window.ServiceProDashboard = { DashboardController };
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { DashboardController };
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
