import { createAction, props } from '@ngrx/store';
import { Role } from '../../models/role.enum';

export interface JwtPayload {
    sub?: string | number;
    id?: string | number;
    userId?: string | number;
    nom?: string;
    prenom?: string;
    email?: string;
    role?: Role | string;
    roles?: Array<Role | string>;
    exp?: number;
    iat?: number;
    [key: string]: any;
}

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ token: string; payload: JwtPayload }>()
);

export const logout = createAction('[Auth] Logout');

export const loadToken = createAction(
    '[Auth] Load Token',
    props<{ token: string; payload: JwtPayload }>()
);

export const loadProfileSuccess = createAction(
    '[Auth] Load Profile Success',
    props<{ profile: any }>()
);
