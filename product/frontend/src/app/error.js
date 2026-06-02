"use client";

import { useEffect } from "react";
import BetaDatabaseFallback from "@/components/common/betaDatabaseFallback";
import { isDatabaseUnavailableError } from "@/lib/databaseStatus";

export default function Error({ error }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  if (!isDatabaseUnavailableError(error)) {
    throw error;
  }

  return <BetaDatabaseFallback />;
}
