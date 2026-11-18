/**
 * ServicePro Admin Portal - State & Auth Store
 * Manages dynamic reactive state for Bookings, Services, Notifications, and Backend Auth Session.
 * Clean, production-ready store with zero dummy data.
 */

(function(root) {
  const CATEGORIES = [
    "Plumbing",
    "Electrical",
    "Painting",
    "AC & Appliances",
    "Cleaning",
    "Spa"
  ];

  class ServiceProStore {
    constructor() {
      this.STORAGE_KEY = "servicepro_admin_state_v5";
      this.AUTH_KEY = "servicepro_admin_session_v5";
      this.bookings = [];
      this.services = [];
      this.notifications = [];
      this.analyticsData = null;
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isLoggedIn = false;

      this.loadState();
      this.loadAuth();
    }

    // --- Authentication & Tokens ---
    loadAuth() {
      const isBrowser = typeof localStorage !== "undefined";
      if (!isBrowser) {
        this.isLoggedIn = false;
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        return;
      }

      try {
        const keepMePref = localStorage.getItem("keepMeSignedIn");

        // If user explicitly chose NOT to keep signed in (keepMePref === 'false'):
        // Check only sessionStorage (current tab session). If tab/browser closed, sessionStorage is empty.
        if (keepMePref === "false") {
          const sessionAuth = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(this.AUTH_KEY) : null;
          const sessionToken = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("accessToken") : null;
          const sessionRefresh = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("refreshToken") : null;
          const sessionUser = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("adminUser") : null;

          if (sessionAuth) {
            const parsed = JSON.parse(sessionAuth);
            this.accessToken = parsed.accessToken || sessionToken || null;
            this.refreshToken = parsed.refreshToken || sessionRefresh || null;
            this.user = parsed.user || (sessionUser ? JSON.parse(sessionUser) : null);
            this.isLoggedIn = Boolean(parsed.isLoggedIn && (this.accessToken || this.user));
            this.rememberMe = false;
            return;
          } else if (sessionToken) {
            this.accessToken = sessionToken;
            this.refreshToken = sessionRefresh || null;
            this.user = sessionUser ? JSON.parse(sessionUser) : null;
            this.isLoggedIn = true;
            this.rememberMe = false;
            return;
          }

          // No session in sessionStorage: session expired on tab close
          this.isLoggedIn = false;
          this.user = null;
          this.accessToken = null;
          this.refreshToken = null;
          this.rememberMe = false;
          return;
        }

        // When "Keep me signed in" was checked (default / true):
        // Check localStorage first, then fallback to sessionStorage
        const savedAuth = localStorage.getItem(this.AUTH_KEY) || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(this.AUTH_KEY) : null);
        const directAccessToken = localStorage.getItem("accessToken") || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("accessToken") : null);
        const directRefreshToken = localStorage.getItem("refreshToken") || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("refreshToken") : null);
        const directAdminUser = localStorage.getItem("adminUser") || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("adminUser") : null);

        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          this.accessToken = parsed.accessToken || directAccessToken || parsed.token || null;
          this.refreshToken = parsed.refreshToken || directRefreshToken || null;
          this.user = parsed.user || (directAdminUser ? JSON.parse(directAdminUser) : null);
          this.isLoggedIn = Boolean(parsed.isLoggedIn && (this.accessToken || this.user));
          this.rememberMe = true;
          return;
        } else if (directAccessToken) {
          this.accessToken = directAccessToken;
          this.refreshToken = directRefreshToken || null;
          this.user = directAdminUser ? JSON.parse(directAdminUser) : null;
          this.isLoggedIn = true;
          this.rememberMe = true;
          return;
        }
      } catch (e) {
        console.warn("Failed to parse auth state", e);
      }
      this.isLoggedIn = false;
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.rememberMe = true;
    }

    saveAuth(rememberMe = true) {
      if (typeof localStorage === "undefined") return;

      const authPayload = JSON.stringify({
        isLoggedIn: this.isLoggedIn,
        user: this.user,
        accessToken: this.accessToken || null,
        refreshToken: this.refreshToken || null,
        rememberMe: Boolean(rememberMe)
      });

      try {
        if (!this.isLoggedIn) {
          // Logged out: remove from both localStorage and sessionStorage
          localStorage.removeItem(this.AUTH_KEY);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminUser");
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem(this.AUTH_KEY);
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("adminUser");
          }
          return;
        }

        if (rememberMe) {
          // "Keep me signed in" is CHECKED: Store in persistent localStorage
          localStorage.setItem("keepMeSignedIn", "true");
          localStorage.setItem(this.AUTH_KEY, authPayload);
          if (this.accessToken) localStorage.setItem("accessToken", this.accessToken);
          if (this.refreshToken) localStorage.setItem("refreshToken", this.refreshToken);
          if (this.user) localStorage.setItem("adminUser", JSON.stringify(this.user));

          // Also mirror to sessionStorage
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(this.AUTH_KEY, authPayload);
            if (this.accessToken) sessionStorage.setItem("accessToken", this.accessToken);
            if (this.refreshToken) sessionStorage.setItem("refreshToken", this.refreshToken);
            if (this.user) sessionStorage.setItem("adminUser", JSON.stringify(this.user));
          }
        } else {
          // "Keep me signed in" is UNCHECKED: Store ONLY in sessionStorage
          localStorage.setItem("keepMeSignedIn", "false");
          localStorage.removeItem(this.AUTH_KEY);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminUser");

          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(this.AUTH_KEY, authPayload);
            if (this.accessToken) sessionStorage.setItem("accessToken", this.accessToken);
            if (this.refreshToken) sessionStorage.setItem("refreshToken", this.refreshToken);
            if (this.user) sessionStorage.setItem("adminUser", JSON.stringify(this.user));
          }
        }
      } catch (e) {
        console.error("Auth storage write error", e);
      }
    }

    isAuthenticated() {
      return Boolean(this.isLoggedIn && (this.accessToken || this.user));
    }

    getCurrentUser() {
      return this.user || {
        name: "Administrator",
        email: "",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      };
    }

    getAccessToken() {
      return this.accessToken || 
        (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null) ||
        (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("accessToken") : null);
    }

    getRefreshToken() {
      return this.refreshToken || 
        (typeof localStorage !== "undefined" ? localStorage.getItem("refreshToken") : null) ||
        (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("refreshToken") : null);
    }

    getToken() {
      return this.getAccessToken();
    }

    setAuthSession({ accessToken, refreshToken, token, user, admin, raw, rememberMe = true }) {
      this.isLoggedIn = true;
      this.accessToken = accessToken || token || null;
      this.refreshToken = refreshToken || null;
      this.rememberMe = Boolean(rememberMe !== undefined ? rememberMe : true);

      const adminData = admin || user || {};
      this.user = {
        id: adminData.id || adminData._id || null,
        name: adminData.name || (adminData.email ? adminData.email.split("@")[0] : "Administrator"),
        email: adminData.email || "",
        role: adminData.role || "admin",
        avatar: adminData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      };

      this.saveAuth(this.rememberMe);
      return {
        success: true,
        user: this.user,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        rememberMe: this.rememberMe
      };
    }

    logout() {
      this.isLoggedIn = false;
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.saveAuth(false);
      return true;
    }

    // --- State Persistence ---
    loadState() {
      if (typeof localStorage === "undefined") {
        this.bookings = [];
        this.services = [];
        this.notifications = [];
        return;
      }
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.bookings = Array.isArray(parsed.bookings) ? parsed.bookings : [];
          this.services = Array.isArray(parsed.services) ? parsed.services : [];
          this.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
          this.analyticsData = parsed.analyticsData || null;
          return;
        }
      } catch (e) {
        console.warn("Failed to parse saved state", e);
      }
      this.bookings = [];
      this.services = [];
      this.notifications = [];
      this.analyticsData = null;
    }

    saveState() {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          bookings: this.bookings,
          services: this.services,
          notifications: this.notifications,
          analyticsData: this.analyticsData
        }));
      } catch (e) {
        console.error("LocalStorage write error", e);
      }
    }

    // --- Booking Operations ---
    getBookings() {
      return [...this.bookings];
    }

    getBookingById(id) {
      return this.bookings.find(b => b.id === id || b._id === id);
    }

    setBookings(list) {
      if (!Array.isArray(list)) {
        this.bookings = [];
        this.saveState();
        return;
      }
      this.bookings = list.map(b => {
        const bookingId = b.id || b._id || `b-${Date.now()}`;
        const userName = (b.user && b.user.name) || (b.customer && b.customer.name) || "Customer";
        const userEmail = (b.user && b.user.email) || (b.customer && b.customer.email) || "";
        const userPhone = (b.user && (b.user.phone || b.user.email)) || (b.customer && (b.customer.phone || b.customer.email)) || "N/A";
        const userAvatar = (b.user && b.user.image) || (b.customer && b.customer.avatar) || "";
        const srvTitle = b.serviceTitle || (b.service && (b.service.title || b.service.name)) || "Service";
        const srvCategory = b.category || (b.service && b.service.category) || "General";
        const priceNum = typeof b.price === "number" ? b.price : (typeof b.totalPrice === "number" ? b.totalPrice : (parseFloat(b.price || b.totalPrice) || 0));

        let street = "";
        let city = "";
        if (typeof b.address === "string") {
          street = b.address;
        } else if (b.address && typeof b.address === "object") {
          street = b.address.street || "";
          city = b.address.city || "";
        } else if (b.user && b.user.address) {
          street = b.user.address;
        }

        return {
          id: bookingId,
          _id: bookingId,
          date: b.date || "",
          timeSlot: b.timeSlot || "",
          address: { street, city },
          price: priceNum,
          totalPrice: priceNum,
          status: b.status || "Pending",
          notes: b.notes || "",
          serviceTitle: srvTitle,
          category: srvCategory,
          customer: {
            name: userName,
            email: userEmail,
            phone: userPhone,
            avatar: userAvatar
          },
          user: b.user || {
            name: userName,
            email: userEmail,
            address: street
          },
          service: b.service || {
            name: srvTitle,
            category: srvCategory,
            price: priceNum
          },
          createdAt: b.createdAt || new Date().toISOString()
        };
      });
      this.saveState();
    }

    setDashboardData(data) {
      this.dashboardData = data;
      if (data && Array.isArray(data.recentPendingBookings)) {
        data.recentPendingBookings.forEach(pb => {
          const pbId = pb.id || pb._id;
          const idx = this.bookings.findIndex(b => (b.id || b._id) === pbId);
          if (idx >= 0) {
            this.bookings[idx] = { ...this.bookings[idx], ...pb };
          } else {
            this.bookings.unshift(pb);
          }
        });
        this.saveState();
      }
    }

    getDashboardData() {
      return this.dashboardData || null;
    }

    updateBookingStatus(id, newStatus) {
      const booking = this.bookings.find(b => b.id === id || b._id === id);
      if (!booking) return null;

      booking.status = newStatus;
      const bookingId = booking.id || booking._id || id;
      
      // Also update in cached dashboardData if present
      if (this.dashboardData && Array.isArray(this.dashboardData.recentPendingBookings)) {
        this.dashboardData.recentPendingBookings = this.dashboardData.recentPendingBookings.filter(b => (b.id || b._id) !== id);
        if (this.dashboardData.kpis && this.dashboardData.kpis.pendingCount > 0) {
          this.dashboardData.kpis.pendingCount--;
          if (newStatus === "Confirmed") this.dashboardData.kpis.confirmedCount = (this.dashboardData.kpis.confirmedCount || 0) + 1;
          if (newStatus === "Completed") this.dashboardData.kpis.completedCount = (this.dashboardData.kpis.completedCount || 0) + 1;
        }
      }

      let notifTitle = "";
      let notifMsg = "";

      if (newStatus === "Confirmed") {
        notifTitle = "Booking Confirmed! 🚀";
        notifMsg = `Booking #${bookingId} for '${booking.serviceTitle || (booking.service && booking.service.name) || "Service"}' has been confirmed.`;
      } else if (newStatus === "Completed") {
        notifTitle = "Service Completed! ✨";
        notifMsg = `Service #${bookingId} has been marked completed.`;
      } else if (newStatus === "Cancelled") {
        notifTitle = "Booking Cancelled ⚠️";
        notifMsg = `Booking #${bookingId} has been cancelled.`;
      }

      const customerName = (booking.customer && booking.customer.name) || (booking.user && booking.user.name) || "Customer";

      const notificationItem = {
        id: `notif-${Date.now()}`,
        bookingId: bookingId,
        customerName: customerName,
        type: newStatus.toUpperCase(),
        title: notifTitle,
        message: notifMsg,
        channel: "Push & App Alert",
        timestamp: "Just now",
        isRead: false,
        deliveryStatus: "Dispatched"
      };

      this.notifications.unshift(notificationItem);
      this.saveState();

      return { booking, notification: notificationItem };
    }

    // --- Service Catalog Operations ---
    getServices() {
      return [...this.services];
    }

    setServices(list) {
      this.services = Array.isArray(list) ? list.map(s => {
        const srvId = s.id || s._id || `srv-${Date.now()}`;
        return {
          id: srvId,
          _id: srvId,
          title: s.title || s.name || "Service",
          name: s.name || s.title || "Service",
          category: s.category || "General",
          description: s.description || "",
          price: typeof s.price === "number" ? s.price : (parseFloat(s.price) || 0),
          duration: s.duration || s.durationMinutes || 60,
          durationMinutes: s.durationMinutes || s.duration || 60,
          rating: s.rating !== undefined ? s.rating : 4.5,
          reviewsCount: s.reviewsCount !== undefined ? s.reviewsCount : (s.reviewCount !== undefined ? s.reviewCount : 0),
          reviewCount: s.reviewCount !== undefined ? s.reviewCount : (s.reviewsCount !== undefined ? s.reviewsCount : 0),
          imageUrl: s.imageUrl || s.image || "",
          image: s.image || s.imageUrl || "",
          isFeatured: Boolean(s.isFeatured),
          status: s.status || "Active",
          createdAt: s.createdAt || new Date().toISOString()
        };
      }) : [];
      this.saveState();
    }

    addService(serviceData) {
      const srvId = serviceData.id || serviceData._id || `srv-${Date.now()}`;
      const newService = {
        id: srvId,
        _id: srvId,
        title: serviceData.title || serviceData.name || "Service",
        name: serviceData.name || serviceData.title || "Service",
        category: serviceData.category || "General",
        description: serviceData.description || "",
        price: parseFloat(serviceData.price) || 0.00,
        duration: parseInt(serviceData.duration || serviceData.durationMinutes, 10) || 60,
        durationMinutes: parseInt(serviceData.durationMinutes || serviceData.duration, 10) || 60,
        rating: serviceData.rating !== undefined ? serviceData.rating : 5.0,
        reviewsCount: serviceData.reviewsCount !== undefined ? serviceData.reviewsCount : (serviceData.reviewCount || 0),
        reviewCount: serviceData.reviewCount !== undefined ? serviceData.reviewCount : (serviceData.reviewsCount || 0),
        imageUrl: serviceData.imageUrl || serviceData.image || "",
        image: serviceData.image || serviceData.imageUrl || "",
        isFeatured: Boolean(serviceData.isFeatured),
        status: serviceData.status || "Active",
        createdAt: serviceData.createdAt || new Date().toISOString()
      };

      this.services.unshift(newService);

      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        bookingId: "CATALOG",
        customerName: "App Catalog",
        type: "SYSTEM",
        title: `New Service: ${newService.title}`,
        message: `Published under '${newService.category}' at $${newService.price.toFixed(2)}.`,
        channel: "Catalog Feed",
        timestamp: "Just now",
        isRead: false,
        deliveryStatus: "Published"
      });

      this.saveState();
      return newService;
    }

    deleteService(serviceId) {
      this.services = this.services.filter(s => (s.id !== serviceId && s._id !== serviceId));
      this.saveState();
    }

    updateService(serviceId, updates) {
      const srv = this.services.find(s => s.id === serviceId || s._id === serviceId);
      if (srv) {
        Object.assign(srv, updates);
        this.saveState();
        return srv;
      }
      return null;
    }

    // --- Notifications Operations ---
    getNotifications() {
      return [...this.notifications];
    }

    setNotifications(list) {
      if (!Array.isArray(list)) {
        this.notifications = [];
        this.saveState();
        return;
      }
      this.notifications = list.map(n => ({
        id: n._id || n.id || `notif-${Date.now()}`,
        _id: n._id || n.id || `notif-${Date.now()}`,
        user: n.user || "",
        recipientRole: n.recipientRole || "admin",
        title: n.title || "Notification",
        message: n.message || "",
        bookingId: n.bookingId || n.booking || "",
        type: n.type || "BOOKING",
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt || new Date().toISOString(),
        updatedAt: n.updatedAt || new Date().toISOString()
      }));
      this.saveState();
    }

    addNotification(notif) {
      if (!notif) return null;
      const item = {
        id: notif._id || notif.id || `notif-${Date.now()}`,
        _id: notif._id || notif.id || `notif-${Date.now()}`,
        bookingId: notif.booking || notif.bookingId || "",
        customerName: notif.customerName || "Customer",
        type: notif.type || "INFO",
        title: notif.title || "Notification",
        message: notif.message || "",
        channel: notif.channel || "Push & App Alert",
        timestamp: notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        isRead: Boolean(notif.isRead),
        deliveryStatus: "Dispatched"
      };
      this.notifications.unshift(item);
      this.saveState();
      return item;
    }

    markNotificationRead(id) {
      const item = this.notifications.find(n => n.id === id || n._id === id);
      if (item) {
        item.isRead = true;
        this.saveState();
      }
    }

    markAllNotificationsRead() {
      this.notifications.forEach(n => { n.isRead = true; });
      this.saveState();
    }

    clearNotifications() {
      this.notifications = [];
      this.saveState();
    }

    getUnreadNotificationsCount() {
      return this.notifications.filter(n => !n.isRead).length;
    }

    // --- Analytics Data ---
    setAnalyticsData(data) {
      this.analyticsData = data;
      this.saveState();
    }

    getAnalyticsData() {
      return this.analyticsData || null;
    }

    // --- Dashboard KPIs & Counts ---
    getKPIs() {
      if (this.dashboardData && this.dashboardData.kpis) {
        return this.dashboardData.kpis;
      }

      const totalBookings = this.bookings.length;
      const pendingCount = this.bookings.filter(b => b.status === "Pending").length;
      const confirmedCount = this.bookings.filter(b => b.status === "Confirmed").length;
      const completedCount = this.bookings.filter(b => b.status === "Completed").length;
      
      const totalRevenue = this.bookings
        .filter(b => b.status === "Completed" || b.status === "Confirmed")
        .reduce((sum, b) => sum + (parseFloat(b.price || b.totalPrice) || 0), 0);

      return {
        totalBookings,
        pendingCount,
        confirmedCount,
        completedCount,
        totalRevenue,
        grossRevenue: totalRevenue,
        fulfilledRate: totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0
      };
    }

    getCategoryCounts() {
      if (this.dashboardData && this.dashboardData.catalogStats && this.dashboardData.catalogStats.categoryCounts) {
        return this.dashboardData.catalogStats.categoryCounts;
      }

      const counts = {};
      CATEGORIES.forEach(cat => { counts[cat] = 0; });
      
      this.services.forEach(s => {
        if (counts[s.category] !== undefined) {
          counts[s.category]++;
        } else {
          counts[s.category] = 1;
        }
      });

      return counts;
    }
  }

  const store = new ServiceProStore();

  const exported = {
    CATEGORIES,
    store
  };

  if (typeof window !== "undefined") {
    window.ServiceProData = exported;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
