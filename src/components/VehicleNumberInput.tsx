import { useRef, useState } from 'react';
import { validateVehicleNumber, sanitizeVehicleInput } from '../utils/vehicleValidation';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export type VehicleInputValidationState = 'idle' | 'invalid' | 'valid';

export interface VehicleNumberInputProps {
  /** Controlled value from parent */
  value: string;
  /** Called on every keystroke with the sanitized uppercase value */
  onChange: (value: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional id for the underlying <input> */
  id?: string;
  /** Optional extra class names on the wrapper */
  className?: string;
  /** Disabled state forwarded to <input> */
  disabled?: boolean;
}

// -------------------------------------------------------------------
// Helper: derive validation state from current input value
// -------------------------------------------------------------------

/**
 * Returns the current validation state.
 *  - 'idle'    → empty / untouched
 *  - 'invalid' → user has typed something but it doesn't fully match yet
 *  - 'valid'   → the value satisfies the MoRTH vehicle regex
 */
export function deriveValidationState(value: string): VehicleInputValidationState {
  if (value.trim() === '') return 'idle';
  return validateVehicleNumber(value) ? 'valid' : 'invalid';
}

/**
 * Maps a validation state to a human-readable helper message
 * shown beneath the input.
 */
export function getValidationMessage(state: VehicleInputValidationState): string {
  switch (state) {
    case 'idle':
      return '';
    case 'invalid':
      return 'Invalid format — try e.g. MH12AB1234 or 26BH1234AB';
    case 'valid':
      return '';
  }
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function VehicleNumberInput({
  value,
  onChange,
  placeholder = 'Enter vehicle number (e.g. MH12AB1234)',
  id = 'vehicle-number-input',
  className = '',
  disabled = false,
}: VehicleNumberInputProps) {
  // Track whether the user has interacted with the field at all,
  // so we don't show red on a completely fresh empty field.
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validationState = touched ? deriveValidationState(value) : 'idle';
  const message = getValidationMessage(validationState);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!touched) setTouched(true);
    const sanitized = sanitizeVehicleInput(e.target.value);
    onChange(sanitized);
  }

  // Compute modifier class for the input
  const inputModifier =
    validationState === 'valid'
      ? 'reg-input--valid'
      : validationState === 'invalid'
        ? 'reg-input--invalid'
        : '';

  return (
    <div className={`vehicle-number-input-wrapper ${className}`}>
      <div className="vehicle-input-field-row">
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className={`reg-input ${inputModifier}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          aria-label="Vehicle registration number"
          aria-describedby={`${id}-helper`}
          aria-invalid={validationState === 'invalid'}
        />

        {/* Validation state icon — appears inside the right edge of input */}
        <span className={`vehicle-input-status-icon vehicle-input-status-icon--${validationState}`} aria-hidden="true">
          {validationState === 'valid' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {validationState === 'invalid' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </span>
      </div>

      {/* Helper / error message */}
      <p
        id={`${id}-helper`}
        className={`vehicle-input-helper vehicle-input-helper--${validationState}`}
        role={validationState === 'invalid' ? 'alert' : undefined}
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}
