import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

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
	const [role, setRole] = useState<Role | null>(null);
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [isLoading, setIsLoading] = useState(true);

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
			// TODO: Fetch user role and permissions from API
			// For now, use mock data based on user email or fetch from user object

			// Mock: Assign role based on user (you can modify this logic)
			const mockRole: Role = "agent"; // Default role

			// In a real app, you would fetch this from your API:
			// const userData = await fetchUserData(user.id);
			// const userRole = userData.role;

			setRole(mockRole);
			setPermissions(rolePermissions[mockRole] || []);
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

