import { useState } from "react";
import { Modal, FieldInput, ModalBtn } from "./Modal";
import { Alert, Spinner } from "./States";
import { errorMessage } from "../../lib/api";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  // When set, the confirm button stays disabled until this exact text is typed.
  requireText?: string;
  onConfirm: () => Promise<unknown>;
  onDone?: () => void;
}

export function ConfirmDialog({ isOpen, onClose, title, message, confirmLabel = "Delete", requireText, onConfirm, onDone }: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setTyped("");
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setTyped("");
      setBusy(false);
      onClose();
      onDone?.();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const blocked = requireText !== undefined && typed.trim() !== requireText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
      size="sm"
      footer={
        <>
          <ModalBtn variant="secondary" onClick={close} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="danger" onClick={confirm} disabled={busy || blocked} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} {confirmLabel}
          </ModalBtn>
        </>
      }
    >
      <div className="space-y-3 text-sm text-gray-600">
        <div>{message}</div>
        {requireText !== undefined && (
          <div>
            <p className="mb-1.5 text-xs text-gray-500">
              Type <span className="font-semibold text-gray-800">{requireText}</span> to confirm.
            </p>
            <FieldInput value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </div>
        )}
        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </Modal>
  );
}
