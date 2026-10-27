"use client";

import { useEffect, useState } from "react";
import { fetchHealth, HealthResponse } from "@/lib/api";

type HealthState =
  | { state: "loading" }
  | { state: "success"; data: HealthResponse }
  | { state: "error"; message: string };

export default function HomePage() {
  const [health, setHealth] = useState<HealthState>({ state: "loading" });

  const loadHealth = async () => {
    setHealth({ state: "loading" });
    try {
      const data = await fetchHealth();
      setHealth({ state: "success", data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to backend service";
      setHealth({ state: "error", message });
    }
  };

  useEffect(() => {
    let isCancelled = false;

    fetchHealth()
      .then((data) => {
        if (!isCancelled) {
          setHealth({ state: "success", data });
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to connect to backend service";
          setHealth({ state: "error", message });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Praxis
          </h1>
          <p className="text-sm text-slate-500">
            Commercial Building Energy Analytics Platform
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">System Status</span>
            <button
              onClick={loadHealth}
              disabled={health.state === "loading"}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition cursor-pointer"
            >
              {health.state === "loading" ? "Checking..." : "Recheck"}
            </button>
          </div>

          <div className="rounded-lg p-4 border bg-slate-50 border-slate-200">
            {health.state === "loading" && (
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium">Checking system health...</span>
              </div>
            )}

            {health.state === "success" && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      health.data.status === "ok" && health.data.database === "up"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-base font-semibold text-slate-800">
                    API: {health.data.status} / Database: {health.data.database}
                  </span>
                </div>
                <div className="text-xs text-slate-500 grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <span className="block font-medium text-slate-400">API Status</span>
                    <span className="font-mono text-slate-700">{health.data.status}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Database Status</span>
                    <span className="font-mono text-slate-700">{health.data.database}</span>
                  </div>
                </div>
              </div>
            )}

            {health.state === "error" && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-base font-semibold text-rose-700">
                    System Unavailable
                  </span>
                </div>
                <p className="text-xs text-rose-600 mt-1">
                  API: unreachable / Database: unknown
                </p>
                <p className="text-xs text-slate-500 mt-2 font-mono bg-white p-2 rounded border border-slate-200">
                  {health.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400">
            Slice 1: Walking Skeleton Architecture
          </span>
        </div>
      </div>
    </main>
  );
}
