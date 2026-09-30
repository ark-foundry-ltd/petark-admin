// components/auth/useResetLink.ts
"use client";

import { useEffect, useState } from "react";

import { verifyResetToken, type ResetTokenInfo } from "@/lib/auth";

export type LinkState =
  | { status: "verifying" }
  | { status: "invalid" }
  | { status: "valid"; info: ResetTokenInfo };

/** Checks the emailed token once, so the form only shows for a usable link */
export function useResetLink(token: string): LinkState {
  const [state, setState] = useState<LinkState>(
    token ? { status: "verifying" } : { status: "invalid" }
  );

  useEffect(() => {
    if (!token) return;

    let active = true;

    verifyResetToken(token)
      .then((info) => {
        if (active) setState({ status: "valid", info });
      })
      .catch(() => {
        if (active) setState({ status: "invalid" });
      });

    return () => {
      active = false;
    };
  }, [token]);

  return state;
}