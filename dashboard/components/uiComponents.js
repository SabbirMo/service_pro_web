/**
 * ServicePro Admin Portal - Dashboard UI Components
 * Ultra-Premium SaaS Template Functions with Icons, Badges, Tables & Dropdowns
 */

(function(root) {
  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderStatusBadge(status) {
    switch (status) {
      case "Pending":
        return `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Pending
          </span>
        `;
      case "Confirmed":
        return `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/90 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            Confirmed
          </span>
        `;
      case "Completed":
        return `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            Completed
          </span>
        `;
      case "Cancelled":
        return `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            Cancelled
          </span>
        `;
      default:
        return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">${escapeHtml(status)}</span>`;
    }
  }

  function renderCategoryBadge(category) {
    let badgeClass = "bg-slate-50 text-slate-700 border-slate-200";
    let dotColor = "bg-slate-500";

    switch (category) {
      case "Plumbing":
        badgeClass = "bg-blue-50/90 text-blue-700 border-blue-200";
        dotColor = "bg-blue-500";
        break;
      case "Electrical":
        badgeClass = "bg-amber-50/90 text-amber-700 border-amber-200";
        dotColor = "bg-amber-500";
        break;
      case "Painting":
        badgeClass = "bg-purple-50/90 text-purple-700 border-purple-200";
        dotColor = "bg-purple-500";
        break;
      case "AC & Appliances":
        badgeClass = "bg-teal-50/90 text-teal-700 border-teal-200";
        dotColor = "bg-teal-500";
        break;
      case "Cleaning":
        badgeClass = "bg-emerald-50/90 text-emerald-700 border-emerald-200";
        dotColor = "bg-emerald-500";
        break;
      case "Spa":
        badgeClass = "bg-rose-50/90 text-rose-700 border-rose-200";
        dotColor = "bg-rose-500";
        break;
    }

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badgeClass} shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
        ${escapeHtml(category)}
      </span>
    `;
  }

  function renderKPICards(kpis) {
    const revenueVal = kpis.grossRevenue !== undefined ? kpis.grossRevenue : (kpis.totalRevenue || 0);
    const formattedRevenue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(revenueVal);
    const fulfilledRate = kpis.fulfilledRate !== undefined ? kpis.fulfilledRate : 88;

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 1. Total Bookings -->
        <div class="saas-card saas-card-hover p-6 relative overflow-hidden group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Total Bookings</span>
            <div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2.5">
            <span class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${kpis.totalBookings}</span>
            <span class="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              +14% mo/mo
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100/80">
            <span>Customer service volume</span>
            <span class="font-semibold text-slate-700">${fulfilledRate}% fulfilled</span>
          </div>
        </div>

        <!-- 2. Pending Action (Amber Glow Hero) -->
        <div class="saas-card kpi-amber-highlight p-6 relative overflow-hidden group">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold tracking-wider text-amber-800 uppercase">Pending Action</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2.5">
            <span class="text-3xl sm:text-4xl font-extrabold text-amber-700 tracking-tight">${kpis.pendingCount}</span>
            <span class="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Needs Dispatch
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-amber-800/80 pt-2 border-t border-amber-200/60 font-medium">
            <span>Awaiting confirmation</span>
            <span class="font-bold text-amber-900">Instant dispatch</span>
          </div>
        </div>

        <!-- 3. Confirmed & Active -->
        <div class="saas-card saas-card-hover p-6 relative overflow-hidden group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Confirmed & Active</span>
            <div class="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2.5">
            <span class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${kpis.confirmedCount}</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Pros On Route
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100/80">
            <span>Active service appointments</span>
            <span class="font-semibold text-slate-700">Calendar synced</span>
          </div>
        </div>

        <!-- 4. Gross Revenue -->
        <div class="saas-card saas-card-hover p-6 relative overflow-hidden group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Gross Revenue</span>
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2.5">
            <span class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${formattedRevenue}</span>
            <span class="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +8.4%
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100/80">
            <span>Fulfilled volume</span>
            <span class="font-semibold text-emerald-700">100% Cashless</span>
          </div>
        </div>
      </div>
    `;
  }

  function generateSplinePath(points) {
    if (!points || points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) * 0.18;
      const cp1y = p1.y + (p2.y - p0.y) * 0.18;
      const cp2x = p2.x - (p3.x - p1.x) * 0.18;
      const cp2y = p2.y - (p3.y - p1.y) * 0.18;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function renderAnalyticsCharts(analyticsOrKpis = {}, timeframeOrBookings = "7d", explicitTimeframe = null) {
    let timeframe = "7d";
    if (typeof timeframeOrBookings === "string") {
      timeframe = timeframeOrBookings;
    } else if (typeof explicitTimeframe === "string") {
      timeframe = explicitTimeframe;
    } else if (analyticsOrKpis && analyticsOrKpis.range) {
      timeframe = analyticsOrKpis.range;
    }

    const isRealAnalytics = Boolean(
      analyticsOrKpis &&
      analyticsOrKpis.revenueAnalytics &&
      analyticsOrKpis.fulfillmentPipeline
    );

    let grossRevenue = 0;
    let avgTicketNum = 0;
    let peakDailyVal = 0;
    let dayLabels = [];
    let dailyVals = [];

    let fulfilledRate = 0;
    let totalBookings = 0;
    let completedCount = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let compPct = 0;
    let confPct = 0;
    let pendPct = 0;
    let cancPct = 0;

    if (isRealAnalytics) {
      const rev = analyticsOrKpis.revenueAnalytics || {};
      const ful = analyticsOrKpis.fulfillmentPipeline || {};
      const bd = ful.breakdown || {};

      grossRevenue = rev.cycleVolume !== undefined ? rev.cycleVolume : 0;
      avgTicketNum = rev.averageTicket !== undefined ? rev.averageTicket : 0;
      peakDailyVal = rev.peakDayRate !== undefined ? rev.peakDayRate : 0;
      dayLabels = Array.isArray(rev.labels) ? rev.labels : [];
      dailyVals = Array.isArray(rev.revenues) ? rev.revenues : [];

      fulfilledRate = ful.fulfilledPercent !== undefined ? ful.fulfilledPercent : 0;
      totalBookings = ful.totalBookings !== undefined ? ful.totalBookings : 0;

      completedCount = (bd.completed && bd.completed.count !== undefined)
        ? bd.completed.count
        : (ful.completedCount !== undefined ? ful.completedCount : 0);
      compPct = (bd.completed && bd.completed.percent !== undefined)
        ? bd.completed.percent
        : (totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0);

      confirmedCount = (bd.confirmed && bd.confirmed.count !== undefined)
        ? bd.confirmed.count
        : (ful.confirmedCount !== undefined ? ful.confirmedCount : 0);
      confPct = (bd.confirmed && bd.confirmed.percent !== undefined)
        ? bd.confirmed.percent
        : (totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0);

      pendingCount = (bd.pending && bd.pending.count !== undefined)
        ? bd.pending.count
        : (ful.pendingCount !== undefined ? ful.pendingCount : 0);
      pendPct = (bd.pending && bd.pending.percent !== undefined)
        ? bd.pending.percent
        : (totalBookings > 0 ? Math.round((pendingCount / totalBookings) * 100) : 0);

      cancelledCount = (bd.cancelled && bd.cancelled.count !== undefined)
        ? bd.cancelled.count
        : (ful.cancelledCount !== undefined ? ful.cancelledCount : 0);
      cancPct = (bd.cancelled && bd.cancelled.percent !== undefined)
        ? bd.cancelled.percent
        : (totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0);
    } else {
      // Fallback: estimate from KPIs / Bookings
      const kpis = analyticsOrKpis || {};
      const bookings = Array.isArray(timeframeOrBookings) ? timeframeOrBookings : [];

      grossRevenue = kpis.grossRevenue !== undefined ? kpis.grossRevenue : (kpis.totalRevenue || 0);
      totalBookings = kpis.totalBookings !== undefined ? kpis.totalBookings : bookings.length;
      completedCount = kpis.completedCount !== undefined ? kpis.completedCount : 0;
      confirmedCount = kpis.confirmedCount !== undefined ? kpis.confirmedCount : 0;
      pendingCount = kpis.pendingCount !== undefined ? kpis.pendingCount : 0;
      cancelledCount = kpis.cancelledCount !== undefined ? kpis.cancelledCount : 0;

      fulfilledRate = kpis.fulfilledRate !== undefined
        ? kpis.fulfilledRate
        : (totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0);

      avgTicketNum = totalBookings > 0 ? Math.round(grossRevenue / totalBookings) : 0;

      let weights = [];
      if (timeframe === "30d") {
        dayLabels = ["Oct 20", "Oct 25", "Oct 30", "Nov 04", "Nov 09", "Nov 14", "Today"];
        weights = [0.08, 0.11, 0.14, 0.17, 0.19, 0.18, 0.13];
      } else {
        dayLabels = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Today"];
        weights = [0.07, 0.11, 0.14, 0.10, 0.21, 0.23, 0.14];
      }

      let runningRevSum = 0;
      for (let i = 0; i < dayLabels.length; i++) {
        if (i === dayLabels.length - 1) {
          const revRem = Math.max(0, grossRevenue - runningRevSum);
          dailyVals.push(revRem);
        } else {
          const revChunk = Math.round(grossRevenue * weights[i]);
          dailyVals.push(revChunk);
          runningRevSum += revChunk;
        }
      }
      peakDailyVal = Math.max(...dailyVals, 0);

      const totalOrdersForPct = totalBookings > 0 ? totalBookings : 1;
      compPct = Math.round((completedCount / totalOrdersForPct) * 100);
      confPct = Math.round((confirmedCount / totalOrdersForPct) * 100);
      pendPct = Math.round((pendingCount / totalOrdersForPct) * 100);
      cancPct = Math.round((cancelledCount / totalOrdersForPct) * 100);
    }

    const formattedRevenue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(grossRevenue);

    const avgTicket = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(avgTicketNum);

    const formattedPeakVal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(peakDailyVal);

    // Compute SVG Spline Coordinates
    const svgWidth = 640;
    const svgHeight = 200;
    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const baselineY = 160;
    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = baselineY - padTop;

    const rawMax = Math.max(...dailyVals, 20);
    let maxVal = 50;
    if (rawMax > 500) {
      maxVal = Math.ceil(rawMax / 100) * 100;
    } else if (rawMax > 250) {
      maxVal = 500;
    } else if (rawMax > 100) {
      maxVal = 250;
    } else if (rawMax > 50) {
      maxVal = 100;
    }

    const midVal = Math.round(maxVal / 2);
    const numPoints = Math.max(dailyVals.length, 1);

    const points = dailyVals.map((val, idx) => {
      const x = numPoints > 1
        ? padLeft + (idx / (numPoints - 1)) * plotWidth
        : padLeft + plotWidth / 2;
      const y = baselineY - (val / maxVal) * plotHeight;
      return {
        x,
        y,
        val,
        label: dayLabels[idx] || `Day ${idx + 1}`
      };
    });

    const splineLinePath = generateSplinePath(points);
    const lastPt = points[points.length - 1] || { x: padLeft, y: baselineY };
    const firstPt = points[0] || { x: padLeft, y: baselineY };
    const splineAreaPath = `${splineLinePath} L ${lastPt.x.toFixed(1)} ${baselineY} L ${firstPt.x.toFixed(1)} ${baselineY} Z`;

    const isDense = points.length > 15;
    const pointsMarkup = points.map(p => `
      <g class="chart-point group/pt cursor-pointer">
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isDense ? '7' : '10'}" fill="#4F46E5" fill-opacity="0.08" class="transition-transform group-hover/pt:scale-125" />
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isDense ? '3' : '4.5'}" fill="#FFFFFF" stroke="#4F46E5" stroke-width="${isDense ? '2' : '2.5'}" class="transition-transform group-hover/pt:scale-110" />
        <title>${p.label}: $${p.val}</title>
      </g>
    `).join("");

    const xLabelsMarkup = points.map((p, idx) => {
      const shouldShow = points.length <= 10 || (idx % Math.ceil(points.length / 6) === 0) || (idx === points.length - 1);
      if (!shouldShow) return "";
      return `
        <text x="${p.x.toFixed(1)}" y="185" text-anchor="middle" font-size="${isDense ? '10' : '11'}" font-weight="600" fill="#64748B">${p.label}</text>
      `;
    }).join("");

    // Donut Progress Ring Calculations
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const clampedRate = Math.min(Math.max(fulfilledRate, 0), 100);
    const dashOffset = circumference * (1 - clampedRate / 100);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Left: Revenue & Dispatch Analytics Chart (Col-span 8) -->
        <div class="lg:col-span-8 saas-card p-6 flex flex-col justify-between relative overflow-hidden group">
          
          <!-- Card Top Bar: Title & Timeframe Controls -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-extrabold text-slate-900 tracking-tight">Revenue & Dispatch Analytics</h3>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE DISPATCH
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Real-time daily transaction velocity & platform revenue trajectory</p>
            </div>

            <!-- Timeframe Filter Tabs -->
            <div class="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 shadow-2xs self-start sm:self-auto">
              <button type="button" 
                      data-analytics-timeframe="7d" 
                      class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeframe === "7d" ? "bg-white text-brand-indigo shadow-xs" : "text-slate-500 hover:text-slate-900"}">
                7 Days
              </button>
              <button type="button" 
                      data-analytics-timeframe="30d" 
                      class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeframe === "30d" ? "bg-white text-brand-indigo shadow-xs" : "text-slate-500 hover:text-slate-900"}">
                30 Days
              </button>
            </div>
          </div>

          <!-- Micro Metric Highlights Bar -->
          <div class="grid grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cycle Volume</span>
              <div class="flex items-baseline gap-1.5 mt-0.5">
                <span class="text-base sm:text-lg font-extrabold text-slate-900">${formattedRevenue}</span>
                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">+14.8%</span>
              </div>
            </div>
            <div class="border-l border-slate-200/70 pl-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Ticket</span>
              <span class="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">${avgTicket}</span>
            </div>
            <div class="border-l border-slate-200/70 pl-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Day Rate</span>
              <span class="text-base sm:text-lg font-extrabold text-indigo-600 mt-0.5 block">${formattedPeakVal}</span>
            </div>
          </div>

          <!-- Pure Native SVG Spline Vector Curve -->
          <div class="w-full relative overflow-hidden pt-2">
            <svg viewBox="0 0 640 200" class="w-full h-auto overflow-visible select-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.30" />
                  <stop offset="70%" stop-color="#4F46E5" stop-opacity="0.05" />
                  <stop offset="100%" stop-color="#4F46E5" stop-opacity="0.00" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines & Y-Labels -->
              <g class="grid-lines text-slate-400">
                <!-- Top (Max) -->
                <line x1="${padLeft}" y1="${padTop}" x2="${svgWidth - padRight}" y2="${padTop}" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="4 4" />
                <text x="${padLeft - 8}" y="${padTop + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">$${maxVal}</text>

                <!-- Middle (Half) -->
                <line x1="${padLeft}" y1="${padTop + plotHeight / 2}" x2="${svgWidth - padRight}" y2="${padTop + plotHeight / 2}" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="4 4" />
                <text x="${padLeft - 8}" y="${padTop + plotHeight / 2 + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">$${midVal}</text>

                <!-- Baseline (0) -->
                <line x1="${padLeft}" y1="${baselineY}" x2="${svgWidth - padRight}" y2="${baselineY}" stroke="#E2E8F0" stroke-width="1.5" />
                <text x="${padLeft - 8}" y="${baselineY + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">$0</text>
              </g>

              <!-- Gradient Area Fill -->
              <path d="${splineAreaPath}" fill="url(#splineGradient)" />

              <!-- Spline Stroke Curve -->
              <path d="${splineLinePath}" fill="none" stroke="#4F46E5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Data Point Markers -->
              ${pointsMarkup}

              <!-- Bottom X-Axis Day Labels -->
              ${xLabelsMarkup}
            </svg>
          </div>
        </div>

        <!-- Right: Fulfillment & Pipeline Health (Col-span 4) -->
        <div class="lg:col-span-4 saas-card p-6 flex flex-col justify-between relative overflow-hidden group">
          
          <!-- Card Top Bar -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight">Fulfillment & Pipeline</h3>
              <p class="text-xs text-slate-500 mt-0.5">Completion efficiency & dispatch breakdown</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Operations
            </span>
          </div>

          <!-- Circular Donut Ring Section -->
          <div class="flex items-center justify-center py-4">
            <div class="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 140 140" class="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="donutProgressGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#4F46E5" />
                    <stop offset="100%" stop-color="#06B6D4" />
                  </linearGradient>
                </defs>
                <!-- Background Ring -->
                <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#F1F5F9" stroke-width="11" />
                <!-- Progress Ring -->
                <circle cx="70" cy="70" r="${radius}" 
                        fill="none" 
                        stroke="url(#donutProgressGrad)" 
                        stroke-width="11" 
                        stroke-linecap="round" 
                        stroke-dasharray="${circumference.toFixed(2)}" 
                        stroke-dashoffset="${dashOffset.toFixed(2)}" 
                        class="transition-all duration-700 ease-out" />
              </svg>
              <!-- Center Metric Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${clampedRate}%</span>
                <span class="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">Fulfilled</span>
              </div>
            </div>
          </div>

          <!-- Status Distribution Progress Bars -->
          <div class="space-y-3 pt-2">
            <!-- Completed -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="flex items-center gap-1.5 font-bold text-slate-700">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Completed Orders
                </span>
                <span class="font-bold text-slate-900">${completedCount} <span class="text-[11px] font-normal text-slate-400">(${compPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${compPct}%"></div>
              </div>
            </div>

            <!-- Confirmed -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="flex items-center gap-1.5 font-bold text-slate-700">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  Confirmed & Pros En Route
                </span>
                <span class="font-bold text-slate-900">${confirmedCount} <span class="text-[11px] font-normal text-slate-400">(${confPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-blue-500 h-full rounded-full transition-all duration-500" style="width: ${confPct}%"></div>
              </div>
            </div>

            <!-- Pending -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="flex items-center gap-1.5 font-bold text-slate-700">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Dispatch
                </span>
                <span class="font-bold text-amber-700">${pendingCount} <span class="text-[11px] font-normal text-amber-600/70">(${pendPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${pendPct}%"></div>
              </div>
            </div>

            <!-- Cancelled -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="flex items-center gap-1.5 font-bold text-slate-700">
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  Cancelled
                </span>
                <span class="font-bold text-slate-900">${cancelledCount} <span class="text-[11px] font-normal text-slate-400">(${cancPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full transition-all duration-500" style="width: ${cancPct}%"></div>
              </div>
            </div>
          </div>

          <!-- Velocity Callout Footnote -->
          <div class="mt-4 p-3 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-brand-indigo flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800">Dispatch Push</span>
                <span class="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Live</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 truncate">Real-time alerts broadcast on booking status shifts</p>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  function renderCategoryDistribution(categoryCounts = {}, totalServices = 0, categoryDistribution = null) {
    const shareMap = {};
    if (Array.isArray(categoryDistribution)) {
      categoryDistribution.forEach(cat => {
        const key = cat.category || cat.name;
        if (key) {
          if (categoryCounts[key] === undefined && cat.count !== undefined) {
            categoryCounts[key] = cat.count;
          }
          if (cat.sharePercent !== undefined) {
            shareMap[key] = cat.sharePercent;
          }
        }
      });
    }

    const categoriesMeta = [
      { 
        name: "Plumbing", 
        color: "bg-blue-500", 
        text: "text-blue-700", 
        bgLight: "bg-blue-50/70", 
        border: "border-blue-200/80",
        iconSvg: `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`
      },
      { 
        name: "Electrical", 
        color: "bg-amber-500", 
        text: "text-amber-700", 
        bgLight: "bg-amber-50/70", 
        border: "border-amber-200/80",
        iconSvg: `<svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
      },
      { 
        name: "Painting", 
        color: "bg-purple-500", 
        text: "text-purple-700", 
        bgLight: "bg-purple-50/70", 
        border: "border-purple-200/80",
        iconSvg: `<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0 0a4 4 0 014-4m-4 4h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>`
      },
      { 
        name: "AC & Appliances", 
        color: "bg-teal-500", 
        text: "text-teal-700", 
        bgLight: "bg-teal-50/70", 
        border: "border-teal-200/80",
        iconSvg: `<svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
      },
      { 
        name: "Cleaning", 
        color: "bg-emerald-500", 
        text: "text-emerald-700", 
        bgLight: "bg-emerald-50/70", 
        border: "border-emerald-200/80",
        iconSvg: `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>`
      },
      { 
        name: "Spa", 
        color: "bg-rose-500", 
        text: "text-rose-700", 
        bgLight: "bg-rose-50/70", 
        border: "border-rose-200/80",
        iconSvg: `<svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`
      }
    ];

    return `
      <div class="saas-card p-6 sm:p-7">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight">Service Category Distribution</h3>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Live dispatch volume & active catalog offerings across 6 core lifestyle verticals</p>
          </div>
          <span class="text-xs font-bold px-3.5 py-1 bg-slate-100/80 text-slate-700 rounded-full border border-slate-200/80 shadow-sm">
            ${totalServices} Services Published
          </span>
        </div>

        <!-- Segmented Visual Bar -->
        <div class="h-3.5 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner mb-6 p-0.5">
          ${categoriesMeta.map(cat => {
            const count = categoryCounts[cat.name] || 0;
            const pct = totalServices > 0 ? (count / totalServices) * 100 : 0;
            return `
              <div class="${cat.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 ease-out" 
                   style="width: ${pct}%" 
                   title="${cat.name}: ${count} services (${Math.round(pct)}%)"></div>
            `;
          }).join("")}
        </div>

        <!-- Category Chips Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          ${categoriesMeta.map(cat => {
            const count = categoryCounts[cat.name] || 0;
            const pct = (shareMap[cat.name] !== undefined)
              ? shareMap[cat.name]
              : (totalServices > 0 ? Math.round((count / totalServices) * 100) : 0);
            return `
              <div class="flex flex-col justify-between p-3.5 rounded-2xl border ${cat.border} ${cat.bgLight} transition-all duration-200 hover:-translate-y-1 hover:shadow-sm cursor-pointer group">
                <div class="flex items-center justify-between mb-2">
                  <div class="w-7 h-7 rounded-lg bg-white/90 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                    ${cat.iconSvg}
                  </div>
                  <span class="text-xs font-extrabold ${cat.text}">${count}</span>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-900 truncate">${cat.name}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">${pct}% catalog share</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderBookingTableRow(booking, isCompact = false) {
    const bookingId = booking.id || booking._id || "";
    const customer = booking.customer || {
      name: (booking.user && booking.user.name) || "Customer",
      phone: (booking.user && (booking.user.phone || booking.user.email)) || "N/A",
      avatar: (booking.user && booking.user.image) || ""
    };
    const customerName = customer.name || "Customer";
    const customerPhone = customer.phone || "N/A";

    const customerAvatar = customer.avatar 
      ? `<div class="relative flex-shrink-0">
          <img src="${customer.avatar}" alt="${escapeHtml(customerName)}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=4F46E5&color=fff'">
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
         </div>`
      : `<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">${customerName.substring(0, 2).toUpperCase()}</div>`;

    const addressStreet = (booking.address && typeof booking.address === "object")
      ? (booking.address.street || "")
      : (typeof booking.address === "string" ? booking.address : ((booking.user && booking.user.address) || ""));
    const addressCity = (booking.address && typeof booking.address === "object")
      ? (booking.address.city || "")
      : "";
    const addressDisplay = addressCity ? `${escapeHtml(addressStreet)}, ${escapeHtml(addressCity)}` : escapeHtml(addressStreet || "Address N/A");

    const serviceTitle = (booking.service && (booking.service.name || booking.service.title)) || booking.serviceTitle || "Service";
    const category = (booking.service && booking.service.category) || booking.category || "General";
    const priceNum = typeof booking.price === "number" 
      ? booking.price 
      : (typeof booking.totalPrice === "number" ? booking.totalPrice : (parseFloat(booking.price) || parseFloat(booking.totalPrice) || 0));

    let actionButtonsHtml = "";

    if (booking.status === "Pending") {
      actionButtonsHtml = `
        <div class="flex items-center gap-2">
          <button data-action="confirm-booking" data-id="${bookingId}" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm hover:shadow transition active:scale-95 cursor-pointer" 
                  title="Confirm booking & push mobile notification to customer app">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Confirm
          </button>
          <button data-action="cancel-booking" data-id="${bookingId}" 
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition active:scale-95 cursor-pointer" 
                  title="Cancel booking and send customer cancellation notice">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      `;
    } else if (booking.status === "Confirmed") {
      actionButtonsHtml = `
        <div class="flex items-center gap-2">
          <button data-action="complete-booking" data-id="${bookingId}" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition active:scale-95 cursor-pointer" 
                  title="Mark service finished and request customer feedback rating">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Complete
          </button>
          <button data-action="cancel-booking" data-id="${bookingId}" 
                  class="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" 
                  title="Cancel Order">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
    } else if (booking.status === "Completed") {
      actionButtonsHtml = `
        <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          Fulfilled
        </span>
      `;
    } else {
      actionButtonsHtml = `
        <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Cancelled
        </span>
      `;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-sm">
        <!-- Booking ID -->
        <td class="py-4 px-4 font-mono-code font-bold text-xs text-indigo-700 whitespace-nowrap">
          <span class="bg-indigo-50/90 border border-indigo-100/90 px-2.5 py-1 rounded-lg shadow-2xs">
            ${escapeHtml(bookingId)}
          </span>
        </td>

        <!-- Customer & Address -->
        <td class="py-4 px-4">
          <div class="flex items-center gap-3">
            ${customerAvatar}
            <div class="min-w-0">
              <p class="font-extrabold text-slate-900 leading-tight truncate text-sm">${escapeHtml(customerName)}</p>
              <p class="text-xs text-slate-500 truncate mt-0.5">${escapeHtml(customerPhone)}</p>
              ${!isCompact ? `
                <p class="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <svg class="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  ${addressDisplay}
                </p>
              ` : ""}
            </div>
          </div>
        </td>

        <!-- Service & Category -->
        <td class="py-4 px-4">
          <div>
            <p class="font-bold text-slate-900 leading-tight text-xs sm:text-sm">${escapeHtml(serviceTitle)}</p>
            <div class="mt-1">
              ${renderCategoryBadge(category)}
            </div>
          </div>
        </td>

        <!-- Date & Slot -->
        <td class="py-4 px-4 whitespace-nowrap">
          <div class="flex flex-col text-xs text-slate-700 font-medium">
            <span class="flex items-center gap-1.5 font-bold text-slate-800">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ${escapeHtml(booking.date)}
            </span>
            <span class="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
              <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ${escapeHtml(booking.timeSlot)}
            </span>
          </div>
        </td>

        <!-- Price -->
        <td class="py-4 px-4 whitespace-nowrap">
          <span class="text-sm font-extrabold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">$${priceNum.toFixed(2)}</span>
        </td>

        <!-- Status -->
        <td class="py-4 px-4 whitespace-nowrap">
          ${renderStatusBadge(booking.status)}
        </td>

        <!-- Actions -->
        <td class="py-4 px-4 whitespace-nowrap text-right">
          ${actionButtonsHtml}
        </td>
      </tr>
    `;
  }

  function renderServiceCard(service) {
    const serviceId = service.id || service._id || "";
    const title = service.title || service.name || "Service Title";
    const category = service.category || "General";
    const description = service.description || "";
    const priceNum = typeof service.price === "number" ? service.price : (parseFloat(service.price) || 0);
    const durationMins = service.duration || service.durationMinutes || 60;
    const ratingVal = service.rating !== undefined ? service.rating : "5.0";
    const reviewsVal = service.reviewsCount !== undefined ? service.reviewsCount : (service.reviewCount !== undefined ? service.reviewCount : 0);
    const imgUrl = service.imageUrl || service.image || "";
    const isFeatured = Boolean(service.isFeatured);

    return `
      <div class="saas-card saas-card-hover flex flex-col overflow-hidden group relative" data-service-id="${serviceId}">
        <!-- Image & Badges Container -->
        <div class="relative w-full aspect-service-card bg-slate-100 overflow-hidden">
          <img src="${escapeHtml(imgUrl)}" 
               alt="${escapeHtml(title)}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               onerror="this.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'">
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <!-- Category Badge Top Left -->
          <div class="absolute top-3 left-3 shadow-md">
            ${renderCategoryBadge(category)}
          </div>

          <!-- Featured Badge Top Right -->
          ${isFeatured ? `
            <div class="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-300/40">
              <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Featured
            </div>
          ` : ""}
        </div>

        <!-- Card Content -->
        <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
              ${escapeHtml(title)}
            </h4>
            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              ${escapeHtml(description)}
            </p>

            <!-- Meta Specs Row -->
            <div class="flex items-center gap-4 text-xs text-slate-600 font-medium mt-4 pt-3.5 border-t border-slate-100">
              <span class="flex items-center gap-1 text-amber-600 font-extrabold">
                <svg class="w-3.5 h-3.5 fill-current text-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ${ratingVal} <span class="text-slate-400 font-normal">(${reviewsVal})</span>
              </span>

              <span class="flex items-center gap-1 text-slate-500 font-semibold">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ${durationMins} mins
              </span>
            </div>
          </div>

          <!-- Footer Pricing & Quick Actions -->
          <div class="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100">
            <div>
              <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Starting At</span>
              <div class="text-xl font-extrabold text-slate-900 leading-tight">$${priceNum.toFixed(2)}</div>
            </div>

            <div class="flex items-center gap-1.5">
              <button data-action="edit-service" data-id="${serviceId}" 
                      class="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition active:scale-95 cursor-pointer shadow-xs" 
                      title="Edit Service Details">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button data-action="delete-service" data-id="${serviceId}" data-title="${escapeHtml(title)}" 
                      class="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition active:scale-95 cursor-pointer shadow-xs" 
                      title="Remove from Catalog">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  }

  function renderNotificationDropdown(notifications) {
    if (!notifications || notifications.length === 0) {
      return `
        <div class="p-8 text-center">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <p class="text-xs font-bold text-slate-800">No New Notifications</p>
          <p class="text-[11px] text-slate-400 mt-1">Live booking alerts and updates will appear here.</p>
        </div>
      `;
    }

    return notifications.map(notif => {
      const notifId = notif._id || notif.id || "";
      const isRead = Boolean(notif.isRead);
      const title = notif.title || "Notification";
      const message = notif.message || "";
      const timeStr = notif.createdAt ? formatTimeAgo(notif.createdAt) : (notif.timestamp || "Just now");
      const bookingRawId = (typeof notif.bookingId === "object" && notif.bookingId?._id)
        ? notif.bookingId._id
        : (notif.bookingId || notif.booking || "");
      const bookingDisplayId = bookingRawId ? String(bookingRawId).slice(-6).toUpperCase() : "";

      let iconColor = "bg-amber-50 text-amber-600 border border-amber-200";
      let iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`;

      if (notif.type === "CONFIRMED" || title.includes("Confirmed")) {
        iconColor = "bg-blue-50 text-blue-600 border border-blue-200";
        iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
      } else if (notif.type === "COMPLETED" || title.includes("Completed")) {
        iconColor = "bg-emerald-50 text-emerald-600 border border-emerald-200";
        iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
      } else if (notif.type === "CANCELLED" || title.includes("Cancelled")) {
        iconColor = "bg-rose-50 text-rose-600 border border-rose-200";
        iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
      } else if (notif.type === "BOOKING" || title.includes("Booking") || title.includes("Request")) {
        iconColor = "bg-amber-50 text-amber-600 border border-amber-200";
        iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
      }

      return `
        <div class="p-3.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-3 group cursor-pointer ${!isRead ? 'bg-amber-50/20' : ''}"
             data-action="mark-single-read"
             data-notif-id="${notifId}"
             data-is-read="${isRead}"
             ${bookingRawId ? `data-booking-id="${escapeHtml(bookingRawId)}"` : ''}>
          <div class="w-8 h-8 rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
            ${iconSvg}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="text-xs font-bold ${!isRead ? 'text-slate-900 font-extrabold' : 'text-slate-700'} truncate flex items-center gap-1.5">
                ${!isRead ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>' : ''}
                ${escapeHtml(title)}
              </span>
              <span class="text-[10px] text-slate-400 whitespace-nowrap font-medium">${escapeHtml(timeStr)}</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-2">
              ${escapeHtml(message)}
            </p>
            <div class="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
              ${bookingDisplayId ? `<span class="font-mono-code text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">#${escapeHtml(bookingDisplayId)}</span>` : '<span></span>'}
              ${!isRead ? `
                <button type="button" 
                        data-action="mark-single-read" 
                        data-notif-id="${notifId}"
                        class="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer text-[10px]">
                  Mark read
                </button>
              ` : `
                <span class="text-slate-400 text-[10px]">Read</span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  const exported = {
    escapeHtml,
    renderStatusBadge,
    renderCategoryBadge,
    renderKPICards,
    renderAnalyticsCharts,
    generateSplinePath,
    renderCategoryDistribution,
    renderBookingTableRow,
    renderServiceCard,
    renderNotificationDropdown
  };

  if (typeof window !== "undefined") {
    window.ServiceProUI = exported;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
