"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, labelledBy, children, className, size = "lg" }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      aria-hidden={!isOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={cn(styles.dialog, styles[size], className)} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}
