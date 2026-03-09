import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Role } from '../../models/role.enum';

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
        if (user.role) return user.role as Role;
        if (Array.isArray(user.roles) && user.roles.length > 0) {
            return user.roles[0] as Role;
        }
        return null;
    }
);
