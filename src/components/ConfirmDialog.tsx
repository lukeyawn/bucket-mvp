import { createPortal } from 'react-dom';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return createPortal(
    <div className="overlay" role="presentation" onClick={onCancel}>
      <div className="dialog" role="alertdialog" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-title">{title}</h2>
        <p className="muted">{body}</p>
        <button
          className="btn btn-primary btn-block"
          style={danger ? { background: 'var(--danger)' } : undefined}
          onClick={onConfirm}
          autoFocus
        >
          {confirmLabel}
        </button>
        <button className="btn btn-secondary btn-block" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>,
    document.getElementById('phone')!,
  );
}
