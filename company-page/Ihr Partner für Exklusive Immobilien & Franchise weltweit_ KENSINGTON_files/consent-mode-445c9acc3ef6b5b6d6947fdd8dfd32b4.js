/**
 * Google Consent Mode v2 Integration
 * Handles consent state management for Google Tag Manager and Google Analytics
 *
 * This script integrates with cf_cookiemanager and sends consent states
 * to the dataLayer for Google Consent Mode v2.
 */

(function () {
  "use strict";

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  // Define gtag stub early so we can call gtag('consent', ...) before GTM initializes it
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // Debug disabled in production
  function isConsentDebug() {
    return false;
  }

  // Service to Consent Mode mapping
  const serviceConsentMap = {
    // Analytics services
    "Google Analytics": "analytics_storage",
    "Google Analytics 4": "analytics_storage",
    GA4: "analytics_storage",

    // Marketing services
    Meta: "ad_storage",
    "Facebook Pixel": "ad_storage",
    "Google Ads": "ad_storage",
    "Google Tag Manager": "ad_storage",

    // Functional services (usually always granted)
    "Google Maps": "functionality_storage",
    YouTube: "functionality_storage",
    Vimeo: "functionality_storage",

    // Personalization
    Personalization: "personalization_storage",
  };

  // Category to Consent Mode mapping
  const categoryConsentMap = {
    Analytik: ["analytics_storage"],
    Analytics: ["analytics_storage"],
    Marketing: ["ad_storage"],
    Functional: ["functionality_storage"],
    Personalization: ["personalization_storage"],
  };

  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null
   */
  function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  }

  /**
   * Parse consent data from various possible storage locations
   * @returns {Object|null} - Consent object or null
   */
  function getConsentData() {
    // Try common cookie names for cf_cookiemanager
    const possibleCookieNames = [
      "cf_cookie_consent",
      "cookieconsent_status",
      "cfcm_consent",
      "cfcm_status",
      "cf_cookie_status",
      // observed cookie in cf_cookiemanager installs
      "cf_cookie",
      "cookie_consent",
    ];

    for (let cookieName of possibleCookieNames) {
      const cookieValue = getCookie(cookieName);
      if (cookieValue) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookieValue));
          if (parsed && typeof parsed === "object") {
            if (isConsentDebug()) {
              console.info(
                "[ConsentDebug] Parsed consent from cookie",
                cookieName,
                parsed
              );
            }
            return parsed;
          }
        } catch (e) {
          // Try as plain string or other format
          try {
            const parsed = JSON.parse(cookieValue);
            if (parsed && typeof parsed === "object") {
              if (isConsentDebug()) {
                console.info(
                  "[ConsentDebug] Parsed non-URI consent from cookie",
                  cookieName,
                  parsed
                );
              }
              return parsed;
            }
          } catch (e2) {
            // Not JSON, might be comma-separated or other format
            // Continue to next cookie name
          }
        }
      }
    }

    // Try localStorage
    const localStorageKeys = [
      "cf_cookie_consent",
      "cookieconsent_status",
      "cfcm_consent",
      "cfcm_status",
    ];

    for (let key of localStorageKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            if (isConsentDebug()) {
              console.info(
                "[ConsentDebug] Parsed consent from localStorage",
                key,
                parsed
              );
            }
            return parsed;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Try cfCookieManager API (if still available)
    if (typeof cfCookieManager !== "undefined") {
      if (
        cfCookieManager.getConsent &&
        typeof cfCookieManager.getConsent === "function"
      ) {
        try {
          const consent = cfCookieManager.getConsent();
          if (consent && typeof consent === "object") {
            if (isConsentDebug()) {
              console.info(
                "[ConsentDebug] Consent from cfCookieManager.getConsent()",
                consent
              );
            }
            return consent;
          }
        } catch (e) {
          // Ignore errors
        }
      }
      if (
        cfCookieManager.consent &&
        typeof cfCookieManager.consent === "object"
      ) {
        if (isConsentDebug()) {
          console.info(
            "[ConsentDebug] Consent from cfCookieManager.consent",
            cfCookieManager.consent
          );
        }
        return cfCookieManager.consent;
      }
    }

    // Try cookieman API
    if (typeof cookieman !== "undefined") {
      if (cookieman.getConsent && typeof cookieman.getConsent === "function") {
        try {
          const consent = cookieman.getConsent();
          if (consent && typeof consent === "object") {
            if (isConsentDebug()) {
              console.info(
                "[ConsentDebug] Consent from cookieman.getConsent()",
                consent
              );
            }
            return consent;
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }

    return null;
  }

  /**
   * Check if a service is consented by reading cookies or localStorage
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - true if consented
   */
  function isServiceConsented(serviceName) {
    const consentData = getConsentData();
    if (!consentData) {
      return false;
    }
    const normalized = String(serviceName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Try exact match
    if (
      consentData[serviceName] === true ||
      consentData[serviceName] === "granted"
    ) {
      return true;
    }

    // Try case-insensitive match
    const serviceNameLower = serviceName.toLowerCase();
    for (let key in consentData) {
      if (key.toLowerCase() === serviceNameLower) {
        if (consentData[key] === true || consentData[key] === "granted") {
          return true;
        }
      }
    }

    // Check categories array (e.g. cf_cookie: { categories: [...] })
    if (Array.isArray(consentData.categories)) {
      const cat = consentData.categories.map((c) =>
        String(c)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      );
      // common slug aliases for services
      const aliases = {
        // analytics
        googleanalytics: [
          "googleanalytics",
          "googleanalytics4",
          "ga4",
          "analytics",
        ],
        // marketing
        facebookpixel: ["facebookpixel", "facebook", "fbpixel", "meta"],
        googleads: ["googleads", "adwords", "googleadwords", "ads"],
        // misc
        googletagmanager: ["googletagmanager", "gtm"],
        youtube: ["youtube"],
        vimeo: ["vimeo"],
        googlemaps: ["googlemaps", "maps"],
      };
      // build set of accepted slugs
      const accepted = new Set(cat);
      // resolve normalized name to any alias list
      const allPairs = Object.entries(aliases);
      for (const [key, list] of allPairs) {
        if (list.includes(normalized)) {
          // if any alias in list present in categories → consented
          if (list.some((slug) => accepted.has(slug)) || accepted.has(key)) {
            return true;
          }
        }
      }
      // also direct check: if the normalized name itself is in categories
      if (accepted.has(normalized)) {
        return true;
      }
    }

    // Try cookieman API as fallback
    if (
      typeof cookieman !== "undefined" &&
      cookieman.hasConsentedTrackingObject
    ) {
      if (cookieman.hasConsentedTrackingObject(serviceName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get consent state for a specific consent type
   * @param {string} consentType - e.g., 'analytics_storage', 'ad_storage'
   * @returns {string} - 'granted' or 'denied'
   */
  function getConsentState(consentType) {
    // Map consent types to service names
    if (consentType === "analytics_storage") {
      // Check for analytics services
      const analyticsServices = [
        "Google Analytics",
        "Google Analytics 4",
        "GA4",
        "Analytics",
      ];
      for (let service of analyticsServices) {
        if (isServiceConsented(service)) {
          return "granted";
        }
      }
      return "denied";
    }

    if (consentType === "ad_storage") {
      // Check for marketing services
      const marketingServices = [
        "Meta",
        "Facebook Pixel",
        "Facebook",
        "Google Ads",
        "Marketing",
      ];
      for (let service of marketingServices) {
        if (isServiceConsented(service)) {
          return "granted";
        }
      }
      return "denied";
    }

    if (consentType === "functionality_storage") {
      // Usually granted for functional services
      return "granted";
    }

    if (consentType === "personalization_storage") {
      // Check for personalization services
      if (isServiceConsented("Personalization")) {
        return "granted";
      }
      return "denied";
    }

    // Default: denied
    return "denied";
  }

  /**
   * Update consent state in dataLayer
   * @param {Object} consentStates - Object with consent types and states
   */
  function updateConsentState(consentStates) {
    window.dataLayer.push({
      event: "consent_update",
      ...consentStates,
    });
  }

  /**
   * Initialize consent mode with default (denied) states
   * This should be called before GTM loads
   */
  function initializeConsentMode() {
    // Consent Mode v2 default values (before user interacts)
    const defaultConsent = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      // Give the CMP a short window to update before tags fire
      wait_for_update: 500,
    };

    // Push default to gtag and dataLayer
    gtag("consent", "default", defaultConsent);
    window.dataLayer.push({
      event: "consent_default",
      ...defaultConsent,
    });
    if (isConsentDebug()) {
      console.info("[ConsentDebug] consent_default", defaultConsent);
    }
  }

  /**
   * Helper: check if any of provided names (services or categories) is consented
   */
  function isAnyConsented(names) {
    if (!Array.isArray(names) || names.length === 0) {
      return false;
    }
    const loweredNeedles = names.map((n) => String(n).toLowerCase());
    for (let name of names) {
      if (isServiceConsented(name)) {
        if (isConsentDebug()) {
          console.info("[ConsentDebug] Matched consent by service", name);
        }
        return true;
      }
    }
    // Also try category keys within raw consent data
    const data = getConsentData();
    if (data) {
      const lowered = Object.keys(data).reduce((acc, k) => {
        acc[k.toLowerCase()] = data[k];
        return acc;
      }, {});
      // exact match on common localization keys
      for (let key of Object.keys(lowered)) {
        if (loweredNeedles.includes(key)) {
          if (lowered[key] === true || lowered[key] === "granted") {
            if (isConsentDebug()) {
              console.info(
                "[ConsentDebug] Matched consent by exact category key",
                key,
                lowered[key]
              );
            }
            return true;
          }
        }
      }
      // fuzzy contains for generic category names (e.g. "marketing-de", "statistik_optin")
      for (let key of Object.keys(lowered)) {
        const k = key.toLowerCase();
        for (let needle of loweredNeedles) {
          if (k.includes(needle)) {
            if (lowered[key] === true || lowered[key] === "granted") {
              if (isConsentDebug()) {
                console.info(
                  "[ConsentDebug] Matched consent by fuzzy category key",
                  key,
                  lowered[key]
                );
              }
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Update consent based on cookie manager state
   */
  function updateConsentFromCookieManager() {
    // Category-level mapping
    const marketingGranted = isAnyConsented([
      "Meta",
      "Facebook Pixel",
      "facebookpixel",
      "Google Ads",
      "googleads",
      "Marketing",
      "Werbung",
    ]);
    const analyticsGranted = isAnyConsented([
      "Google Analytics 4",
      "Google Analytics",
      "GA4",
      "googleanalytics",
      "googleanalytics4",
      "Analytik",
      "Analytics",
      "Statistik",
    ]);

    const consentStates = {
      ad_storage: marketingGranted ? "granted" : "denied",
      ad_user_data: marketingGranted ? "granted" : "denied",
      ad_personalization: marketingGranted ? "granted" : "denied",
      analytics_storage: analyticsGranted ? "granted" : "denied",
    };

    // Update globally
    gtag("consent", "update", consentStates);
    updateConsentState(consentStates);
    if (isConsentDebug()) {
      console.info("[ConsentDebug] update from CMP =>", {
        marketingGranted,
        analyticsGranted,
        consentStates,
        raw: getConsentData(),
        cookies: document.cookie,
      });
    }

    // Granular per service
    try {
      const knownServices = Object.keys(serviceConsentMap);
      for (let serviceName of knownServices) {
        const state = getServiceConsent(serviceName);
        pushServiceConsent(serviceName, state);
        if (isConsentDebug()) {
          console.info(
            "[ConsentDebug] service_consent_update",
            serviceName,
            state
          );
        }
      }
    } catch (e) {
      // ignore granular errors
    }
  }

  /**
   * Listen for cookie manager consent changes
   */
  function setupConsentListeners() {
    // Listen for cfCookieManager events
    if (typeof cfCookieManager !== "undefined") {
      // Check if cfCookieManager has event listeners
      if (
        cfCookieManager.onConsentChange &&
        typeof cfCookieManager.onConsentChange === "function"
      ) {
        cfCookieManager.onConsentChange(function (consent) {
          updateConsentFromCookieManager();
        });
      }

      // Listen for DOM events that might be triggered by cookie manager
      document.addEventListener("cfCookieConsentUpdate", function () {
        updateConsentFromCookieManager();
      });
    }

    // Listen for cookieman events (if used)
    if (typeof cookieman !== "undefined") {
      // Override cookieman.hide to update consent
      const originalHide = cookieman.hide;
      if (originalHide) {
        cookieman.hide = function () {
          originalHide.apply(this, arguments);
          setTimeout(updateConsentFromCookieManager, 100);
        };
      }
    }

    // Listen for custom consent events
    document.addEventListener("cookieConsentUpdate", function () {
      updateConsentFromCookieManager();
    });

    // Monitor cookie changes (for cf_cookiemanager)
    // Since cfCookieManager might not be dynamic, we need to monitor cookies directly
    let lastConsentData = null;
    function checkConsentChanges() {
      const currentConsentData = getConsentData();
      const currentConsentString = JSON.stringify(currentConsentData);
      const lastConsentString = JSON.stringify(lastConsentData);

      if (currentConsentString !== lastConsentString) {
        lastConsentData = currentConsentData;
        updateConsentFromCookieManager();
      }
    }

    // Check immediately
    lastConsentData = getConsentData();

    // Monitor changes periodically
    setInterval(checkConsentChanges, 500);

    // Also monitor cookie string changes as fallback
    let lastCookieString = document.cookie;
    setInterval(function () {
      const currentCookieString = document.cookie;
      if (currentCookieString !== lastCookieString) {
        lastCookieString = currentCookieString;
        checkConsentChanges();
      }
    }, 1000);

    // Monitor localStorage changes (for cf_cookiemanager)
    window.addEventListener("storage", function (e) {
      if (e.key && e.key.toLowerCase().includes("consent")) {
        updateConsentFromCookieManager();
      }
    });

    // Listen for clicks on consent buttons
    document.addEventListener("click", function (e) {
      const target = e.target;
      if (
        target &&
        (target.id === "s-all-bn" || // Accept All
          target.id === "s-rall-bn" || // Reject All
          target.id === "s-sv-bn" || // Save
          target.closest("#s-all-bn") ||
          target.closest("#s-rall-bn") ||
          target.closest("#s-sv-bn"))
      ) {
        setTimeout(updateConsentFromCookieManager, 500);
      }
    });
  }

  /**
   * Get granular consent for specific services
   * This can be called to get consent state for individual services
   */
  function getServiceConsent(serviceName) {
    return isServiceConsented(serviceName) ? "granted" : "denied";
  }

  /**
   * Push granular consent to dataLayer
   * @param {string} serviceName - Name of the service
   * @param {string} state - 'granted' or 'denied'
   */
  function pushServiceConsent(serviceName, state) {
    const consentType = serviceConsentMap[serviceName];
    if (consentType) {
      const consentStates = {};
      consentStates[consentType] = state;
      const serviceSlug = String(serviceName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      window.dataLayer.push({
        event: "service_consent_update",
        service: serviceName,
        service_slug: serviceSlug,
        consent_type: consentType,
        consent_state: state,
        consent_granted: state === "granted",
        ...consentStates,
      });

      // Also update gtag consent
      if (typeof gtag !== "undefined") {
        gtag("consent", "update", consentStates);
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeConsentMode();
      setupConsentListeners();

      // Update consent after a short delay to allow cookie manager to initialize
      setTimeout(updateConsentFromCookieManager, 500);
    });
  } else {
    // DOM already loaded
    initializeConsentMode();
    setupConsentListeners();
    setTimeout(updateConsentFromCookieManager, 500);
  }

  // Expose functions globally for manual updates
  window.consentMode = {
    update: updateConsentFromCookieManager,
    getServiceConsent: getServiceConsent,
    pushServiceConsent: pushServiceConsent,
    updateConsentState: updateConsentState,
    getRawConsentData: getConsentData,
  };
})();
