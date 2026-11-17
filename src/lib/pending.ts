import { Picked } from './image';

// Holds a just-picked photo while navigating to the screen that analyzes it.
// (Image picking must start from a tap on web, so it happens before navigation.)
// Read without clearing: a lazily loaded screen can mount more than once.
let pending: Picked | null = null;

export function setPending(p: Picked | null) {
  pending = p;
}

export function getPending(): Picked | null {
  return pending;
}
