"use client";

import { useGetLineOfBusinessQuery } from "@/store/services/lineOfBusinessApi";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface LineOfBusinessContextType {
  selectedLineOfBusinessId: string | null;
  setSelectedLineOfBusinessId: (id: string | null) => void;
  isLoading: boolean;
  lineOfBusinessData: any;
}

const LineOfBusinessContext = createContext<
  LineOfBusinessContextType | undefined
>(undefined);

interface LineOfBusinessProviderProps {
  children: ReactNode;
  initialLineOfBusinessId?: string;
}

export const LineOfBusinessProvider: React.FC<LineOfBusinessProviderProps> = ({
  children,
  initialLineOfBusinessId,
}) => {
  const [selectedLineOfBusinessId, setSelectedLineOfBusinessIdState] = useState<
    string | null
  >(initialLineOfBusinessId || null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedLineOfBusinessId");
    if (saved) {
      setSelectedLineOfBusinessIdState(saved);
    }
  }, []);

  const setSelectedLineOfBusinessId = (id: string | null) => {
    setSelectedLineOfBusinessIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("selectedLineOfBusinessId", id);
      } else {
        localStorage.removeItem("selectedLineOfBusinessId");
      }
    }
  };

  const {
    data: lineOfBusinessData,
    isLoading,
    isFetching,
  } = useGetLineOfBusinessQuery(selectedLineOfBusinessId || "", {
    skip: !selectedLineOfBusinessId || selectedLineOfBusinessId === "new",
  });

  return (
    <LineOfBusinessContext.Provider
      value={{
        selectedLineOfBusinessId,
        setSelectedLineOfBusinessId,
        isLoading: isLoading || isFetching,
        lineOfBusinessData,
      }}
    >
      {children}
    </LineOfBusinessContext.Provider>
  );
};

export const useLineOfBusiness = () => {
  const context = useContext(LineOfBusinessContext);
  if (context === undefined) {
    throw new Error(
      "useLineOfBusiness must be used within a LineOfBusinessProvider"
    );
  }
  return context;
};
