'use client'
import { useEffect, useRef } from "react";

const Modal = ({ open, children, onClose }) => {
  const dialogRef = useRef();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      className="m-auto backdrop:bg-black/60 backdrop:blur-sm rounded-md border-white/10  shadow-lg"
      ref={dialogRef}
      onClose={onClose}
    >
      <div className="p-6">{children}</div>
    </dialog>
  );
};

export default Modal;
