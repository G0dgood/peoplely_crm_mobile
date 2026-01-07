
import { useAuth } from "@/contexts/AuthContext";
import { useGetLineOfBusinessQuery } from "@/store/services/lineOfBusinessApi";
import { useGetLineOfBusinessForTeamMemberQuery } from "@/store/services/teamMembersApi";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect
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
  const { user } = useAuth();
  const [selectedLineOfBusinessId, setSelectedLineOfBusinessId] = React.useState<string | null>(
    user?.lineOfBusinessId || initialLineOfBusinessId || null
  );

  // Fetch LOB(s) for the team member if no LOB is selected
  const { data: teamMemberLobData } = useGetLineOfBusinessForTeamMemberQuery(user?.lineOfBusinessId || "", {
    skip: !user?.lineOfBusinessId || !!user?.lineOfBusinessId,
  });

  // Automatically select LOB if available and none selected
  useEffect(() => {
    // Handle if response is array or single object
    // const lob = Array.isArray(teamMemberLobData) ? teamMemberLobData[0] : teamMemberLobData;
    // const lobId = lob?._id || lob?.id;

    if (user?.lineOfBusinessId) {
      setSelectedLineOfBusinessId(user?.lineOfBusinessId);
    }
  }, [user?.lineOfBusinessId]);

  const {
    data: lineOfBusinessData,
    isLoading,
    isFetching,
  } = useGetLineOfBusinessQuery(user?.lineOfBusinessId || "", {
    skip: !user?.lineOfBusinessId || user?.lineOfBusinessId === "new",
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
