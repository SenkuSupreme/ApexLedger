"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

interface Portfolio {
  _id: string;
  name: string;
  [key: string]: any;
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  loading: boolean;
  selectedPortfolioId: string;
  setSelectedPortfolioId: (id: string) => void;
  refreshPortfolios: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("all");

  const refreshPortfolios = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      setLoading(true);
      const res = await fetch("/api/portfolios");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch portfolios:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshPortfolios();
    } else if (status === "unauthenticated") {
      setPortfolios([]);
      setLoading(false);
    }
  }, [status, refreshPortfolios]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        loading,
        selectedPortfolioId,
        setSelectedPortfolioId,
        refreshPortfolios,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolios() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolios must be used within a PortfolioProvider");
  }
  return context;
}
