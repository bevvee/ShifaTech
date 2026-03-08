import { createReducer, on } from '@ngrx/store';
import { loginSuccess, logout, loadToken, JwtPayload, loadProfileSuccess } from './auth.actions';

export interface AuthState {
    token: string | null;
    user: JwtPayload | null;
    profile: any | null;
    isAuthenticated: boolean;
}

export const initialState: AuthState = {
    token: null,
    user: null,
    profile: null,
    isAuthenticated: false,
};

export const authReducer = createReducer(
    initialState,
    on(loginSuccess, (state, { token, payload }) => ({
        ...state,
        token,
        user: payload,
        isAuthenticated: true,
    })),
    on(loadToken, (state, { token, payload }) => ({
        ...state,
        token,
        user: payload,
        isAuthenticated: true,
    })),
    on(loadProfileSuccess, (state, { profile }) => ({
        ...state,
        profile,
    })),
    on(logout, () => ({
        ...initialState,
    }))
);
