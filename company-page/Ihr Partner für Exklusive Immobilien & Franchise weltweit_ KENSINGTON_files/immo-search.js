// Filter Toggle & Reset
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    var toggleFilter = document.getElementById("toggleFilter");
    var subHidden = document.querySelector(".sub-hidden");
    if (toggleFilter) {
      var newToggleFilter = toggleFilter.cloneNode(true);
      toggleFilter.parentNode.replaceChild(newToggleFilter, toggleFilter);
      newToggleFilter.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var subHidden = document.querySelector(".sub-hidden");
        if (subHidden) {
          subHidden.style.display =
            subHidden.style.display === "none" || subHidden.style.display === ""
              ? "block"
              : "none";
        }
        return false;
      });
    }

    var resetButton = document.getElementById("resetButton");
    if (resetButton) {
      resetButton.addEventListener("click", function (e) {
        e.preventDefault();
        var form =
          document.getElementById("kensington-search-form") ||
          document.querySelector("form");
        if (form) {
          form.querySelectorAll('input[type="text"]').forEach(function (input) {
            input.value = "";
          });
          var latField = document.getElementById("address-latitude-field");
          var lonField = document.getElementById("address-longitude-field");
          var placeIdField = document.getElementById("address-placeid-field");
          if (latField) latField.value = "";
          if (lonField) lonField.value = "";
          if (placeIdField) placeIdField.value = "";
          if (
            window.__kensingtonGeoapifyAutocomplete &&
            typeof window.__kensingtonGeoapifyAutocomplete.reset === "function"
          ) {
            window.__kensingtonGeoapifyAutocomplete.reset();
          }
          form.querySelectorAll("select").forEach(function (select) {
            select.selectedIndex = 0;
          });
          form
            .querySelectorAll('input[type="checkbox"]')
            .forEach(function (checkbox) {
              checkbox.checked = false;
            });
          var pageField = form.querySelector(
            'input[name="tx_kensingtonimmo_search[page]"]'
          );
          if (pageField) {
            pageField.value = "1";
          }
          if (
            window.KensingtonImmo &&
            typeof window.KensingtonImmo.submitAjaxSearch === "function"
          ) {
            window.KensingtonImmo.resetAndSubmit(form);
          } else {
            form.submit();
          }
        }
      });
    }

    // Enforce integer-only input for Zimmer, Wohnfläche, Kaufpreis filter fields
    function enforceIntegerInputById(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () {
        var cleaned = this.value.replace(/[^0-9]/g, "");
        if (this.value !== cleaned) {
          this.value = cleaned;
        }
      });
    }

    [
      "anzahlZimmer_start",
      "anzahlZimmer_end",
      "wohnflaeche_start",
      "wohnflaeche_end",
      "kaufpreis_start",
      "kaufpreis_end",
    ].forEach(enforceIntegerInputById);
  }, 100);
});

// Geoapify Autocomplete (replaces Google Places)
function findOrtInputs() {
  var candidates = [];
  var selectors = [
    "#ort-input",
    "#search-location-input",
    'input[name="filter[geo.ort]"]',
    'input[name="tx_kensingtonimmo_search[filter][geo.ort]"]',
    'input[name$="[geo.ort]"]',
  ];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el && candidates.indexOf(el) === -1) {
        candidates.push(el);
      }
    });
  });
  return candidates;
}

function initGeoapifyAutocomplete(ortInput) {
  if (!ortInput) return;
  var formRoot = ortInput.closest ? ortInput.closest("form") : null;
  var latitudeField =
    (formRoot && formRoot.querySelector("#address-latitude-field")) ||
    document.getElementById("address-latitude-field");
  var longitudeField =
    (formRoot && formRoot.querySelector("#address-longitude-field")) ||
    document.getElementById("address-longitude-field");
  var placeIdField =
    (formRoot && formRoot.querySelector("#address-placeid-field")) ||
    document.getElementById("address-placeid-field");

  if (ortInput.dataset.geoapifyInitialized === "1") {
    return;
  }

  // Prefill from URL query if present (keeps values after reload/navigation)
  try {
    if (placeIdField && !placeIdField.value) {
      var params = new URLSearchParams(window.location.search || "");
      var pid =
        params.get("tx_kensingtonimmo_search[filter][geo.placeId]") ||
        params.get("filter[geo.placeId]") ||
        "";
      if (pid) {
        placeIdField.value = pid;
        // keep original ort input value as display text if present
        if (ortInput && ortInput.value) {
          if (typeof geoapify.setValue === "function") {
            geoapify.setValue(ortInput.value);
          }
        }
      }
    }
  } catch (e) {}
  var GeoapifyAutocomplete =
    window.autocomplete && window.autocomplete.GeocoderAutocomplete;
  if (!GeoapifyAutocomplete) return;

  var container = document.createElement("div");
  container.className = "geoapify-autocomplete-container";
  if (ortInput.className) {
    container.className += " " + ortInput.className;
  }
  container.style.position = "relative";

  var placeholder = ortInput.getAttribute("placeholder") || "";
  var lang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  var geoapify = new GeoapifyAutocomplete(container, "protected", {
    placeholder: placeholder,
    skipIcons: true,
    skipDetails: true,
    debounceDelay: 100,
    limit: 8,
    lang: lang,
  });

  geoapify.geocoderUrl = window.location.origin + "/index.php";
  if (typeof geoapify.clearFilters === "function") {
    geoapify.clearFilters();
  }
  if (typeof geoapify.clearBias === "function") {
    geoapify.clearBias();
  }
  if (typeof geoapify.addFilterByCountry === "function") {
    geoapify.addFilterByCountry(["de", "ch", "es", "gb", "ae"]);
  }

  // Custom request sender to route through TYPO3 eID (hides API key)
  geoapify.sendGeocoderRequestAlt = function (value, instance) {
    var ctx = instance || this;
    var opts = (ctx && ctx.options) || this.options || {};
    var params = [];
    params.push("eID=kensington_immo_geoapify_autocomplete");
    params.push("text=" + encodeURIComponent(value));
    // Note: Type filtering is done server-side, as Geoapify API doesn't support multiple types
    if (opts.limit) {
      params.push("limit=" + encodeURIComponent(opts.limit));
    }
    if (opts.lang) {
      params.push("lang=" + encodeURIComponent(opts.lang));
    }
    try {
      var cc =
        opts && opts.filter && opts.filter.countrycode
          ? opts.filter.countrycode
          : null;
      if (cc && cc.length) {
        params.push("filter=countrycode:" + cc.join(",").toLowerCase());
      }
    } catch (e) {}
    var url =
      (ctx && ctx.geocoderUrl ? ctx.geocoderUrl : this.geocoderUrl) +
      "?" +
      params.join("&");
    
    return fetch(url, { credentials: "same-origin" })
      .then(function (response) {
        return response.json();
      });
  };

  ortInput.style.display = "none";
  if (ortInput.parentNode) {
    if (ortInput.nextSibling) {
      ortInput.parentNode.insertBefore(container, ortInput.nextSibling);
    } else {
      ortInput.parentNode.appendChild(container);
    }
  }

  var geoapifyInput =
    container.querySelector("input.geoapify-autocomplete-input") || null;
  var innerContainer =
    container.querySelector(".geoapify-geocoder-autocomplete-container") ||
    container;
  var pruneAutocompleteLists = function () {
    var lists = innerContainer.querySelectorAll(".geoapify-autocomplete-items");
    if (lists && lists.length > 1) {
      for (var i = 0; i < lists.length - 1; i++) {
        try {
          if (lists[i] && lists[i].parentNode === innerContainer) {
            innerContainer.removeChild(lists[i]);
          }
        } catch (e) {}
      }
    }
  };
  if (typeof MutationObserver !== "undefined") {
    try {
      var mo = new MutationObserver(function () {
        pruneAutocompleteLists();
      });
      mo.observe(innerContainer, { childList: true });
    } catch (e) {}
  }

  var clearGeoFields = function () {
    if (latitudeField) latitudeField.value = "";
    if (longitudeField) longitudeField.value = "";
    if (placeIdField) placeIdField.value = "";
  };

  geoapify.on("select", function (feature) {
    var props = (feature && feature.properties) || {};
    var name =
      props.formatted ||
      props.city ||
      props.name ||
      props.address_line1 ||
      props.address_line2 ||
      "";
    
    if (typeof geoapify.setValue === "function") {
      geoapify.setValue(name);
    }
    ortInput.value = name;
    if (props.lat != null && latitudeField) {
      latitudeField.value = String(props.lat);
    }
    if (props.lon != null && longitudeField) {
      longitudeField.value = String(props.lon);
    }
    if (placeIdField) {
      var pid =
        props.place_id ||
        props.placeId ||
        (props.datasource &&
          props.datasource.raw &&
          props.datasource.raw.place_id) ||
        "";
      placeIdField.value = pid ? String(pid) : "";
    }
  });

  geoapify.on("clear", function () {
    clearGeoFields();
    ortInput.value = "";
  });

  geoapify.on("input", function (text) {
    if (!text && !(placeIdField && placeIdField.value)) {
      clearGeoFields();
    }
  });

  geoapify.on("suggestions", function (suggestions) {
    pruneAutocompleteLists();
  });

  if (geoapifyInput) {
    geoapifyInput.addEventListener("input", function () {
      if (!(placeIdField && placeIdField.value)) {
        clearGeoFields();
      }
    });
    // Restore visible value when placeId already present (e.g. after reload)
    try {
      if (placeIdField && placeIdField.value && ortInput && ortInput.value) {
        if (typeof geoapify.setValue === "function") {
          geoapify.setValue(ortInput.value);
        } else if (geoapifyInput.value !== ortInput.value) {
          geoapifyInput.value = ortInput.value;
        }
      }
    } catch (e) {}
  }

  ortInput.dataset.geoapifyInitialized = "1";
}

(function () {
  var reinitTimer = null;
  var reinitCount = 0;

  function ensureGeoapifyCss() {
    if (
      document.querySelector(
        'link[data-geoapify-css="1"], link[href*="geoapify/geocoder-autocomplete"]'
      )
    ) {
      return;
    }
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://unpkg.com/@geoapify/geocoder-autocomplete@3.0.1/styles/minimal.css";
    link.dataset.geoapifyCss = "1";
    document.head.appendChild(link);
  }

  function ensureGeoapifyLoaded(callback) {
    if (window.autocomplete && window.autocomplete.GeocoderAutocomplete) {
      ensureGeoapifyCss();
      callback();
      return;
    }
    // inject script once if missing
    if (!document.querySelector('script[data-geoapify-loader="1"]')) {
      ensureGeoapifyCss();
      var s = document.createElement("script");
      s.src =
        "https://unpkg.com/@geoapify/geocoder-autocomplete@3.0.1/dist/index.min.js";
      s.async = true;
      s.defer = true;
      s.dataset.geoapifyLoader = "1";
      s.onload = function () {
        callback();
      };
      document.head.appendChild(s);
    } else {
      setTimeout(callback, 200);
    }
  }

  function tryInitGeoapify() {
    var ortInputs = findOrtInputs();
    var GeoapifyAutocomplete =
      window.autocomplete && window.autocomplete.GeocoderAutocomplete;
    if (!ortInputs || !ortInputs.length) {
      setTimeout(tryInitGeoapify, 300);
      return;
    }
    if (!GeoapifyAutocomplete) {
      ensureGeoapifyLoaded(tryInitGeoapify);
      return;
    }
    ortInputs.forEach(function (input) {
      initGeoapifyAutocomplete(input);
    });
  }

  function scheduleInit() {
    if (reinitTimer) {
      clearTimeout(reinitTimer);
    }
    reinitTimer = setTimeout(tryInitGeoapify, 200);
  }

  // Observe dynamically added search forms (e.g., AJAX rendered FormTop)
  try {
    var observer = new MutationObserver(function (mutations) {
      var found = false;
      mutations.forEach(function (m) {
        if (m.addedNodes) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) {
              if (
                n.matches &&
                (n.matches("#ort-input") ||
                  n.matches("#search-location-input") ||
                  n.querySelector("#ort-input") ||
                  n.querySelector("#search-location-input"))
              ) {
                found = true;
              }
            }
          });
        }
      });
      if (found) {
        scheduleInit();
      }
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  } catch (e) {}

  function scheduleRepeatingInit() {
    if (reinitCount >= 10) {
      return;
    }
    reinitCount += 1;
    setTimeout(function () {
      tryInitGeoapify();
      scheduleRepeatingInit();
    }, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      tryInitGeoapify();
      scheduleRepeatingInit();
    });
  } else {
    tryInitGeoapify();
    scheduleRepeatingInit();
  }
})();

// AJAX Suche
window.KensingtonImmo = (function () {
  var busy = false;
  var isPaginationClick = false;
  function smoothScrollTo(elementId) {
    var element = document.getElementById(elementId);
    if (!element) return;
    var offset = element.getBoundingClientRect().top + window.pageYOffset - 100;
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({ top: offset, behavior: "smooth" });
    } else {
      var start = window.pageYOffset;
      var distance = offset - start;
      var duration = 800;
      var startTime = null;
      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        var timeElapsed = currentTime - startTime;
        var progress = Math.min(timeElapsed / duration, 1);
        progress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo(0, start + distance * progress);
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }
      requestAnimationFrame(animation);
    }
  }
  function serializeForm(form) {
    var params = [];
    var elements = Array.from(form.querySelectorAll("input, select, textarea"));
    if (form.id) {
      elements = elements.concat(
        Array.from(document.querySelectorAll('[form="' + form.id + '"]'))
      );
    }
    elements.forEach(function (el) {
      if (!el.name || el.disabled) return;
      // Skip top-level routing params that can break speaking URLs when empty.
      // Keep namespaced equivalents (e.g. tx_kensingtonimmo_search[id]).
      if (el.name === "id" || el.name === "L" || el.name === "contentUid") {
        return;
      }
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked)
        return;
      // For multi-value inputs (name ending with []), do not deduplicate –
      // append one param per matching value to preserve arrays
      var isArrayField = /\[\]$/.test(el.name);
      if (el.tagName === "SELECT" && el.multiple) {
        Array.from(el.options).forEach(function (opt) {
          if (opt.selected) {
            if (String(opt.value) !== "") {
              params.push(
                encodeURIComponent(el.name) +
                  "=" +
                  encodeURIComponent(opt.value)
              );
            }
          }
        });
      } else if (isArrayField) {
        if (String(el.value) !== "") {
          params.push(
            encodeURIComponent(el.name) + "=" + encodeURIComponent(el.value)
          );
        }
      } else {
        if (String(el.value) !== "") {
          params.push(
            encodeURIComponent(el.name) + "=" + encodeURIComponent(el.value)
          );
        }
      }
    });
    return params.join("&");
  }
  function buildAjaxUrl(form) {
    return window.location.origin + "/?eID=kensington_immo_search";
  }
  function updateDom(html) {
    var temp = document.createElement("div");
    temp.innerHTML = html;
    var results = temp.querySelector("#kensington-search-results");
    var pagination = temp.querySelector("#kensington-search-pagination");
    if (results) {
      var targetResults = document.getElementById("kensington-search-results");
      if (targetResults) targetResults.innerHTML = results.innerHTML;
    }
    if (pagination) {
      var targetPagination = document.getElementById(
        "kensington-search-pagination"
      );
      if (targetPagination) targetPagination.innerHTML = pagination.innerHTML;
    }
    if (!results && html) {
      var fallbackTarget = document.getElementById("kensington-search-results");
      if (fallbackTarget) {
        fallbackTarget.innerHTML = html;
      }
    }
    try {
      initTeaserSliders();
    } catch (e) {}
  }
  if (!window.__kensingtonSortChangeBound) {
    window.__kensingtonSortChangeBound = true;
    document.addEventListener(
      "change",
      function (e) {
        var t = e.target;
        if (!t) return;
        if (t.id === "sortBy" || t.id === "sortOrder") {
          var form = document.getElementById("kensington-search-form");
          if (!form) return;
          if (t.id === "sortBy") {
            var hiddenSortBy = document.getElementById("hidden-sortBy");
            if (hiddenSortBy) {
              hiddenSortBy.value = t.value;
            }
          }
          if (t.id === "sortOrder") {
            var hiddenSortOrder = document.getElementById("hidden-sortOrder");
            if (hiddenSortOrder) {
              hiddenSortOrder.value = t.value;
            }
          }
          var pageInput =
            document.querySelector("#page-field") ||
            form.querySelector(
              'input[name="page"], input[name="tx_kensingtonimmo_search[page]"]'
            );
          if (pageInput) {
            pageInput.value = "1";
          }
          submitAjaxSearch(form);
        }
      },
      true
    );
  }
  if (!window.__kensingtonPaginationClickBound) {
    window.__kensingtonPaginationClickBound = true;
    document.addEventListener(
      "click",
      function (e) {
        var a =
          e.target && e.target.closest
            ? e.target.closest("a[data-page]")
            : null;
        if (!a) return;
        var form = document.getElementById("kensington-search-form");
        if (!form) return;
        var page = a.getAttribute("data-page");
        if (!page) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function")
          e.stopImmediatePropagation();
        var pageInput =
          document.querySelector("#page-field") ||
          form.querySelector(
            'input[name="page"], input[name="tx_kensingtonimmo_search[page]"]'
          );
        if (pageInput) {
          pageInput.value = page;
        }
        isPaginationClick = true;
        submitAjaxSearch(form);
      },
      true
    );
  }
  function pushHistory(url) {
    try {
      window.history.pushState({ immoAjax: true }, "", url);
    } catch (e) {}
  }
  function submitAjaxSearch(form) {
    if (busy) return;
    busy = true;
    var ajaxFlag = form.querySelector('input[name="ajax"]');
    if (ajaxFlag) {
      ajaxFlag.value = "1";
    }
    var params = serializeForm(form);
    var baseUrl = buildAjaxUrl(form);
    var url =
      baseUrl +
      (params ? (baseUrl.indexOf("?") === -1 ? "?" : "&") + params : "");
    fetch(url, {
      method: "GET",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin",
    })
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        updateDom(html);
        try {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          var newCount = null;
          var resultsRoot = doc.querySelector("#kensington-search-results");
          if (resultsRoot) {
            newCount = resultsRoot.getAttribute("data-count");
          }
          if (!newCount) {
            var metaEl = doc.querySelector("#kensington-ajax-meta");
            if (metaEl) {
              newCount = metaEl.getAttribute("data-count");
            }
          }
          if (newCount !== null && newCount !== "") {
            var countEl = document.getElementById("kensington-results-count");
            if (countEl) {
              countEl.textContent = newCount;
            }
          }
        } catch (e) {
          console.error("Error updating results count:", e);
        }
        try {
          var sortByControl = document.getElementById("sortBy");
          var sortOrderControl = document.getElementById("sortOrder");
          var hiddenSortBy = document.getElementById("hidden-sortBy");
          var hiddenSortOrder = document.getElementById("hidden-sortOrder");
          if (sortByControl && hiddenSortBy) {
            sortByControl.value = hiddenSortBy.value;
          }
          if (sortOrderControl && hiddenSortOrder) {
            sortOrderControl.value = hiddenSortOrder.value;
          }
        } catch (e) {}
        if (isPaginationClick) {
          isPaginationClick = false;
          setTimeout(function () {
            smoothScrollTo("search-results-wrapper");
          }, 100);
        }
        try {
          var qs = serializeForm(form);
          var base = new URL(window.location.href);
          base.search = qs;
          pushHistory(base.toString());
        } catch (e) {
          pushHistory(window.location.href);
        }
      })
      .catch(function () {
        isPaginationClick = false;
      })
      .finally(function () {
        busy = false;
      });
  }
  function resetAndSubmit(form) {
    var ajaxFlag = form.querySelector('input[name="ajax"]');
    if (ajaxFlag) {
      ajaxFlag.value = "1";
    }
    var pageField =
      form.querySelector("#page-field") ||
      form.querySelector(
        'input[name="page"], input[name="tx_kensingtonimmo_search[page]"]'
      );
    if (pageField) {
      pageField.value = "1";
    }
    submitAjaxSearch(form);
  }
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("kensington-search-form");
    if (!form) return;
    var sortByControl = document.getElementById("sortBy");
    var sortOrderControl = document.getElementById("sortOrder");
    var hiddenSortBy = document.getElementById("hidden-sortBy");
    var hiddenSortOrder = document.getElementById("hidden-sortOrder");
    if (sortByControl && hiddenSortBy && sortByControl.value) {
      hiddenSortBy.value = sortByControl.value;
    }
    if (sortOrderControl && hiddenSortOrder && sortOrderControl.value) {
      hiddenSortOrder.value = sortOrderControl.value;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      resetAndSubmit(form);
    });
    if (!window.__kensingtonFormSubmitBound) {
      window.__kensingtonFormSubmitBound = true;
      document.addEventListener(
        "submit",
        function (e) {
          var targetForm = e.target;
          if (!(targetForm && targetForm.id === "kensington-search-form"))
            return;
          e.preventDefault();
          resetAndSubmit(targetForm);
        },
        true
      );
    }
    [
      "vermarktungsart-selectbox",
      "objektart-selectbox",
      "radius-select",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", function () {
          resetAndSubmit(form);
        });
      }
    });
    var searchBtn = document.querySelector(
      "#kensington-search-form .search-button"
    );
    if (searchBtn) {
      searchBtn.addEventListener("click", function (e) {
        e.preventDefault();
        resetAndSubmit(form);
      });
    }
    form.addEventListener("change", function (e) {
      var target = e.target;
      if (
        target.id === "sortBy" ||
        target.id === "sortOrder" ||
        target.id === "vermarktungsart-selectbox" ||
        target.id === "objektart-selectbox" ||
        target.id === "radius-select"
      ) {
        return;
      }
      if (
        target.tagName === "SELECT" ||
        (target.tagName === "INPUT" &&
          (target.type === "checkbox" || target.type === "radio"))
      ) {
        resetAndSubmit(form);
      }
    });
    window.addEventListener("popstate", function () {
      window.location.href = window.location.href;
    });
  });
  return {
    submitAjaxSearch: submitAjaxSearch,
    resetAndSubmit: resetAndSubmit,
    smoothScrollTo: smoothScrollTo,
    initTeaserSliders: initTeaserSliders,
  };
})();

// Initialize teaser sliders for dynamically injected HTML (eID/AJAX)
function initTeaserSliders() {
  var roots = document.querySelectorAll(".openimmo-teaser-slider");
  roots.forEach(function (root) {
    if (!root || root.__kensingtonSliderBound) return;
    root.__kensingtonSliderBound = true;
    var slides = root.querySelectorAll(".openimmo-teaser-slide");
    if (!slides.length) return;
    var idx = 0;
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains("active")) {
        idx = i;
        break;
      }
    }
    var prevBtn = root.querySelector(".teaser-slider-prev");
    var nextBtn = root.querySelector(".teaser-slider-next");
    var frame = root.querySelector(".teaser-slider-frame");
    var dotsWrap = root.querySelector(".teaser-slider-dots");
    var dotsTrack = root.querySelector(".teaser-slider-dots-track");
    var dots = root.querySelectorAll(".teaser-slider-dot");
    var isAnimating = false;
    var pendingIdx = null;
    function updateDots() {
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.remove("active");
      }
      if (dots[idx]) {
        dots[idx].classList.add("active");
      }
      var maxVisible = 5;
      if (dots.length > maxVisible) {
        var start = idx - Math.floor(maxVisible / 2);
        if (start < 0) start = 0;
        var lastStart = dots.length - maxVisible;
        if (start > lastStart) start = lastStart;
        var end = start + maxVisible - 1;
        var dotWidth = dots[0] ? dots[0].offsetWidth : 8;
        var cs = dotsTrack ? getComputedStyle(dotsTrack) : null;
        var gap =
          cs && (cs.columnGap || cs.gap)
            ? parseFloat(cs.columnGap || cs.gap)
            : 6;
        var containerW = dotsWrap ? dotsWrap.clientWidth || 0 : 0;
        var visibleCount = Math.min(maxVisible, dots.length);
        var visibleW = visibleCount * dotWidth + (visibleCount - 1) * gap;
        var offsetBase = Math.max(0, start) * (dotWidth + gap);
        var centerPad = Math.max(0, Math.round((containerW - visibleW) / 2));
        if (dotsTrack) {
          dotsTrack.style.transform =
            "translateX(" + (-offsetBase + centerPad) + "px)";
        }
      } else {
        var dotWidthAll = dots[0] ? dots[0].offsetWidth : 8;
        var cs2 = dotsTrack ? getComputedStyle(dotsTrack) : null;
        var gapAll =
          cs2 && (cs2.columnGap || cs2.gap)
            ? parseFloat(cs2.columnGap || cs2.gap)
            : 6;
        var containerAll = dotsWrap ? dotsWrap.clientWidth || 0 : 0;
        var totalW =
          dots.length * dotWidthAll + Math.max(0, dots.length - 1) * gapAll;
        var pad = Math.max(0, Math.round((containerAll - totalW) / 2));
        if (dotsTrack) {
          dotsTrack.style.transform = "translateX(" + pad + "px)";
        }
      }
    }
    function animateSlide(fromEl, toEl, direction) {
      if (!fromEl || !toEl) return;
      if (isAnimating) return;
      isAnimating = true;
      toEl.style.display = "block";
      toEl.style.transform =
        "translateX(" + (direction > 0 ? "100%" : "-100%") + ")";
      fromEl.style.transform = "translateX(0)";
      fromEl.style.transition = "transform .35s ease-in-out";
      toEl.style.transition = "transform .35s ease-in-out";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fromEl.style.transform =
            "translateX(" + (direction > 0 ? "-100%" : "100%") + ")";
          toEl.style.transform = "translateX(0)";
        });
      });
      var onEnd = function () {
        fromEl.style.display = "none";
        fromEl.style.transition = "";
        fromEl.style.transform = "";
        toEl.style.transition = "";
        toEl.style.transform = "";
        fromEl.removeEventListener("transitionend", onEnd);
        isAnimating = false;
        if (pendingIdx !== null) {
          var t = pendingIdx;
          pendingIdx = null;
          show(t);
        }
      };
      fromEl.addEventListener("transitionend", onEnd);
    }
    function updateHeight() {
      if (!frame) return;
      var img = slides[idx] && slides[idx].querySelector("img");
      if (!img) return;
      var container = frame.closest(".openimmo-teaser-image");
      if (container && container.clientHeight > 0) {
        frame.style.height = container.clientHeight + "px";
        return;
      }
      var apply = function () {
        var w = frame.clientWidth || img.clientWidth || 0;
        var ratio =
          img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 0.0;
        if (w > 0 && ratio > 0) {
          frame.style.height = Math.max(1, Math.round(w * ratio)) + "px";
        }
      };
      if (img.complete && img.naturalWidth > 0) {
        apply();
      } else {
        img.addEventListener("load", apply, { once: true });
      }
    }
    function show(n) {
      var newIdx = (n + slides.length) % slides.length;
      if (newIdx === idx) return;
      if (isAnimating) {
        pendingIdx = newIdx;
        return;
      }
      var cur = slides[idx];
      var nxt = slides[newIdx];
      cur.classList.remove("active");
      nxt.classList.add("active");
      animateSlide(cur, nxt, newIdx > idx ? 1 : -1);
      idx = newIdx;
      updateDots();
      updateHeight();
    }
    for (var k = 0; k < slides.length; k++) {
      slides[k].style.display = k === idx ? "block" : "none";
    }
    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      var dotsWrap = root.querySelector(".teaser-slider-dots");
      if (dotsWrap) {
        dotsWrap.style.display = "none";
      }
    } else {
      if (prevBtn)
        prevBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          show(idx - 1);
        });
      if (nextBtn)
        nextBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          show(idx + 1);
        });
      for (var j = 0; j < dots.length; j++) {
        (function (jj) {
          var dot = dots[jj];
          if (!dot) return;
          dot.addEventListener("click", function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            show(jj);
          });
        })(j);
      }
    }
    updateHeight();
    updateDots();
    // Ensure the dots viewport shows max 5 indicators
    try {
      var dotsWrapEl = root.querySelector(".teaser-slider-dots");
      if (dotsWrapEl) {
        dotsWrapEl.style.width = "calc(5 * 8px + 4 * 6px)";
        dotsWrapEl.style.margin = "0 auto";
        dotsWrapEl.style.overflow = "hidden";
      }
    } catch (e) {}
    var resizeTimeout = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateHeight, 100);
    });
  });
}
