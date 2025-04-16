import React from "react";
import styles from "./styles/Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <h2 className={styles.modal_title}>{title}</h2>
          <button onClick={onClose} className={styles.close_button}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
