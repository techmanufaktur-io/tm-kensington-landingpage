let App = (function () {
  function initBootstrap() {
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('[data-bs-toggle="popover"]').popover();

    if ($(".navbar-onepage").length > 0) {
      $("body").scrollspy({
        target: $(".navbar-onepage"),
        offset: $("#nav-primary").height() + 21,
      });
    }
  }

  function initLightbox() {
    if (typeof GLightbox === "undefined") return;
    /* fix for missing title attribute in lightbox a tags */
    $(".lightbox").each(function () {
      if (this.title === "") {
        $(this).attr("title", $("img", $(this)).attr("title"));
      }
      const parents = $(this).parents("figure");
      if (parents.length > 0) {
        if ($(".image-caption span.description", parents.get(0)).length > 0) {
          $(this).attr(
            "data-description",
            $(".image-caption span.description", parents.get(0)).html()
          );
        }
      }
    });

    const lightbox = GLightbox({
      selector: ".lightbox",
    });
    lightbox.on("open", () => {
      App.compensateScrollbar(true);
    });
    lightbox.on("close", () => {
      App.compensateScrollbar(false);
    });
  }

  function initCountdown() {
    if (typeof FlipDown === "undefined") return;

    $(".countdown").each(function () {
      $(this).addClass("flipdown");
      let date = $(this).attr("data-endtime");
      new FlipDown(parseInt(date), $(this).attr("id")).start();
    });
  }

  function initHeader() {
    if ($(".navbar-meta").length > 0) {
      let userNavbarHeight = $(".navbar-meta").height();
      $(window).scroll(function () {
        if (document.documentElement.scrollTop > 100) {
          $("#nav-primary").addClass("navbar-shrinked");
        } else if (
          document.documentElement.scrollTop <
          100 - userNavbarHeight - 5
        ) {
          $("#nav-primary").removeClass("navbar-shrinked");
        }
      });
    }
  }

  function initEqualHeight() {
    if (typeof $("body").matchHeight() === "undefined") return;
    $(".equal-height").matchHeight({
      byRow: true,
      property: "min-height",
    });
    $(".ce-header").matchHeight({
      byRow: true,
      property: "min-height",
    });
  }

  function initSmoothScroll() {
    /* from here on only for one pager */
    if ($(".navbar-onepage").length === 0) return;

    /* one page: link on logo */
    $(".navbar-onepage .navbar-brand a").on("click", function (event) {
      event.preventDefault();
      $("html, body").animate(
        {
          scrollTop: 0,
        },
        800,
        function () {}
      );
    });

    /* close nav */
    $(".nav-onepage a").on("click", function (event) {
      $(this).closest(".navbar-collapse.show").collapse("hide");
    });
  }

  function initAjaxModals() {
    var modalTemplate = jQuery(
      '<div class="modal fade" id="ajax-modal" tabindex="-1" role="dialog" aria-labelledby="ajaxModalLabel" aria-hidden="true">\n' +
        ' <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        ' <span aria-hidden="true">&times;</span>\n' +
        " </button>\n" +
        ' <div class="modal-dialog" role="document">\n' +
        ' <div class="modal-content">\n' +
        ' <div class="modal-header">\n' +
        ' <p class="h5 modal-title" id="ajaxModalLabel"></p>\n' +
        " </div>\n" +
        ' <div class="modal-text"></div>\n' +
        ' <div class="modal-body">\n' +
        " </div>\n" +
        " </div>\n" +
        " </div>\n" +
        "</div>"
    ).attr("id", "modalContact");

    jQuery("body").append(modalTemplate);
    let modalBody = modalTemplate.find(".modal-body");

    let showContent = function (content) {
      modalBody.html(content);
      modalTemplate.find(".modal-title").html(modalBody.find("h2").html());
      modalBody.find("h2").remove();
      let form = modalTemplate.find("form");

      form.find("[type=submit]").on("click", function (e) {
        e.preventDefault();

        /* show spinner */

        let values = form.serialize();
        values = values +=
          "&" +
          jQuery(e.target).attr("name") +
          "=" +
          jQuery(e.target).attr("value");

        jQuery.ajax({
          type: "POST",
          url: form.attr("action"),
          data: values,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          dataType: "html",
          success: showContent,
        });
      });
    };

    jQuery(".modal-ajax").on("click", function (e) {
      e.preventDefault();
      let url = jQuery(this).data("url");

      /* show spinner */

      jQuery.ajax({
        type: "POST",
        url: url,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        dataType: "html",
        success: function (content) {
          showContent(content);
          modalTemplate.modal("show");

          /* hide spinner */
        },
      });
    });
  }

  function initAriaBar() {
    if (jQuery(".nav-aria").length === 0) return;

    jQuery("body").addClass("with-aria-bar");

    if ($.cookie("aria-high-contrast") == "1") {
      jQuery("body").addClass("high-ct-enabled");
      jQuery(this).addClass("active");
      jQuery(".btn-contrast").addClass("active");
    }

    jQuery(".btn-contrast").on("click", function (event) {
      event.preventDefault();
      if (jQuery(this).hasClass("active")) {
        jQuery("body").removeClass("high-ct-enabled");
        jQuery(this).removeClass("active");
        $.removeCookie("aria-high-contrast", { path: "/" });
      } else {
        jQuery("body").addClass("high-ct-enabled");
        jQuery(this).addClass("active");
        $.cookie("aria-high-contrast", "1", { path: "/" });
      }
    });
  }

  function initCompareSlider() {
    if ($(".beforeafterdefault").length > 0) {
      $(".beforeafterdefault").cndkbeforeafter({
        autoSliding: true,
        mode: "drag",
      });
    }
  }

  function initScrollbarWidth(App) {
    // thx d.walsh
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth =
      scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    App.scrollbarWidth = scrollbarWidth;
  }

  function initAos() {
    if ($("[data-aos]").length > 0 && typeof aosIsInitialized !== "undefined") {
      AOS.init();
    }
  }

  function initCookiemanButton() {
    if (typeof cookieman === "undefined") return;

    $("<a />")
      .addClass("cookieman-caller")
      .click(function (event) {
        if ($("#cookieman-modal:visible").length === 0) {
          cookieman.show();
        }
      })
      .appendTo($("body"));
  }

  function initSearchbox() {
    $("#t3b__search__collapse__button--desktop").on("click", function (event) {
      $(this).css("opacity", "0");
      $("#tx_indexedsearch_word-default").focus();
    });
    $("#tx_indexedsearch_word-default").on("focusout", function (event) {
      $(".searchbar-toggler").css("opacity", "1");
      $("#t3b__search__collapse--desktop").collapse("hide");
    });

    $("#t3b__search__collapse__button--mobile").on("click", function (event) {
      $("#tx_indexedsearch_word-mobile").focus();
    });
  }

  function initResponsiveTable() {
    $("table.table-responsive-init").wrap(
      '<div class="table-responsive"></div>'
    );
  }

  return {
    scrollbarWidth: 0,

    init: function () {
      initBootstrap();
      initScrollbarWidth(this);
      initLightbox();
      initHeader();
      initEqualHeight();
      initSmoothScroll();
      initAjaxModals();
      initAriaBar();
      initCompareSlider();
      initAos();
      initCookiemanButton();
      initSearchbox();
      initResponsiveTable();
      initCountdown();
    },
    compensateScrollbar: function (compensate) {
      if (compensate) {
        $("body, .fixed-top, .fixed-bottom, .is-fixed").css(
          "padding-right",
          this.scrollbarWidth
        );
      } else {
        $("body, .fixed-top, .fixed-bottom, .is-fixed").css("padding-right", 0);
      }
    },
  };
})();

jQuery(document).ready(function () {
  App.init();
});

let mmenu;

let MmenuWrapper = (function () {
  function start() {
    let navTitle = document.head.querySelector("[name=sitename]")
      ? document.head.querySelector("[name=sitename]").content
      : "";

    mmenu = new Mmenu(
      "#mobile-menu",
      {
        navbar: {
          title: navTitle,
        },
        navbars: [
          {
            position: "bottom",
            height: 2,
            content: ['<div id="mobile-footer"></div>'],
          },
        ],
      },
      {
        offCanvas: {
          page: {
            selector: "#page",
          },
        },
        classNames: {
          selected: "current",
        },
      }
    );
    const api = mmenu.API;
    api.bind("openPanel:before", (panel) => {
      var scrollTopPosition = $(window).scrollTop();
      $(".fixed-top")
        .css("position", "absolute")
        .css("top", scrollTopPosition + "px");
    });
    api.bind("closePanel:after", (panel) => {
      $(".fixed-top").css("position", "fixed").css("top", "0px");
    });
    api.bind("openPanel:after", (panel) => {
      populateNextAndPreviousPanels(panel);
    });

    let openers = document.querySelectorAll('[data-mm-target="#mobile-menu"]');
    [].forEach.call(openers, function (opener) {
      opener.addEventListener("click", (evnt) => {
        evnt.preventDefault();
        api.open();
        populateNextAndPreviousPanels(getOpenPanel());
      });
    });

    $("#mobile-footer").html($("#nav-mobile-footer").html());

    getOpenPanel().find("ul").attr("data-loaded", "true");
    //populateNextAndPreviousPanels(getOpenPanel());
  }

  function loadMmenuData(pageIds) {
    //console.debug('loadMmenuData');
    //console.debug(pageIds);
    $.ajax({
      url: $("#mobile-menu").attr("data-ajax-menu-url"),
      data: {
        pageIds: pageIds.join(","),
      },
      context: document.body,
    }).done(function (data) {
      let uls = $("<div />").html(data).find("ul");
      uls.each(function (index) {
        let id = $(this).attr("data-id");
        if ($("ul[data-id=" + id + "]").length > 0) {
          $("ul[data-id=" + id + "]").attr("data-loaded", "true");
          let lastElement;
          $(this)
            .children("li")
            .each(function (index) {
              let pid = $(this).attr("data-id");
              if (
                $("ul[data-id=" + id + "] > li[data-id=" + pid + "]").length > 0
              ) {
                // skip element
                lastElement = $("li[data-id=" + pid + "]");
              } else {
                if (index === 0) {
                  lastElement = $(this).prependTo($("ul[data-id=" + id + "]"));
                } else {
                  lastElement = $(this).insertAfter(lastElement);
                }
              }
            });
        } else if ($(".mm-listitem[data-id=" + id + "]").length > 0) {
          $(".mm-listitem[data-id=" + id + "]").append($(this));
        }
      });
    });
  }

  function populateNextAndPreviousPanels(panel) {
    //if ($('.navbar-toggler').get(0).offsetParent === null) return;

    //console.debug('populateNextAndPreviousPanels');
    let pageIds = [];
    //console.debug(panel)
    $("li.sub", panel).each(function () {
      if (
        $("ul[data-id=" + $(this).attr("data-id") + "][data-loaded=true]")
          .length === 0
      ) {
        if (
          $(this).attr("data-mm-child") !== undefined &&
          $(this).attr("data-mm-child") !== ""
        ) {
          $("#" + $(this).attr("data-mm-child") + " > ul > li.sub").each(
            function () {
              pageIds.push($(this).attr("data-id"));
            }
          );
        } else {
          pageIds.push($(this).attr("data-id"));
        }
      }
    });
    // parent
    let parentId = $(panel).attr("data-mm-parent");
    if (
      $("#" + parentId).length > 0 &&
      $(
        "ul[data-id=" +
          $("#" + parentId)
            .parent()
            .attr("data-id") +
          "][data-loaded=true]"
      ).length === 0
    ) {
      pageIds.push(
        $("#" + parentId)
          .parent()
          .attr("data-id")
      );
    }
    if (pageIds.length > 0) {
      loadMmenuData(pageIds);
    }
  }

  function getOpenPanel() {
    return $(".mm-panel--opened");
  }

  return {
    init: function () {
      start();
    },
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  MmenuWrapper.init();
});

function loadJS(url) {
  // adding the script tag to the head
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;

  // fire the loading
  head.appendChild(script);
}

// Mallorca Karte
const mapRegions = [
  { id: "sonvida", url: "/de/es/mallorca/son-vida" },
  { id: "sonvida-en", url: "/es/es/mallorca/son-vida" },
  { id: "sonvida-es", url: "/es/es/mallorca/son-vida" },
  { id: "portocristo", url: "/de/es/mallorca/nordostkueste-porto-cristo" },
  { id: "portocristo-en", url: "/es/es/mallorca/northeast-portocristo" },
  { id: "portocristo-es", url: "/es/es/mallorca/northeast-portocristo" },
  { id: "nordkueste", url: "/de/es/mallorca/nordkueste" },
  { id: "nordost", url: "/de/es/mallorca/northeast" },
  { id: "santanyi", url: "/de/es/mallorca/southeast" },
  { id: "suedkueste", url: "/de/es/mallorca/southcoast" },
  { id: "westkueste", url: "/de/es/mallorca/westcoast" },
  { id: "inselmitte", url: "/de/es/mallorca/center" },
  { id: "palma", url: "/de/es/mallorca/palma/immobilien" },
  { id: "andratx", url: "/de/es/mallorca/suedwestkueste-andratx" },
  { id: "santaponsa", url: "/de/es/mallorca/suedwestkueste-santaponsa" },
  { id: "portals", url: "/de/es/mallorca/suedwestkueste-portals" },
  { id: "nordkueste-en", url: "/en/es/mallorca/northcoast" },
  { id: "nordost-en", url: "/en/es/mallorca/northeast" },
  { id: "santanyi-en", url: "/en/es/mallorca/southeast" },
  { id: "suedkueste-en", url: "/en/es/mallorca/southcoast" },
  { id: "westkueste-en", url: "/en/es/mallorca/westcoast" },
  { id: "inselmitte-en", url: "/en/es/mallorca/center" },
  { id: "palma-en", url: "/en/es/mallorca/palma/immobilien" },
  { id: "andratx-en", url: "/en/es/mallorca/southwestcoast-andratx" },
  { id: "santaponsa-en", url: "/en/es/mallorca/suedwestkueste-santaponsa" },
  { id: "portals-en", url: "/en/es/mallorca/suedwestkueste-portals" },
  { id: "nordkueste-es", url: "/es/es/mallorca/northcoast" },
  { id: "nordost-es", url: "/es/es/mallorca/northeast" },
  { id: "santanyi-es", url: "/es/es/mallorca/southeast" },
  { id: "suedkueste-es", url: "/es/es/mallorca/southcoast" },
  { id: "westkueste-es", url: "/es/es/mallorca/westcoast" },
  { id: "inselmitte-es", url: "/es/es/mallorca/center" },
  { id: "palma-es", url: "/es/es/mallorca/palma/immobilien" },
  { id: "andratx-es", url: "/es/es/mallorca/southwestcoast-andratx" },
  { id: "santaponsa-es", url: "/es/es/mallorca/suedwestkueste-santaponsa" },
  { id: "portals-es", url: "/es/es/mallorca/suedwestkueste-portals" },
];

// Mallorca Karte Event Listener für Mouseover, Touch und Klick
mapRegions.forEach((region) => {
  const element = document.getElementById(region.id);

  if (element) {
    element.addEventListener("mouseover", () => {
      element.style.fill = "#cd9c87";
      element.style.cursor = "pointer";
    });

    element.addEventListener("mouseleave", () => {
      element.style.fill = "#e6e6e6";
    });

    element.addEventListener("click", () => {
      window.location.href = region.url;
    });
  }
});

// initialize popovers OpenImmo (lazy, do not auto-show all)
(function initOpenImmoPopovers() {
  if (typeof bootstrap === "undefined" || !bootstrap.Popover) return;
  const triggers = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...triggers].forEach((el) => {
    // Configure to show on hover/focus only; do not force-show at init
    new bootstrap.Popover(el, {
      trigger: "hover focus",
      container: "body",
    });
  });
})();

// Filter OpenImmo PopMenü

$(document).ready(function () {
  $("#openMenuBtn").click(function () {
    $("#menuContent").show();
    $("#openMenuBtn").show();
    $("#closeMenuBtn").show();
  });

  $("#closeMenuBtn").click(function () {
    $("#menuContent").hide();
    $("#closeMenuBtn").hide();
    $("#openMenuBtn").show();
  });
});

//Filter Datum/Preis
document.addEventListener("DOMContentLoaded", function () {
  var selectElement = document.getElementById("sortBy");
  if (selectElement) {
    selectElement.addEventListener("change", function () {
      this.form.submit();
    });
  }
});

//Filter öffnet Subfilter per klick NEU
$(document).ready(function () {
  $("#toggleFilter").click(function () {
    $(".filter-hidden, .sub-hidden").toggle();
  });
});

//Placeholder soll stehen bleiben bei Fläche in Suche
document.addEventListener("DOMContentLoaded", function () {
  function formatNumberWithThousandSeparator(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function removeThousandSeparator(num) {
    return num.replace(/\./g, "");
  }

  function addThousandSeparatorOnInput(inputElement, hiddenElement) {
    inputElement.addEventListener("input", function (e) {
      let value = inputElement.value.replace(/\./g, "");
      if (!isNaN(value) && value !== "") {
        inputElement.value = formatNumberWithThousandSeparator(value);
        hiddenElement.value = value;
      } else {
        hiddenElement.value = "";
      }
    });
  }

  function syncHiddenFieldsOnSubmit(form) {
    form.addEventListener("submit", function (e) {
      let startDisplayInput = document.getElementById(
        "wohnflaeche_start_display"
      );
      let endDisplayInput = document.getElementById("wohnflaeche_end_display");
      let startHiddenInput = document.getElementById("wohnflaeche_start");
      let endHiddenInput = document.getElementById("wohnflaeche_end");

      if (
        startDisplayInput &&
        startHiddenInput &&
        endDisplayInput &&
        endHiddenInput
      ) {
        if (startDisplayInput.value.trim() === "") {
          startHiddenInput.value = "";
          startDisplayInput.value = ""; // Ensure display value is empty
        } else {
          startHiddenInput.value = removeThousandSeparator(
            startDisplayInput.value
          );
        }

        if (endDisplayInput.value.trim() === "") {
          endHiddenInput.value = "";
          endDisplayInput.value = ""; // Ensure display value is empty
        } else {
          endHiddenInput.value = removeThousandSeparator(endDisplayInput.value);
        }
      }
    });
  }

  function restoreThousandSeparator(inputElement) {
    let value = inputElement.value;
    if (value !== "") {
      inputElement.value = formatNumberWithThousandSeparator(
        value.replace(/\./g, "")
      );
    }
  }

  function checkForZeroValue(inputElement) {
    if (inputElement.value === "0") {
      inputElement.value = ""; // Remove zero value
    }
  }

  let wohnflaecheStartDisplay = document.getElementById(
    "wohnflaeche_start_display"
  );
  let wohnflaecheEndDisplay = document.getElementById(
    "wohnflaeche_end_display"
  );
  let wohnflaecheStart = document.getElementById("wohnflaeche_start");
  let wohnflaecheEnd = document.getElementById("wohnflaeche_end");

  if (
    wohnflaecheStartDisplay &&
    wohnflaecheEndDisplay &&
    wohnflaecheStart &&
    wohnflaecheEnd
  ) {
    addThousandSeparatorOnInput(wohnflaecheStartDisplay, wohnflaecheStart);
    addThousandSeparatorOnInput(wohnflaecheEndDisplay, wohnflaecheEnd);

    // Restore thousand separator on page load
    restoreThousandSeparator(wohnflaecheStartDisplay);
    restoreThousandSeparator(wohnflaecheEndDisplay);

    // Check for zero value and remove it
    checkForZeroValue(wohnflaecheStartDisplay);
    checkForZeroValue(wohnflaecheEndDisplay);

    let form = wohnflaecheStartDisplay.closest("form");
    if (form) {
      syncHiddenFieldsOnSubmit(form);
    }
  }
});
//Placeholder soll stehen bleiben bei Anzahl Zimmer in Suche
document.addEventListener("DOMContentLoaded", function () {
  function formatNumberWithThousandSeparator(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function removeThousandSeparator(num) {
    return num.replace(/\./g, "");
  }

  function addThousandSeparatorOnInput(inputElement, hiddenElement) {
    inputElement.addEventListener("input", function (e) {
      let value = inputElement.value.replace(/\./g, "");
      if (!isNaN(value) && value !== "") {
        inputElement.value = formatNumberWithThousandSeparator(value);
        hiddenElement.value = value;
      } else {
        hiddenElement.value = "";
      }
    });
  }

  function syncHiddenFieldsOnSubmit(form) {
    form.addEventListener("submit", function (e) {
      let startDisplayInput = document.getElementById(
        "anzahlZimmer_start_display"
      );
      let endDisplayInput = document.getElementById("anzahlZimmer_end_display");
      let startHiddenInput = document.getElementById("anzahlZimmer_start");
      let endHiddenInput = document.getElementById("anzahlZimmer_end");

      if (
        startDisplayInput &&
        startHiddenInput &&
        endDisplayInput &&
        endHiddenInput
      ) {
        startHiddenInput.value =
          startDisplayInput.value.trim() === ""
            ? ""
            : removeThousandSeparator(startDisplayInput.value);
        endHiddenInput.value =
          endDisplayInput.value.trim() === ""
            ? ""
            : removeThousandSeparator(endDisplayInput.value);
      }
    });
  }

  function restoreThousandSeparator(inputElement) {
    let value = inputElement.value;
    if (value !== "") {
      inputElement.value = formatNumberWithThousandSeparator(
        value.replace(/\./g, "")
      );
    }
  }

  function checkForZeroValue(inputElement) {
    if (inputElement.value === "0") {
      inputElement.value = ""; // Remove zero value
    }
  }

  let anzahlZimmerStartDisplay = document.getElementById(
    "anzahlZimmer_start_display"
  );
  let anzahlZimmerEndDisplay = document.getElementById(
    "anzahlZimmer_end_display"
  );
  let anzahlZimmerStart = document.getElementById("anzahlZimmer_start");
  let anzahlZimmerEnd = document.getElementById("anzahlZimmer_end");

  if (
    anzahlZimmerStartDisplay &&
    anzahlZimmerEndDisplay &&
    anzahlZimmerStart &&
    anzahlZimmerEnd
  ) {
    addThousandSeparatorOnInput(anzahlZimmerStartDisplay, anzahlZimmerStart);
    addThousandSeparatorOnInput(anzahlZimmerEndDisplay, anzahlZimmerEnd);

    // Restore thousand separator on page load
    restoreThousandSeparator(anzahlZimmerStartDisplay);
    restoreThousandSeparator(anzahlZimmerEndDisplay);

    // Check for zero value and remove it
    checkForZeroValue(anzahlZimmerStartDisplay);
    checkForZeroValue(anzahlZimmerEndDisplay);

    let form = anzahlZimmerStartDisplay.closest("form");
    if (form) {
      syncHiddenFieldsOnSubmit(form);
    }
  }
});
//Placeholder soll stehen bleiben bei Preis in Suche
document.addEventListener("DOMContentLoaded", function () {
  function formatNumberWithThousandSeparator(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function removeThousandSeparator(num) {
    return num.replace(/\./g, "");
  }

  function addThousandSeparatorOnInput(inputElement, hiddenElement) {
    inputElement.addEventListener("input", function (e) {
      let value = inputElement.value.replace(/\./g, "");
      if (!isNaN(value) && value !== "") {
        inputElement.value = formatNumberWithThousandSeparator(value);
        hiddenElement.value = value;
      } else {
        hiddenElement.value = "";
      }
    });
  }

  function syncHiddenFieldsOnSubmit(form) {
    form.addEventListener("submit", function (e) {
      let startDisplayInput = document.getElementById(
        "kaufpreis_start_display"
      );
      let endDisplayInput = document.getElementById("kaufpreis_end_display");
      let startHiddenInput = document.getElementById("kaufpreis_start");
      let endHiddenInput = document.getElementById("kaufpreis_end");

      if (
        startDisplayInput &&
        startHiddenInput &&
        endDisplayInput &&
        endHiddenInput
      ) {
        startHiddenInput.value =
          startDisplayInput.value.trim() === ""
            ? ""
            : removeThousandSeparator(startDisplayInput.value);
        endHiddenInput.value =
          endDisplayInput.value.trim() === ""
            ? ""
            : removeThousandSeparator(endDisplayInput.value);
      }
    });
  }

  function restoreThousandSeparator(inputElement) {
    let value = inputElement.value;
    if (value !== "") {
      inputElement.value = formatNumberWithThousandSeparator(
        value.replace(/\./g, "")
      );
    }
  }

  function checkForZeroValue(inputElement) {
    if (inputElement.value === "0") {
      inputElement.value = ""; // Remove zero value
    }
  }

  let kaufpreisStartDisplay = document.getElementById(
    "kaufpreis_start_display"
  );
  let kaufpreisEndDisplay = document.getElementById("kaufpreis_end_display");
  let kaufpreisStart = document.getElementById("kaufpreis_start");
  let kaufpreisEnd = document.getElementById("kaufpreis_end");

  if (
    kaufpreisStartDisplay &&
    kaufpreisEndDisplay &&
    kaufpreisStart &&
    kaufpreisEnd
  ) {
    addThousandSeparatorOnInput(kaufpreisStartDisplay, kaufpreisStart);
    addThousandSeparatorOnInput(kaufpreisEndDisplay, kaufpreisEnd);

    // Restore thousand separator on page load
    restoreThousandSeparator(kaufpreisStartDisplay);
    restoreThousandSeparator(kaufpreisEndDisplay);

    // Check for zero value and remove it
    checkForZeroValue(kaufpreisStartDisplay);
    checkForZeroValue(kaufpreisEndDisplay);

    let form = kaufpreisStartDisplay.closest("form");
    if (form) {
      syncHiddenFieldsOnSubmit(form);
    }
  }
});
//Leeres Max Preisfeld kompensieren bei Preis in Suche
document.addEventListener("DOMContentLoaded", function () {
  function formatNumberWithThousandSeparator(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function removeThousandSeparator(num) {
    return num.replace(/\./g, "");
  }

  function addThousandSeparatorOnInput(inputElement, hiddenElement) {
    inputElement.addEventListener("input", function (e) {
      let value = inputElement.value.replace(/\./g, "");
      if (!isNaN(value) && value !== "") {
        inputElement.value = formatNumberWithThousandSeparator(value);
        hiddenElement.value = value;
      } else {
        hiddenElement.value = "";
      }
    });
  }

  function syncHiddenFieldsOnSubmit(form) {
    form.addEventListener("submit", function (e) {
      let startDisplayInput = document.getElementById(
        "kaufpreis_start_display"
      );
      let endDisplayInput = document.getElementById("kaufpreis_end_display");
      let startHiddenInput = document.getElementById("kaufpreis_start");
      let endHiddenInput = document.getElementById("kaufpreis_end");

      if (
        startDisplayInput &&
        startHiddenInput &&
        endDisplayInput &&
        endHiddenInput
      ) {
        startHiddenInput.value =
          startDisplayInput.value.trim() === ""
            ? ""
            : removeThousandSeparator(startDisplayInput.value);
        endHiddenInput.value =
          endDisplayInput.value.trim() === ""
            ? "80000000"
            : removeThousandSeparator(endDisplayInput.value);
      }
    });
  }

  function restoreThousandSeparator(inputElement) {
    let value = inputElement.value;
    if (value !== "") {
      inputElement.value = formatNumberWithThousandSeparator(
        value.replace(/\./g, "")
      );
    }
  }

  function checkForZeroValue(inputElement) {
    if (inputElement.value === "0") {
      inputElement.value = ""; // Remove zero value
    }
  }

  let kaufpreisStartDisplay = document.getElementById(
    "kaufpreis_start_display"
  );
  let kaufpreisEndDisplay = document.getElementById("kaufpreis_end_display");
  let kaufpreisStart = document.getElementById("kaufpreis_start");
  let kaufpreisEnd = document.getElementById("kaufpreis_end");

  if (
    kaufpreisStartDisplay &&
    kaufpreisEndDisplay &&
    kaufpreisStart &&
    kaufpreisEnd
  ) {
    addThousandSeparatorOnInput(kaufpreisStartDisplay, kaufpreisStart);
    addThousandSeparatorOnInput(kaufpreisEndDisplay, kaufpreisEnd);

    // Restore thousand separator on page load
    restoreThousandSeparator(kaufpreisStartDisplay);
    restoreThousandSeparator(kaufpreisEndDisplay);

    // Check for zero value and remove it
    checkForZeroValue(kaufpreisStartDisplay);
    checkForZeroValue(kaufpreisEndDisplay);

    let form = kaufpreisStartDisplay.closest("form");
    if (form) {
      syncHiddenFieldsOnSubmit(form);
    }
  }
});

//Reset Button
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("openimmo-search-form");
  if (!form) {
    return;
  }
  form.addEventListener("reset", function () {
    // Timeout hinzufügen, um sicherzustellen, dass das Formular zurückgesetzt ist, bevor die Felder manuell geleert werden
    setTimeout(function () {
      // Kaufpreis-Felder leeren
      let kaufpreisStartDisplay = document.getElementById(
        "kaufpreis_start_display"
      );
      let kaufpreisEndDisplay = document.getElementById(
        "kaufpreis_end_display"
      );
      let kaufpreisStart = document.getElementById("kaufpreis_start");
      let kaufpreisEnd = document.getElementById("kaufpreis_end");

      if (kaufpreisStartDisplay) kaufpreisStartDisplay.value = "";
      if (kaufpreisEndDisplay) kaufpreisEndDisplay.value = "";
      if (kaufpreisStart) kaufpreisStart.value = "";
      if (kaufpreisEnd) kaufpreisEnd.value = "";

      // Anzahl Zimmer-Felder leeren
      let anzahlZimmerStartDisplay = document.getElementById(
        "anzahlZimmer_start_display"
      );
      let anzahlZimmerEndDisplay = document.getElementById(
        "anzahlZimmer_end_display"
      );
      let anzahlZimmerStart = document.getElementById("anzahlZimmer_start");
      let anzahlZimmerEnd = document.getElementById("anzahlZimmer_end");

      if (anzahlZimmerStartDisplay) anzahlZimmerStartDisplay.value = "";
      if (anzahlZimmerEndDisplay) anzahlZimmerEndDisplay.value = "";
      if (anzahlZimmerStart) anzahlZimmerStart.value = "";
      if (anzahlZimmerEnd) anzahlZimmerEnd.value = "";

      // Wohnfläche-Felder leeren
      let wohnflaecheStartDisplay = document.getElementById(
        "wohnflaeche_start_display"
      );
      let wohnflaecheEndDisplay = document.getElementById(
        "wohnflaeche_end_display"
      );
      let wohnflaecheStart = document.getElementById("wohnflaeche_start");
      let wohnflaecheEnd = document.getElementById("wohnflaeche_end");

      if (wohnflaecheStartDisplay) wohnflaecheStartDisplay.value = "";
      if (wohnflaecheEndDisplay) wohnflaecheEndDisplay.value = "";
      if (wohnflaecheStart) wohnflaecheStart.value = "";
      if (wohnflaecheEnd) wohnflaecheEnd.value = "";
    }, 0); // Timeout auf 0 setzen, damit der Reset zuerst ausgeführt wird
  });
});

//Carousel OPENIMMO
$(document).ready(function () {
  $(".owl-carousel").owlCarousel({
    loop: true,
    margin: 15,
    nav: true,
    navText: [
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    ],
    responsive: {
      0: {
        items: 1, // 1 Objekt auf Mobilgeräten
        nav: false, // Pfeile auf Mobilgeräten deaktivieren
        touchDrag: true, // Swipe aktivieren
        mouseDrag: false, // Verhindert versehentliches Scrollen am Desktop
        pullDrag: true, // Verbesserte Drag-Erfahrung
        freeDrag: false, // Begrenzt das Drag auf Slide-Länge
      },
      768: {
        items: 2, // 2 Objekte auf kleineren Tablets
        nav: true, // Navigation auch auf Tablets anzeigen
      },
      1024: {
        items: 3, // 3 Objekte auf Desktops
        nav: true, // Navigation auf Desktop anzeigen
      },
    },
  });
});

//Quickfinder Inseln für Regionsauswahl

document.addEventListener("DOMContentLoaded", function () {
  // 1) Alle Checkboxen des ersten Felds (Gebiet):
  const regionCheckboxes = document.querySelectorAll(
    'input[name="tx_openimmo_immobilie[lageGebietGebiet][]"]'
  );

  // 2) Der Button / Container des zweiten Felds:
  const zusatzDropdownButton = document.getElementById(
    "dropdownZusatzCheckbox"
  );
  // Alle Checkbox-Divs im zweiten Dropdown:
  const ortsCheckboxes = document.querySelectorAll(
    'input[name="tx_openimmo_immobilie[lageGebietRegionalerZusatz][]"]'
  );

  /**
   * Aktualisiert das zweite Dropdown (Ortsnamen) basierend auf ausgewählten Gebieten.
   */
  function updateOrtsnamen() {
    // Sammle alle echten Gebiets-Keys (Value != "")
    let selectedKeys = [];
    regionCheckboxes.forEach((cb) => {
      if (cb.checked && cb.value !== "") {
        selectedKeys.push(cb.value);
      }
    });

    // Falls nichts (außer "") ausgewählt: zweites Dropdown sperren
    if (selectedKeys.length === 0) {
      if (zusatzDropdownButton) {
        zusatzDropdownButton.disabled = true;
      }
      // Blende am besten alle Ortsnamen aus, oder lass sie disabled
      ortsCheckboxes.forEach((ortCb) => {
        ortCb.parentElement.style.display = "none";
        ortCb.checked = false; // ggf. abwählen
      });
      return;
    }

    // Mind. 1 Gebiet -> zweites Dropdown aktivieren
    if (zusatzDropdownButton) {
      zusatzDropdownButton.disabled = false;
    }

    // Jetzt jedes Orts-Checkbox-Element prüfen
    ortsCheckboxes.forEach((ortCb) => {
      // Im Fluid haben wir additionalAttributes="{ 'data-land': '{gebietKey}' }"
      const dataLand = ortCb.getAttribute("data-land") || "";

      // Datenland leer => "Keine Auswahl" => Zeigen oder Verstecken nach Geschmack
      if (dataLand === "") {
        ortCb.parentElement.style.display = "block";
        return;
      }

      // Zeige Orts-Checkbox nur, wenn data-land in den ausgewählten Keys ist
      if (selectedKeys.includes(dataLand)) {
        ortCb.parentElement.style.display = "block";
      } else {
        ortCb.parentElement.style.display = "none";
        ortCb.checked = false; // abwählen, falls selektiert
      }
    });
  }

  // 3) Ereignis-Listener
  regionCheckboxes.forEach((cb) => {
    cb.addEventListener("change", updateOrtsnamen);
  });

  // 4) Initialer Aufruf, falls schon Checkboxen vorausgewählt sind
  updateOrtsnamen();
});

//Sortierung der Dropdownbox Orte ond er Quicksearch Inseln

document.addEventListener("DOMContentLoaded", function () {
  // Alle Checkboxen der Regionen
  const regionCheckboxes = document.querySelectorAll(
    'input[name="tx_openimmo_immobilie[lageGebietGebiet][]"]'
  );
  // Button des Standort-Dropdowns
  const zusatzDropdownButton = document.getElementById(
    "dropdownZusatzCheckbox"
  );
  // Container, der alle Standort-Checkboxen enthält
  const container = document.getElementById("zusatzCheckboxContainer");

  // Einmalige alphabetische Sortierung aller Standort-Checkboxen (außer erstem Block)
  function sortAllLocationsAlphabeticallyOnce() {
    if (!container || container.dataset.sorted === "1") return;
    const items = Array.from(
      container.querySelectorAll("div.location-checkbox")
    );
    if (items.length <= 1) {
      container.dataset.sorted = "1";
      return;
    }
    const firstBlock = items[0];
    const rest = items.slice(1);
    rest.sort((a, b) => {
      const textA = (a.querySelector("label")?.innerText || "")
        .trim()
        .toLowerCase();
      const textB = (b.querySelector("label")?.innerText || "")
        .trim()
        .toLowerCase();
      if (textA < textB) return -1;
      if (textA > textB) return 1;
      return 0;
    });
    rest.forEach((item) => container.appendChild(item));
    container.dataset.sorted = "1";
  }

  // Verzögert ausführen, um UI-Thread zu entlasten
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(sortAllLocationsAlphabeticallyOnce, { timeout: 500 });
  } else {
    setTimeout(sortAllLocationsAlphabeticallyOnce, 200);
  }

  function updateOrtsnamen() {
    // Zunächst: welche Regionen wurden ausgewählt?
    let selectedKeys = [];
    regionCheckboxes.forEach((cb) => {
      if (cb.checked && cb.value !== "") {
        selectedKeys.push(cb.value);
      }
    });

    // Falls keine Region ausgewählt: Dropdown deaktivieren und alle Standort-Items verstecken
    if (selectedKeys.length === 0) {
      if (zusatzDropdownButton) {
        zusatzDropdownButton.disabled = true;
      }
      if (container) {
        container.querySelectorAll("div.location-checkbox").forEach((item) => {
          item.style.display = "none";
          const cb = item.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = false;
        });
      }
      return;
    }

    if (zusatzDropdownButton) {
      zusatzDropdownButton.disabled = false;
    }
    if (!container) {
      return;
    }
    // Filtere die Standort-Checkboxen basierend auf dem data-land-Attribut
    container.querySelectorAll("div.location-checkbox").forEach((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const dataLand = checkbox.getAttribute("data-land") || "";
      if (dataLand === "" || selectedKeys.includes(dataLand)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
        checkbox.checked = false;
      }
    });

    // Sortierung entfällt hier, da einmalig verzögert beim Laden ausgeführt
  }

  // Event-Listener an die Regionen-Checkboxen binden
  regionCheckboxes.forEach((cb) => {
    cb.addEventListener("change", updateOrtsnamen);
  });

  // Initialer Aufruf beim Laden
  updateOrtsnamen();
});

//Gtag
document.addEventListener("DOMContentLoaded", function () {
  console.log("🛰️ Beobachte DOM-Veränderungen auf document.body");

  let trackingSent = false;

  const observer = new MutationObserver(function (mutationsList) {
    if (trackingSent) return;

    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const successBox = document.querySelector(".alert-success");
        if (successBox && !trackingSent) {
          console.log("✅ Anfrage erfolgreich – Tracking ausgelöst");
          gtag("event", "ImmobilieAngefragt", {
            event_category: "Kontaktformular",
          });

          trackingSent = true;
          observer.disconnect();
          break;
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Safety: disconnect observer nach 10s, um Dauerlast zu vermeiden
  setTimeout(() => {
    if (!trackingSent) {
      observer.disconnect();
    }
  }, 10000);
});

//Ersetzt im Quicksearch die Namen der Regionen
document.addEventListener("DOMContentLoaded", function () {
  // --- Erster Dropdown (Region w�hlen) ---
  const regionButton = document.getElementById("dropdownFilterCheckbox");
  const regionContainer = document.getElementById("zusatzFilterContainer");
  if (!regionButton || !regionContainer) return;
  const regionCheckboxes = regionContainer.querySelectorAll(
    'input[type="checkbox"]'
  );

  function updateRegionButtonText() {
    // Alle angehakten Checkboxen finden
    const checked = [...regionCheckboxes].filter(
      (checkbox) => checkbox.checked
    );

    if (checked.length === 0) {
      // Nichts ausgew�hlt -> Default-Text
      regionButton.textContent = "Region w�hlen";
    } else {
      // Z. B. Anzahl der gew�hlten Optionen
      regionButton.textContent = checked.length + " selected";
    }
  }

  regionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateRegionButtonText);
  });

  // --- Zweiter Dropdown (Standort w�hlen) ---
  const zusatzButton = document.getElementById("dropdownZusatzCheckbox");
  const zusatzContainer = document.getElementById("zusatzCheckboxContainer");
  if (!zusatzButton || !zusatzContainer) return;
  const zusatzCheckboxes = zusatzContainer.querySelectorAll(
    'input[type="checkbox"]'
  );

  function updateZusatzButtonText() {
    const checked = [...zusatzCheckboxes].filter(
      (checkbox) => checkbox.checked
    );

    if (checked.length === 0) {
      zusatzButton.textContent = "Standort w�hlen";
    } else {
      zusatzButton.textContent = checked.length + " selected";
    }
  }

  zusatzCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateZusatzButtonText);
  });
});

//Testimonial Boxen alle gleiche Hoehe
document.addEventListener("DOMContentLoaded", function () {
  // SVG-Icons als Strings definieren
  const svgDown = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="ffffff" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5"></path>
    </svg>
  `;
  const svgUp = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="ffffff" viewBox="0 0 24 24">
      <path d="M7 14l5-5 5 5"></path>
    </svg>
  `;

  // Funktion zum Angleichen der .ce-bodytext-H�hen (sofern nicht erweitert)
  function equalizeBodytextHeights() {
    const cards = document.querySelectorAll(".equalize-bodytext-heights");
    if (!cards.length) return;
    let maxHeight = 0;

    // Reset: H�he auf "auto", um die nat�rliche H�he zu messen
    cards.forEach((card) => {
      const bodytext = card.querySelector(".ce-bodytext");
      if (!bodytext) return;
      if (!bodytext.classList.contains("expanded")) {
        bodytext.style.height = "auto";
        maxHeight = Math.max(maxHeight, bodytext.offsetHeight);
      }
    });

    // Angleichen � nur wenn der Container nicht erweitert ist.
    cards.forEach((card) => {
      const bodytext = card.querySelector(".ce-bodytext");
      if (!bodytext) return;
      if (!bodytext.classList.contains("expanded")) {
        bodytext.style.height = maxHeight + "px";
        bodytext.style.borderBottom = "22px solid #fff";
      }
    });
  }

  // Funktion zum Setup des "Read more"-Toggles unter Verwendung von inline SVG
  function setupReadMore(limit = 300) {
    const cards = document.querySelectorAll(".equalize-bodytext-heights");
    cards.forEach((card) => {
      const bodytext = card.querySelector(".ce-bodytext");
      if (!bodytext) return;

      // Tempor�r H�he zur�cksetzen, um die tats�chliche scrollHeight zu ermitteln
      const originalHeight = bodytext.style.height;
      bodytext.style.height = "auto";
      const actualHeight = bodytext.scrollHeight;
      bodytext.style.height = originalHeight;

      // Nur hinzuf�gen, wenn der Inhalt gr��er als das Limit ist
      if (actualHeight > limit) {
        // Pr�fen, ob der Toggle noch nicht existiert
        if (!bodytext.querySelector(".read-more-toggle")) {
          const toggle = document.createElement("div");
          toggle.className = "read-more-toggle";
          // Startzustand: geschlossen, SVG-Pfeil nach unten
          toggle.innerHTML = svgDown;
          bodytext.appendChild(toggle);

          toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            if (bodytext.classList.contains("expanded")) {
              // Zusammenklappen
              bodytext.classList.remove("expanded");
              toggle.innerHTML = svgDown;
              equalizeBodytextHeights();
            } else {
              // Aufklappen
              bodytext.classList.add("expanded");
              toggle.innerHTML = svgUp;
              bodytext.style.height = "auto"; // H�he auf auto setzen, um den vollen Text anzuzeigen
            }
          });
        }
      }
    });
  }

  // Initiale Ausf�hrung
  equalizeBodytextHeights();
  setupReadMore();

  // Bei Resize erneut ausf�hren, um dynamische �nderungen zu verarbeiten
  window.addEventListener("resize", function () {
    equalizeBodytextHeights();
    setupReadMore();
  });
});
