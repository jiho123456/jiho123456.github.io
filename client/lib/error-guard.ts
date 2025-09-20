export function installErrorGuard() {
  if (typeof window === "undefined") return;

  function isFullStoryError(ev: ErrorEvent | any, reason?: any) {
    try {
      const msg =
        (ev && ev.message) ||
        (reason && reason.message) ||
        (reason && String(reason)) ||
        "";
      const stack =
        (ev && ev.error && ev.error.stack) || (reason && reason.stack) || "";
      if (
        msg.toLowerCase().includes("failed to fetch") &&
        (stack.includes("fullstory") ||
          msg.toLowerCase().includes("fullstory") ||
          stack.includes("edge.fullstory.com"))
      )
        return true;
      if (stack.includes("edge.fullstory.com")) return true;
    } catch {}
    return false;
  }

  window.addEventListener("error", (ev) => {
    try {
      if (isFullStoryError(ev)) {
        // prevent noisy console message for FullStory network failures in preview env
        if (ev.preventDefault) ev.preventDefault();
      }
    } catch {}
  });

  window.addEventListener("unhandledrejection", (ev) => {
    try {
      if (isFullStoryError(ev, ev.reason)) {
        // stop the default logging
        if (ev.preventDefault) ev.preventDefault();
      }
    } catch {}
  });
}
