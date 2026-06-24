import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import { stageApi } from '../../../shared/api/stageApi';
import { openExternalApplicationUrl } from '../helpers/offerApplyAction';
import {
  clearPendingExternalApply,
  markPendingExternalApply,
} from '../helpers/externalApplyPendingStorage';
import {
  classifyApplicationSubmitError,
  isDuplicateApplicationError,
} from '../helpers/applicationError';
import { submitExternalStudentApplication } from '../hooks/useStudentStageOffers';
import type { ApplicationReadiness } from '../types/journeyTypes';

interface ExternalApplyConfirmationState {
  isOpen: boolean;
  offerId: string | null;
  offerTitle: string | null;
}

interface StartExternalApplyParams {
  offerId: string;
  externalUrl: string;
  offerTitle?: string;
}

export type ExternalApplyErrorCode =
  | 'submit_failed'
  | 'offer_not_applyable'
  | 'offer_expired';

interface ExternalApplyConfirmationContextValue extends ExternalApplyConfirmationState {
  startExternalApply: (params: StartExternalApplyParams) => void;
  openPendingConfirmation: (params: { offerId: string; offerTitle?: string }) => void;
  confirmApplied: () => Promise<void>;
  declineApplied: () => void;
  submitting: boolean;
  readinessChecking: boolean;
  error: ExternalApplyErrorCode | null;
  success: boolean;
}

function readInitialState(): ExternalApplyConfirmationState {
  return { isOpen: false, offerId: null, offerTitle: null };
}

const ExternalApplyConfirmationContext = createContext<ExternalApplyConfirmationContextValue | null>(
  null,
);

export const ExternalApplyConfirmationProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ExternalApplyConfirmationState>(readInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [readinessChecking, setReadinessChecking] = useState(false);
  const [cachedReadiness, setCachedReadiness] = useState<ApplicationReadiness | null>(null);
  const [error, setError] = useState<ExternalApplyErrorCode | null>(null);
  const [success, setSuccess] = useState(false);
  const offerTitleRef = useRef(state.offerTitle);
  offerTitleRef.current = state.offerTitle;

  const closeOverlay = useCallback(() => {
    setState({ isOpen: false, offerId: null, offerTitle: null });
    setSubmitting(false);
    setReadinessChecking(false);
    setCachedReadiness(null);
    setError(null);
    setSuccess(false);
  }, []);

  const completeExternalApply = useCallback(() => {
    if (!state.offerId) return;
    clearPendingExternalApply(state.offerId);
    setSuccess(true);
    window.setTimeout(closeOverlay, 2400);
  }, [closeOverlay, state.offerId]);

  const startExternalApply = useCallback(
    ({ offerId, externalUrl, offerTitle }: StartExternalApplyParams) => {
      if (state.isOpen) return;
      markPendingExternalApply(offerId, offerTitle);
      openExternalApplicationUrl(externalUrl);
      setCachedReadiness(null);
      setError(null);
      setSuccess(false);
      setState({ isOpen: true, offerId, offerTitle: offerTitle ?? null });
    },
    [state.isOpen],
  );

  const openPendingConfirmation = useCallback(
    ({ offerId, offerTitle }: { offerId: string; offerTitle?: string }) => {
      setCachedReadiness(null);
      setError(null);
      setSuccess(false);
      setState({
        isOpen: true,
        offerId,
        offerTitle: offerTitle ?? null,
      });
    },
    [],
  );

  useEffect(() => {
    const offerId = state.offerId;
    if (!state.isOpen || !offerId) return undefined;

    let cancelled = false;

    setReadinessChecking(true);

    void (async () => {
      try {
        const readiness = await stageApi.applicationReadiness(offerId);
        if (cancelled) return;

        setCachedReadiness(readiness);

        if (readiness.already_applied) {
          clearPendingExternalApply(offerId);
          closeOverlay();
          return;
        }

        if (!readiness.external_tracking_available) {
          clearPendingExternalApply(offerId);
          closeOverlay();
          return;
        }

        if (!offerTitleRef.current) {
          const detail = await stageApi.detail(offerId).catch(() => null);
          if (cancelled) return;
          if (detail?.title) {
            setState((prev) =>
              prev.isOpen && prev.offerId === offerId
                ? { ...prev, offerTitle: detail.title }
                : prev,
            );
          }
        }
      } catch {
        // Keep overlay open; user must still answer.
      } finally {
        if (!cancelled) setReadinessChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.isOpen, state.offerId, closeOverlay]);

  const confirmApplied = useCallback(async () => {
    if (!state.offerId || submitting || readinessChecking) return;
    setSubmitting(true);
    setError(null);

    try {
      const readiness =
        cachedReadiness ?? (await stageApi.applicationReadiness(state.offerId));
      setCachedReadiness(readiness);

      if (readiness.already_applied) {
        completeExternalApply();
        return;
      }

      if (!readiness.external_tracking_available && !readiness.offer_applyable) {
        setError('offer_not_applyable');
        return;
      }

      await submitExternalStudentApplication(state.offerId);
      completeExternalApply();
    } catch (err) {
      const conflict = classifyApplicationSubmitError(err);
      if (isDuplicateApplicationError(err) || conflict === 'duplicate') {
        completeExternalApply();
        return;
      }
      if (conflict === 'offer_expired') {
        setError('offer_expired');
        return;
      }
      if (conflict === 'offer_not_applyable') {
        setError('offer_not_applyable');
        return;
      }
      setError('submit_failed');
    } finally {
      setSubmitting(false);
    }
  }, [
    cachedReadiness,
    completeExternalApply,
    readinessChecking,
    state.offerId,
    submitting,
  ]);

  const declineApplied = useCallback(() => {
    if (!state.offerId) {
      closeOverlay();
      return;
    }
    clearPendingExternalApply(state.offerId);
    closeOverlay();
  }, [closeOverlay, state.offerId]);

  const value = useMemo<ExternalApplyConfirmationContextValue>(
    () => ({
      ...state,
      startExternalApply,
      openPendingConfirmation,
      confirmApplied,
      declineApplied,
      submitting,
      readinessChecking,
      error,
      success,
    }),
    [
      state,
      startExternalApply,
      openPendingConfirmation,
      confirmApplied,
      declineApplied,
      submitting,
      readinessChecking,
      error,
      success,
    ],
  );

  return (
    <ExternalApplyConfirmationContext.Provider value={value}>
      {children}
    </ExternalApplyConfirmationContext.Provider>
  );
};

export function useExternalApplyConfirmation(): ExternalApplyConfirmationContextValue {
  const ctx = useContext(ExternalApplyConfirmationContext);
  if (!ctx) {
    throw new Error('useExternalApplyConfirmation must be used within ExternalApplyConfirmationProvider');
  }
  return ctx;
}
