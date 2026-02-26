import { UserDto } from './user.model';

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}
