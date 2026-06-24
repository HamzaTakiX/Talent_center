import type { InternshipOffer } from '../types';

export type StageOfferMutationAction = 'archive' | 'unarchive' | 'delete' | 'restore' | 'close';

export interface StageOfferMutationEvent {
  action: StageOfferMutationAction;
  offerId: string;
  previousUiStatus: InternshipOffer['status'];
  nextUiStatus: InternshipOffer['status'] | null;
  updatedOffer?: InternshipOffer;
}

type MutationListener = (event: StageOfferMutationEvent) => void;
type RefreshListener = () => void;

const mutationListeners = new Set<MutationListener>();
const dashboardRefreshListeners = new Set<RefreshListener>();

export function subscribeStageOfferMutations(listener: MutationListener): () => void {
  mutationListeners.add(listener);
  return () => mutationListeners.delete(listener);
}

export function emitStageOfferMutation(event: StageOfferMutationEvent): void {
  mutationListeners.forEach((listener) => listener(event));
}

export function subscribeStageOfferDashboardRefresh(listener: RefreshListener): () => void {
  dashboardRefreshListeners.add(listener);
  return () => dashboardRefreshListeners.delete(listener);
}

export function emitStageOfferDashboardRefresh(): void {
  dashboardRefreshListeners.forEach((listener) => listener());
}

export function offerBelongsInListFilter(
  uiStatus: InternshipOffer['status'] | null,
  listFilter: 'all' | InternshipOffer['status'],
): boolean {
  if (uiStatus === null) return false;
  if (listFilter === 'all') return true;
  return uiStatus === listFilter;
}

export function applyMutationToOfferList(
  items: InternshipOffer[],
  event: StageOfferMutationEvent,
  listFilter: 'all' | InternshipOffer['status'],
): InternshipOffer[] {
  const inList = items.some((offer) => offer.id === event.offerId);
  const shouldBeInList = offerBelongsInListFilter(event.nextUiStatus, listFilter);

  if (inList && !shouldBeInList) {
    return items.filter((offer) => offer.id !== event.offerId);
  }
  if (!inList && shouldBeInList && event.updatedOffer) {
    return [event.updatedOffer, ...items];
  }
  if (inList && shouldBeInList && event.updatedOffer) {
    return items.map((offer) => (offer.id === event.offerId ? event.updatedOffer! : offer));
  }
  return items;
}

export function deltaTotalForMutation(
  items: InternshipOffer[],
  event: StageOfferMutationEvent,
  listFilter: 'all' | InternshipOffer['status'],
  currentTotal: number,
): number {
  const inList = items.some((offer) => offer.id === event.offerId);
  const shouldBeInList = offerBelongsInListFilter(event.nextUiStatus, listFilter);
  if (inList && !shouldBeInList) return Math.max(0, currentTotal - 1);
  if (!inList && shouldBeInList) return currentTotal + 1;
  return currentTotal;
}
