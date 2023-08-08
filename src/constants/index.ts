export const filterStatusOptions = [
    {
        label: 'Active',
        value: 1,
    },
    {
        label: 'Inactive',
        value: 0,
    },
] as const;

export const filterTypeOptions = [
    {
        label: 'Dev',
        value: 'dev',
    },
    {
        label: 'Production',
        value: 'production',
    },
] as const;

export const filterRoleOptions = [
    {
        label: 'Admin',
        value: 'admin',
    },
    {
        label: 'Manager',
        value: 'manager',
    },
    {
        label: 'User',
        value: 'user',
    },
] as const;

export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
} as const;