// api/_store.ts
// Naive in-memory store for demo purposes (resets between cold starts).
export type TripStep = {
  id: string;
  title: string;
  detail?: string;
  status: 'pending' | 'in_progress' | 'done';
};

export type Trip = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  steps: TripStep[];
  currentIndex: number; // -1 before start, 0..n during, n at complete
  state: 'created' | 'started' | 'completed';
  createdAt: string;
  updatedAt: string;
};

const trips = new Map<string, Trip>();

export function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const db = {
  createTrip(input: Omit<Trip, 'id'|'createdAt'|'updatedAt'|'currentIndex'|'state'>): Trip {
    const id = genId();
    const now = new Date().toISOString();
    const trip: Trip = {
      id,
      name: input.name,
      origin: input.origin,
      destination: input.destination,
      steps: input.steps.map(s => ({...s, status: 'pending'})),
      currentIndex: -1,
      state: 'created',
      createdAt: now,
      updatedAt: now,
    };
    trips.set(id, trip);
    return trip;
  },
  getTrip(id: string) { return trips.get(id) || null; },
  listTrips() { return Array.from(trips.values()); },
  startTrip(id: string) {
    const t = trips.get(id);
    if (!t) return null;
    if (t.state !== 'created') return t;
    t.state = 'started';
    t.currentIndex = 0;
    if (t.steps[0]) t.steps[0].status = 'in_progress';
    t.updatedAt = new Date().toISOString();
    return t;
  },
  advanceTrip(id: string) {
    const t = trips.get(id);
    if (!t) return null;
    if (t.state !== 'started') return t;
    const idx = t.currentIndex;
    if (idx >= 0 && idx < t.steps.length) t.steps[idx].status = 'done';
    const next = idx + 1;
    if (next >= t.steps.length) {
      t.state = 'completed';
      t.currentIndex = t.steps.length;
    } else {
      t.currentIndex = next;
      t.steps[next].status = 'in_progress';
    }
    t.updatedAt = new Date().toISOString();
    return t;
  },
  completeTrip(id: string) {
    const t = trips.get(id);
    if (!t) return null;
    t.state = 'completed';
    t.currentIndex = t.steps.length;
    t.steps.forEach(s => (s.status = s.status === 'done' ? 'done' : 'done'));
    t.updatedAt = new Date().toISOString();
    return t;
  }
};
