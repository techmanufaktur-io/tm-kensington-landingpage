/* User currency and area unit preferences
 * - Stores selection in cookies
 * - Syncs between desktop and mobile controls
 */
(function () {
  "use strict";

  var COOKIE_LANGUAGE = "kens_language";
  var COOKIE_CURRENCY = "kens_currency";
  var COOKIE_UNIT = "kens_area_unit"; // 'sqm' or 'sqft'
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 365 days
  var state = { currency: null, unit: null };
  var LANG_REDIRECT_FLAG = "kens_lang_redirected";

  function setCookie(name, value) {
    if (!name) return;
    var sameSite = "Lax";
    var secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value) +
      "; Path=/" +
      "; Max-Age=" +
      COOKIE_MAX_AGE +
      "; SameSite=" +
      sameSite +
      secure;
  }

  function getCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0)
        return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
  }

  function getDefaultFromDataset(attrName, fallback) {
    // Find first wrapper with data-default-* to read optional defaults
    var wrapper = document.querySelector(
      "[data-default-currency],[data-default-unit]"
    );
    if (!wrapper) return fallback;
    var value = wrapper.getAttribute(attrName);
    return value && value.trim() !== "" ? value : fallback;
  }

  function unitSymbol(value) {
    return value === "sqft" ? "ft²" : "m²";
  }

  function updateLabel() {
    var labelEls = document.querySelectorAll("[data-preferences-label]");
    var currency = state.currency || getCookie(COOKIE_CURRENCY) || "EUR";
    var unit = state.unit || getCookie(COOKIE_UNIT) || "sqm";
    var text = currency + " / " + unitSymbol(unit);
    labelEls.forEach(function (el) {
      el.textContent = text;
    });
  }

  function maybeRedirectLanguage() {
    var container = document.querySelector("[data-preferred-language]");
    if (!container) return;

    var preferred = (container.getAttribute("data-preferred-language") || "")
      .toLowerCase()
      .trim();
    if (!preferred) return;

    var current = (document.documentElement.getAttribute("lang") || "")
      .toLowerCase()
      .trim();
    if (current === preferred) {
      return;
    }

    var redirectedStorage;
    try {
      redirectedStorage = window.sessionStorage;
    } catch (e) {
      redirectedStorage = null;
    }

    if (
      redirectedStorage &&
      redirectedStorage.getItem(LANG_REDIRECT_FLAG) === preferred
    ) {
      return;
    }

    var link = findLanguageLink(preferred, container);
    if (!link) {
      return;
    }

    if (redirectedStorage) {
      redirectedStorage.setItem(LANG_REDIRECT_FLAG, preferred);
    }
    window.location.href = link.href;
  }

  function findLanguageLink(preferred, scope) {
    var selector =
      '[hreflang="' + preferred + '"], [data-hreflang="' + preferred + '"]';
    var link = scope.querySelector(selector);
    if (!link) {
      link = document.querySelector(selector);
    }
    return link;
  }

  function applyCurrency(value) {
    var selects = document.querySelectorAll(
      'select[data-preference="currency"]'
    );
    selects.forEach(function (sel) {
      var found = false;
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === value) {
          sel.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found && sel.options.length > 0) {
        sel.selectedIndex = 0;
        value = sel.options[0].value;
      }
    });
    state.currency = value;
    setCookie(COOKIE_CURRENCY, state.currency);
    updateLabel();
  }

  function applyUnit(value) {
    var radios = document.querySelectorAll(
      'input[type="radio"][data-preference="unit"]'
    );
    var normalized = value === "sqft" ? "sqft" : "sqm";
    radios.forEach(function (radio) {
      var isSelected = radio.value === normalized;
      radio.checked = isSelected;
      radio.setAttribute("aria-checked", isSelected ? "true" : "false");
      if (isSelected) {
        radio.setAttribute("checked", "checked");
      } else {
        radio.removeAttribute("checked");
      }
    });
    state.unit = normalized;
    setCookie(COOKIE_UNIT, state.unit);
    updateLabel();
  }

  function initDropdownHover() {
    // Only enhance hover behavior on devices that support hover
    var mql = window.matchMedia("(hover: hover)");
    if (!mql.matches) return;
    var dropdowns = [];
    var pref = document.querySelector("[data-preferences-dropdown]");
    if (pref) dropdowns.push(pref);
    document.querySelectorAll("[data-hover-dropdown]").forEach(function (el) {
      dropdowns.push(el);
    });
    if (!dropdowns.length) return;

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
      var menu = dropdown.querySelector(".dropdown-menu");
      if (!toggle || !menu) return;

      function show() {
        toggle.classList.add("show");
        menu.classList.add("show");
        // prevent popper reposition on hover open
        menu.setAttribute("data-popper", "static");
        toggle.setAttribute("aria-expanded", "true");
      }
      function hide() {
        toggle.classList.remove("show");
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
      dropdown.addEventListener("mouseenter", show);
      dropdown.addEventListener("mouseleave", hide);
    });
  }

  function init() {
    // Initialize from cookies or defaults
    var cookieCurrency = getCookie(COOKIE_CURRENCY);
    var cookieUnit = getCookie(COOKIE_UNIT);

    var defaultCurrency = getDefaultFromDataset("data-default-currency", null);
    var defaultUnit = getDefaultFromDataset("data-default-unit", "sqm");

    // For currency, prefer cookie -> dataset default -> first option of first select
    var selects = document.querySelectorAll(
      'select[data-preference="currency"]'
    );
    var initialCurrency =
      cookieCurrency ||
      defaultCurrency ||
      (selects.length && selects[0].options.length
        ? selects[0].options[0].value
        : "EUR");
    applyCurrency(initialCurrency);

    // For unit, prefer cookie -> dataset default -> sqm
    var initialUnit = cookieUnit || defaultUnit || "sqm";
    applyUnit(initialUnit);

    // Event handlers
    selects.forEach(function (sel) {
      sel.addEventListener("change", function () {
        var prev = state.currency;
        applyCurrency(sel.value);
        if (prev !== state.currency) {
          // ensure cookie write completed before reload
          setTimeout(function () {
            window.location.reload();
          }, 50);
        }
      });
    });
    var radios = document.querySelectorAll(
      'input[type="radio"][data-preference="unit"]'
    );
    radios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          var prev = state.unit;
          applyUnit(radio.value);
          if (prev !== state.unit) {
            setTimeout(function () {
              window.location.reload();
            }, 50);
          }
        }
      });
    });

    initDropdownHover();
    bindLanguageChoiceHandlers();
    updateLabel();
    maybeRedirectLanguage();
    // mark navbar preferences as ready to show computed label
    document.querySelectorAll(".navbar-preferences").forEach(function (el) {
      el.classList.add("is-ready");
    });
  }

  function bindLanguageChoiceHandlers() {
    var links = document.querySelectorAll("[data-language-choice]");
    if (!links.length) return;
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var choice = (link.getAttribute("data-language-choice") || "").trim();
        if (!choice) return;
        setCookie(COOKIE_LANGUAGE, choice);
        try {
          window.sessionStorage.setItem(
            LANG_REDIRECT_FLAG,
            choice.toLowerCase()
          );
        } catch (e) {
          // ignore storage errors
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
