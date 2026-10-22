import { type MouseEvent, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

/** The current page path, without a trailing slash ("/" for the home page). */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname.replace(/(.)\/+$/, "$1"));
}

export function navigate(path: string): void {
  if (path === window.location.pathname) return;
  window.history.pushState(null, "", path);
  window.scrollTo(0, 0);
  for (const listener of listeners) listener();
}

/** A click handler for a link to a page of the site: goes there without reloading the page. */
export function followLink(event: MouseEvent<HTMLAnchorElement>): void {
  // A click with a modifier opens a new tab or window, as for any link.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  event.preventDefault();
  navigate(event.currentTarget.pathname);
}
