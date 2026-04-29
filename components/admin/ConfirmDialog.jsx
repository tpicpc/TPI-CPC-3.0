"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function useConfirm() {
  const [state, setState] = useState({ open: false });

  const confirm = (opts = {}) =>
    new Promise((resolve) => {
      setState({ open: true, ...opts, resolve });
    });

  const Dialog = () =>
    !state.open ? null : (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-xl">
          <h3 className="text-lg font-semibold mb-2">{state.title || "Are you sure?"}</h3>
          <p className="text-sm text-muted-foreground mb-5">{state.description || "This action cannot be undone."}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { state.resolve?.(false); setState({ open: false }); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => { state.resolve?.(true); setState({ open: false }); }}>
              {state.confirmText || "Delete"}
            </Button>
          </div>
        </div>
      </div>
    );

  return { confirm, Dialog };
}
