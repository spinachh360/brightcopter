import { useId, useRef, useState } from 'react';

// Browser safeguards reduce repeated handoffs; they do not replace server limits.
export function useFormGuard(kind: string) {
  const [error, setError] = useState('');
  const used = useRef(false);
  const id = useId();
  function check(form: HTMLFormElement, consume = false) {
    if (new FormData(form).get('website')) { setError('We could not prepare this request. Please reload the page and try again.'); return false; }
    if (!consume) return true;
    if (used.current) return false;
    const key = `bc-limit-${kind}`;
    let attempts: number[] = [];
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) attempts = saved.filter(t => typeof t === 'number' && t > Date.now() - 300_000 && t <= Date.now());
    } catch { /* Storage may be disabled; an in-memory duplicate guard still works. */ }
    if (attempts.length >= 3) { setError('You have prepared several requests recently. Please wait five minutes or contact our team directly.'); return false; }
    used.current = true;
    try { sessionStorage.setItem(key, JSON.stringify([...attempts, Date.now()])); } catch { /* Optional storage. */ }
    return true;
  }
  return {
    error, setError, check,
    release: () => { used.current = false; },
    fields: <>
      <div className="form-trap" aria-hidden="true"><label htmlFor={id}>Leave this field empty</label><input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </>,
  };
}
