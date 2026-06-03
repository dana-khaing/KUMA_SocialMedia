"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

export default ModalPortal;
