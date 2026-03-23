import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Role } from '../../models/role.enum';

function normalizeRole(value: unknown): Role | null {
    if (value == null) return null;

    let role = String(value).trim().toUpperCase();
    if (!role) return null;

    if (role.startsWith('ROLE_')) {
        role = role.slice('ROLE_'.length);
    }

    // Common alternate spellings from some backends
    if (role === 'DOCTOR') return Role.DOCTEUR;
    if (role === 'NURSE') return Role.INFIRMIER;
    if (role === 'SECRETARY') return Role.SECRETAIRE;

    if ((Object.values(Role) as string[]).includes(role)) {
        return role as Role;
    }

    return null;
}

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthToken = createSelector(
    selectAuthState,
    (state) => state.token
);

export const selectAuthUser = createSelector(
    selectAuthState,
    (state) => state.user
);

export const selectUserProfile = createSelector(
    selectAuthState,
    (state) => state.profile
);

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state) => state.isAuthenticated
);

export const selectUserRole = createSelector(
    selectAuthUser,
    (user): Role | null => {
        if (!user) return null;
        const singleRole = normalizeRole(user.role);
        if (singleRole) return singleRole;

        if (Array.isArray(user.roles)) {
            for (const r of user.roles) {
                const normalized = normalizeRole(r);
                if (normalized) return normalized;
            }
        }

        return null;
    }
);
