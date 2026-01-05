
import { useGetLineOfBusinessQuery } from "@/store/services/lineOfBusinessApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    const load = async () => {
      const saved = await AsyncStorage.getItem("selectedLineOfBusinessId");
      if (saved) {
        setSelectedLineOfBusinessIdState(saved);
      }
    };
    load();
  }, []);

  const setSelectedLineOfBusinessId = (id: string | null) => {
    setSelectedLineOfBusinessIdState(id);
    if (id) {
      AsyncStorage.setItem("selectedLineOfBusinessId", id).catch(() => { });
    } else {
      AsyncStorage.removeItem("selectedLineOfBusinessId").catch(() => { });
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
