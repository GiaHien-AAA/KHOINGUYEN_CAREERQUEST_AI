import type {
  StoredGender,
  StoredUserType,
} from '../services/accountStore';

export type UserType = StoredUserType;
export type UserGender = StoredGender;

export interface PlayerProfile {
  userId?: string;
  fullName: string;
  email: string;
  userType: UserType;
  gender: UserGender;
}
