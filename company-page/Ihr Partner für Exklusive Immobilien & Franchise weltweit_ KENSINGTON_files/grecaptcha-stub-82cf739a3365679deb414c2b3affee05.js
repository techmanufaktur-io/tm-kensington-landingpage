// Minimal grecaptcha stub to prevent ReferenceError until the real API is loaded
// This queues render calls and replays them once the actual reCAPTCHA script is available.
(function (w) {
  if (w.grecaptcha) {
    return; // Already present
  }

  var queuedRenders = [];
  var queuedReady = [];
  var renderedElements = typeof WeakSet !== "undefined" ? new WeakSet() : null;
  var stub = {
    render: function (container, params) {
      // De-duplicate by element if possible
      try {
        var element = null;
        if (typeof container === "string") {
          element =
            document.getElementById(container.replace(/^#/, "")) || null;
        } else if (container && container.nodeType === 1) {
          element = container;
        }
        if (renderedElements && element) {
          if (renderedElements.has(element)) {
            return; // already queued for this element
          }
          renderedElements.add(element);
        }
      } catch (_) {}

      if (queuedRenders.length < 100) {
        queuedRenders.push([container, params]);
      }
    },
    execute: function () {},
    ready: function (cb) {
      if (typeof cb === "function" && queuedReady.length < 100) {
        queuedReady.push(cb);
      }
    },
  };

  Object.defineProperty(w, "grecaptcha", {
    configurable: true,
    get: function () {
      return stub;
    },
    set: function (real) {
      // Replace stub with real grecaptcha and replay queued renders
      Object.defineProperty(w, "grecaptcha", {
        value: real,
        writable: false,
        configurable: false,
      });
      try {
        // Flush queued ready callbacks first
        if (queuedReady && queuedReady.length) {
          for (var r = 0; r < queuedReady.length; r++) {
            if (typeof real.ready === "function") {
              real.ready(queuedReady[r]);
            } else {
              // Fallback: invoke immediately
              try {
                queuedReady[r]();
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
      try {
        for (var i = 0; i < queuedRenders.length; i++) {
          real.render(queuedRenders[i][0], queuedRenders[i][1] || {});
        }
      } catch (e) {
        // no-op
      }
      queuedRenders = [];
      queuedReady = [];
    },
  });
})(window);
