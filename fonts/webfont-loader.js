(function () {
  "use strict";

  const chunks = window.SHANGGU_WEBFONT_CHUNKS || [];
  const script = document.currentScript;
  const base = new URL("shanggu-web/", script.src);
  const pending = chunks.filter(chunk => !chunk.core);
  const requested = new Set();
  let urgent = false;
  let scheduled = false;

  function preload(chunk, highPriority) {
    if (!chunk || requested.has(chunk.file)) return;
    requested.add(chunk.file);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = new URL(chunk.file, base).href;
    link.fetchPriority = highPriority ? "high" : "low";
    document.head.append(link);
  }

  function drain(deadline) {
    scheduled = false;
    const batchSize = urgent ? 4 : 1;
    let count = 0;
    while (pending.length && count < batchSize && (urgent || !deadline || deadline.timeRemaining() > 5)) {
      preload(pending.shift(), urgent);
      count += 1;
    }
    if (pending.length) schedule();
  }

  function schedule() {
    if (scheduled || !pending.length) return;
    scheduled = true;
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(drain, { timeout: urgent ? 250 : 2000 });
    } else {
      window.setTimeout(() => drain(), urgent ? 0 : 250);
    }
  }

  function prioritize() {
    urgent = true;
    drain();
  }

  window.addEventListener("load", schedule, { once: true });
  function prioritizeOnInput(event) {
    if (!event.target.matches("input, textarea, [contenteditable]")) return;
    document.removeEventListener("focusin", prioritizeOnInput);
    prioritize();
  }
  document.addEventListener("focusin", prioritizeOnInput);

  const target = document.querySelector("[data-font-warmup]");
  if (target && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        prioritize();
      }
    }, { rootMargin: "600px" });
    observer.observe(target);
  }
})();
