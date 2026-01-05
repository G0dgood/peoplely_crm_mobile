import { useAuth } from "@/contexts/AuthContext";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import { useSocket } from "@/contexts/SocketContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ModuleId =
  | "dashboard"
  | "customerBook"
  | "setupBook"
  | "customerSMS"
  | "report"
  | "teamMembers"
  | "systemSetting";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface RoleModulePermission {
  id: string;
  moduleName: string;
  access: boolean;
  permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    create: boolean;
  };
}

export interface UserRole {
  roleName: string;
  permissions: RoleModulePermission[];
  id?: string;
  description?: string;
}

export interface UserPrivileges {
  userId: string;
  roleId: string;
  role: UserRole | null;
}

interface PrivilegeContextType {
  userPrivileges: UserPrivileges | null;
  isLoading: boolean;
  hasPermission: (moduleId: ModuleId) => boolean;
  hasAnyPermission: (moduleIds: ModuleId[]) => boolean;
  hasAllPermissions: (moduleIds: ModuleId[]) => boolean;
  canAccess: (moduleId: ModuleId, action?: PermissionAction) => boolean;
  setUserPrivileges: (privileges: UserPrivileges) => void;
  clearPrivileges: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const PrivilegeContext = createContext<PrivilegeContextType | undefined>(undefined);

interface PrivilegeProviderProps {
  children: React.ReactNode;
  initialPrivileges?: UserPrivileges;
}

export const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({
  children,
  initialPrivileges,
}) => {
  const [userPrivileges, setUserPrivilegesState] = useState<UserPrivileges | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();
  const { selectedLineOfBusinessId } = useLineOfBusiness();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("userPrivileges");
        if (stored) {
          setUserPrivilegesState(JSON.parse(stored));
        } else if (initialPrivileges) {
          setUserPrivilegesState(initialPrivileges);
        } else {
          setUserPrivilegesState(null);
        }
      } catch {
        if (initialPrivileges) {
          setUserPrivilegesState(initialPrivileges);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [initialPrivileges, user]);

  useEffect(() => {
    const save = async () => {
      if (userPrivileges) {
        try {
          await AsyncStorage.setItem("userPrivileges", JSON.stringify(userPrivileges));
        } catch { }
      }
    };
    save();
  }, [userPrivileges]);

  useEffect(() => {
    if (!socket || !selectedLineOfBusinessId) return;
    socket.emit("joinLineOfBusiness", selectedLineOfBusinessId);
    const handleUpdateRole = (data: any) => {
      if (!userPrivileges || !userPrivileges.role) return;
      const currentRoleId =
        userPrivileges.roleId ||
        (userPrivileges.role as any).id ||
        (userPrivileges.role as any)._id;
      const updatedRoleId = data.role._id || data.role.id;
      if (
        userPrivileges.role.roleName === data.role.roleName ||
        (currentRoleId && updatedRoleId && currentRoleId === updatedRoleId)
      ) {
        const updatedUserPrivileges: UserPrivileges = {
          ...userPrivileges,
          role: {
            ...(userPrivileges.role as UserRole),
            permissions: data.role.permissions,
          },
        };
        setUserPrivilegesState(updatedUserPrivileges);

        AsyncStorage.setItem(
          "userPrivileges",
          JSON.stringify(updatedUserPrivileges)
        ).catch(() => { });
        AsyncStorage.getItem("peoplely-user")
          .then((storedUser) => {
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.role && typeof parsedUser.role === "object") {
                parsedUser.role.permissions = data.role.permissions;
                AsyncStorage.setItem(
                  "peoplely-user",
                  JSON.stringify(parsedUser)
                ).catch(() => { });
              }
            }
          })
          .catch(() => { });
      }
    };
    socket.on("updateRole", handleUpdateRole);
    return () => {
      socket.off("updateRole", handleUpdateRole);
    };
  }, [socket, selectedLineOfBusinessId, userPrivileges, user, updateUser]);

  const findModulePermission = (moduleId: string): RoleModulePermission | undefined => {
    if (!userPrivileges?.role?.permissions) return undefined;
    const normalize = (str?: string) => (str ?? "").replace(/\s+/g, "").toLowerCase();
    const target = normalize(moduleId);
    return userPrivileges.role.permissions.find(
      (p) => normalize(p.moduleName) === target
    );
  };

  const hasPermission = (moduleId: ModuleId): boolean => {
    if (!userPrivileges) return false;
    if (
      userPrivileges.role?.roleName === "Administrator" ||
      userPrivileges.role?.roleName === "admin" ||
      userPrivileges.roleId === "administrator"
    ) {
      return true;
    }
    const modulePermission = findModulePermission(moduleId);
    if (modulePermission) {
      return modulePermission.access;
    }
    return false;
  };

  const hasAnyPermission = (moduleIds: ModuleId[]): boolean => {
    return moduleIds.some((moduleId) => hasPermission(moduleId));
  };

  const hasAllPermissions = (moduleIds: ModuleId[]): boolean => {
    return moduleIds.every((moduleId) => hasPermission(moduleId));
  };

  const canAccess = (moduleId: ModuleId, action?: PermissionAction): boolean => {
    if (!userPrivileges) return false;
    if (
      userPrivileges.role?.roleName === "Administrator" ||
      userPrivileges.role?.roleName === "admin" ||
      userPrivileges.roleId === "administrator"
    ) {
      return true;
    }
    const modulePermission = findModulePermission(moduleId);
    if (modulePermission) {
      if (!modulePermission.access) return false;
      if (!action) return true;
      if (action === "view" || action === "create" || action === "edit" || action === "delete") {
        return modulePermission.permissions[action];
      }
      return false;
    }
    return false;
  };

  const setUserPrivileges = (privileges: UserPrivileges) => {
    setUserPrivilegesState(privileges);
  };

  const clearPrivileges = () => {
    setUserPrivilegesState(null);
    AsyncStorage.removeItem("userPrivileges").catch(() => { });
  };

  const isAdmin = useMemo(() => {
    if (!userPrivileges) return false;
    return (
      userPrivileges.role?.roleName === "Administrator" ||
      userPrivileges.role?.roleName === "admin" ||
      userPrivileges.roleId === "administrator"
    );
  }, [userPrivileges]);

  const isSuperAdmin = useMemo(() => {
    if (!userPrivileges) return false;
    const roleName = userPrivileges.role?.roleName || "";
    return roleName.toLowerCase() === "super admin";
  }, [userPrivileges]);

  const contextValue: PrivilegeContextType = {
    userPrivileges,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    setUserPrivileges,
    clearPrivileges,
    isAdmin,
    isSuperAdmin,
  };

  return <PrivilegeContext.Provider value={contextValue}>{children}</PrivilegeContext.Provider>;
};

export const usePrivilege = () => {
  const context = useContext(PrivilegeContext);
  if (context === undefined) {
    throw new Error("usePrivilege must be used within a PrivilegeProvider");
  }
  return context;
};

export default PrivilegeContext;
