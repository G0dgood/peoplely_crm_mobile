
import { useAuth } from "@/contexts/AuthContext";
import { useGetCampaignQuery } from "@/store/services/campaignApi";
import { useGetCampaignForTeamMemberQuery } from "@/store/services/teamMembersApi";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect
} from "react";

interface CampaignContextType {
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  isLoading: boolean;
  campaignData: any;
}

const CampaignContext = createContext<
  CampaignContextType | undefined
>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  initialCampaignId?: string;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({
  children,
  initialCampaignId,
}) => {
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(
    user?.campaignId || initialCampaignId || null
  );

  // Fetch Campaign(s) for the team member if no Campaign is selected
  const { data: teamMemberCampaignData } = useGetCampaignForTeamMemberQuery(user?.campaignId || "", {
    skip: !user?.campaignId || !!user?.campaignId,
  });

  // Automatically select Campaign if available and none selected
  useEffect(() => {
    // Handle if response is array or single object
    // const campaign = Array.isArray(teamMemberCampaignData) ? teamMemberCampaignData[0] : teamMemberCampaignData;
    // const campaignId = campaign?._id || campaign?.id;

    if (user?.campaignId) {
      setSelectedCampaignId(user?.campaignId);
    }
  }, [user?.campaignId]);

  const {
    data: campaignData,
    isLoading,
    isFetching,
  } = useGetCampaignQuery(user?.campaignId || "", {
    skip: !user?.campaignId || user?.campaignId === "new",
  });


  return (
    <CampaignContext.Provider
      value={{
        selectedCampaignId,
        setSelectedCampaignId,
        isLoading: isLoading || isFetching,
        campaignData,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error(
      "useCampaign must be used within a CampaignProvider"
    );
  }
  return context;
};
