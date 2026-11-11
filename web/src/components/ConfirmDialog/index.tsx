import { useEffect, useRef } from "react";
import "./styles.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        e.preventDefault(); // o Esc não fecha sozinho; quem fecha é o estado
        onCancel();
      }}
    >
      <h2 id="confirm-dialog-title" className="confirm-dialog-title">
        {title}
      </h2>
      <p className="confirm-dialog-message">{message}</p>

      <div className="confirm-dialog-actions">
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </button>
        <button
          type="button"
          className="confirm-dialog-confirm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Removendo..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
