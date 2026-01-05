import { useGetLineOfBusinessForTeamMemberQuery } from "@/store/services/teamMembersApi";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

export type Role = "admin" | "supervisor" | "agent" | "qa" | "viewer";

export type Permission =
	| "view_dashboard"
	| "view_customers"
	| "create_customer"
	| "edit_customer"
	| "delete_customer"
	| "view_team_members"
	| "manage_team_members"
	| "view_reports"
	| "export_reports"
	| "view_disposition"
	| "create_disposition"
	| "edit_disposition"
	| "send_sms"
	| "manage_settings"
	| "view_all_data"
	| "manage_users";

type RolePermissions = {
	[key in Role]: Permission[];
};

// Define permissions for each role
const rolePermissions: RolePermissions = {
	admin: [
		"view_dashboard",
		"view_customers",
		"create_customer",
		"edit_customer",
		"delete_customer",
		"view_team_members",
		"manage_team_members",
		"view_reports",
		"export_reports",
		"view_disposition",
		"create_disposition",
		"edit_disposition",
		"send_sms",
		"manage_settings",
		"view_all_data",
		"manage_users",
	],
	supervisor: [
		"view_dashboard",
		"view_customers",
		"create_customer",
		"edit_customer",
		"view_team_members",
		"view_reports",
		"export_reports",
		"view_disposition",
		"create_disposition",
		"edit_disposition",
		"send_sms",
		"view_all_data",
	],
	agent: [
		"view_dashboard",
		"view_customers",
		"create_customer",
		"view_reports",
		"view_disposition",
		"create_disposition",
		"send_sms",
	],
	qa: [
		"view_dashboard",
		"view_customers",
		"view_team_members",
		"view_reports",
		"view_disposition",
		"edit_disposition",
	],
	viewer: [
		"view_dashboard",
		"view_customers",
		"view_reports",
		"view_disposition",
	],
};

type PrivilegeContextValue = {
	role: Role | null;
	permissions: Permission[];
	isLoading: boolean;
	hasPermission(permission: Permission): boolean;
	hasAnyPermission(permissions: Permission[]): boolean;
	hasAllPermissions(permissions: Permission[]): boolean;
	isRole(role: Role): boolean;
	isAnyRole(roles: Role[]): boolean;
	updateRole(role: Role): void;
	updatePermissions(permissions: Permission[]): void;
};

const defaultValue: PrivilegeContextValue = {
	role: null,
	permissions: [],
	isLoading: false,
	hasPermission: () => false,
	hasAnyPermission: () => false,
	hasAllPermissions: () => false,
	isRole: () => false,
	isAnyRole: () => false,
	updateRole: () => { },
	updatePermissions: () => { },
};

const PrivilegeContext = createContext<PrivilegeContextValue>(defaultValue);

export const usePrivilege = () => useContext(PrivilegeContext);

type PrivilegeProviderProps = {
	children: React.ReactNode;
};

export const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({
	children,
}) => {
	const { user } = useAuth();
	const { socket } = useSocket();
	const [role, setRole] = useState<Role | null>(null);
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch Line of Business ID for the current user
	const { data: lobData } = useGetLineOfBusinessForTeamMemberQuery(
		user?.id || "",
		{ skip: !user?.id }
	);

	// Listen for real-time role updates
	useEffect(() => {
		if (!socket || !user || !lobData?.lineOfBusiness?._id) return;

		const lineOfBusinessId = lobData.lineOfBusiness._id;

		// Join the Line of Business room
		socket.emit("joinLineOfBusiness", lineOfBusinessId);

		const handleRoleUpdated = (data: any) => {
			console.log("Role updated:", data);

			// Check if the update affects the CURRENT user
			if (user?.roleId === data.role._id) {
				console.log("Permissions updated for current user role");
				// Reload privileges to ensure we have the latest state
				// Ideally, we could directly update state from data.role.permissions
				// but for now, we'll just reload the derived privileges
				loadPrivileges();

				// Optional: Show a toast or alert if needed
				// Alert.alert("Permissions Updated", "Your role permissions have been updated.");
			}
		};

		socket.on("roleUpdated", handleRoleUpdated);

		const handleNotification = (notification: any) => {
			// Basic alert for now, can be replaced with a proper toast library
			if (notification?.message) {
				console.log("Notification received:", notification);
				// Alert.alert("Notification", notification.message);
			}
		};

		socket.on("notification", handleNotification);

		return () => {
			socket.off("roleUpdated", handleRoleUpdated);
			socket.off("notification", handleNotification);
		};
	}, [socket, user, lobData]);

	// Load privileges when user changes
	useEffect(() => {
		if (user) {
			loadPrivileges();
		} else {
			// Clear privileges when user logs out
			setRole(null);
			setPermissions([]);
			setIsLoading(false);
		}
	}, [user]);

	const loadPrivileges = async () => {
		try {
			setIsLoading(true);

			// Map roleName from user to Role type
			// Default to 'agent' if no role found
			let userRole: Role = "agent";

			if (user?.roleName) {
				const roleLower = user.roleName.toLowerCase();
				if (roleLower.includes("admin")) userRole = "admin";
				else if (roleLower.includes("supervisor")) userRole = "supervisor";
				else if (roleLower.includes("qa")) userRole = "qa";
				else if (roleLower.includes("viewer")) userRole = "viewer";
				else userRole = "agent";
			}

			setRole(userRole);
			setPermissions(rolePermissions[userRole] || []);
			setIsLoading(false);
		} catch (error) {
			console.error("Error loading privileges:", error);
			setRole(null);
			setPermissions([]);
			setIsLoading(false);
		}
	};

	const hasPermission = (permission: Permission): boolean => {
		return permissions.includes(permission);
	};

	const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
		return requiredPermissions.some((permission) =>
			permissions.includes(permission)
		);
	};

	const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
		return requiredPermissions.every((permission) =>
			permissions.includes(permission)
		);
	};

	const isRole = (checkRole: Role): boolean => {
		return role === checkRole;
	};

	const isAnyRole = (checkRoles: Role[]): boolean => {
		return role !== null && checkRoles.includes(role);
	};

	const updateRole = (newRole: Role) => {
		setRole(newRole);
		setPermissions(rolePermissions[newRole] || []);
	};

	const updatePermissions = (newPermissions: Permission[]) => {
		setPermissions(newPermissions);
	};

	const value: PrivilegeContextValue = {
		role,
		permissions,
		isLoading,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		isRole,
		isAnyRole,
		updateRole,
		updatePermissions,
	};

	return (
		<PrivilegeContext.Provider value={value}>
			{children}
		</PrivilegeContext.Provider>
	);
};

export default PrivilegeContext;

