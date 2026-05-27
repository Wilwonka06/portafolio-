import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, CloudOff, RefreshCw, CheckCircle, Wifi, WifiOff } from "lucide-react";

interface SyncIndicatorProps {
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (value: boolean) => void;
  syncStatus: "synced" | "syncing" | "offline-pending";
  setSyncStatus: (status: "synced" | "syncing" | "offline-pending") => void;
  lastSyncedTime: Date | null;
}

export default function SyncIndicator({
  isSimulatedOffline,
  setIsSimulatedOffline,
  syncStatus,
  setSyncStatus,
  lastSyncedTime
}: SyncIndicatorProps) {
  const [realOnline, setRealOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);

  // Monitor real network online/offline events
  useEffect(() => {
    const handleOnline = () => setRealOnline(true);
    const handleOffline = () => setRealOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isActuallyOffline = !realOnline || isSimulatedOffline;

  // Whenever offline status changes
  useEffect(() => {
    if (isActuallyOffline) {
      setSyncStatus("offline-pending");
    } else {
      // Simulate sync transition from pending to synced
      if (syncStatus === "offline-pending") {
        setSyncStatus("syncing");
        const timer = setTimeout(() => {
          setSyncStatus("synced");
        }, 1500); // 1.5 seconds simulated synced
        return () => clearTimeout(timer);
      }
    }
  }, [isActuallyOffline]);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl transition-colors">
      {/* Network Status Dot */}
      <div className="flex items-center gap-2">
        <div className={`relative flex h-3 w-3`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isActuallyOffline ? "bg-amber-400" : "bg-emerald-400"} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isActuallyOffline ? "bg-amber-500" : "bg-emerald-500"}`}></span>
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
          {isActuallyOffline ? "Modo Offline" : "Conectado"}
        </span>
      </div>

      <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block"></div>

      {/* Sync Status Label */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
        {syncStatus === "synced" && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle id="icon-synced" className="h-4 w-4" />
            Sincronizado con GCP/Firebase
          </span>
        )}
        {syncStatus === "syncing" && (
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
            <RefreshCw id="icon-syncing" className="h-4 w-4 animate-spin" />
            Sincronizando cambios...
          </span>
        )}
        {syncStatus === "offline-pending" && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <CloudOff id="icon-offline" className="h-4 w-4" />
            Sincronización pendiente (Local)
          </span>
        )}
      </div>

      {lastSyncedTime && syncStatus === "synced" && (
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 select-none hidden md:inline">
          Ref: {lastSyncedTime.toLocaleTimeString()}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Recruiter / Evaluator Tooltip/Action */}
        <button
          id="btn-simulate-offline"
          onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
            isSimulatedOffline
              ? "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700"
          }`}
          title="Prueba cómo responde la app y el CV editable al perder conexión de red simulada"
        >
          {isSimulatedOffline ? (
            <>
              <Wifi className="h-3.4 w-3.4" />
              Restaurar Red
            </>
          ) : (
            <>
              <WifiOff className="h-3.4 w-3.4" />
              Simular Sin Conexión
            </>
          )}
        </button>
      </div>
    </div>
  );
}
