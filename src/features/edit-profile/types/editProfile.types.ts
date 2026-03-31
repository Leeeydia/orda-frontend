// src/features/edit-profile/types/editProfile.types.ts

export interface SettingsProfile {
  userId: number;
  email: string;
  nickname: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  profileImageUrl: string | null;
}

export interface UpdateProfileRequest {
  nickname?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}