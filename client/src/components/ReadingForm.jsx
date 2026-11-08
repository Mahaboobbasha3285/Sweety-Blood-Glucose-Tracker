import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SLOT_LABELS, SLOT_ORDER, validateReading } from "../utils/readings";
import { localDateString } from "../utils/dates";

export default function ReadingForm({
  initialReading,
  onSubmit,
  onClose,
  saving,
}) {
  const [date, setDate] = useState(initialReading?.date || localDateString());
  const [timeSlot, setTimeSlot] = useState(
    initialReading?.timeSlot || SLOT_ORDER[0],
  );
  const [value, setValue] = useState(initialReading?.value?.toString() || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setDate(initialReading?.date || localDateString());
    setTimeSlot(initialReading?.timeSlot || SLOT_ORDER[0]);
    setValue(initialReading?.value?.toString() || "");
    setError("");
  }, [initialReading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateReading({ date, timeSlot, value });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      await onSubmit({ date, timeSlot, value: Number(value) });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-form-title"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR DAILY LOG</span>
            <h2 id="reading-form-title">
              {initialReading ? "Edit reading" : "Add a reading"}
            </h2>
            <p>Keep your glucose journal up to date.</p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reading-form" noValidate>
          <label>
            Date
            <input
              type="date"
              value={date}
              max={localDateString()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Time slot
            <select
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
            >
              {SLOT_ORDER.map((slot) => (
                <option key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Glucose value
            <span className="unit-label">mg/dl</span>
            <div className="value-input-wrap">
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 110"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                required
              />
              <span>mg/dl</span>
            </div>
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : initialReading
                  ? "Save changes"
                  : "Save reading"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
