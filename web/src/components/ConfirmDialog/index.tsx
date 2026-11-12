import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "../Button";
import { Icon, type IconName } from "../Icon";
import "./styles.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  icon?: IconName;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  icon,
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
        e.preventDefault();
        onCancel();
      }}
    >
      {icon && (
        <div className="confirm-dialog-icon">
          {
            <Icon
              color="white"
              size={20}
              circleColor="primary"
              circleSize={64}
              circle
              icon={icon}
              shadow
            />
          }
        </div>
      )}
      <h2 id="confirm-dialog-title" className="confirm-dialog-title">
        {title}
      </h2>
      <p className="confirm-dialog-message">{message}</p>

      <div className="confirm-dialog-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="confirm-dialog-confirm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          Confirmar
        </Button>
      </div>
    </dialog>
  );
};
