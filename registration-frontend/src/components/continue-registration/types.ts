import { AvatarType } from "../../enum/AvatarType";

export interface UserRequest {
    firstName: string;
    lastName: string;
    phone: string;
    avatarType: AvatarType;
    priceId?: string;
    submit?: string;
}

export interface ContinueRegistrationPageData {
    email: string;
    companyName: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarType: AvatarType;
}

export interface ApiResponse {
    timestamp: string;
    status: number;
    message: string;
    data: Record<string, unknown>;
}

export interface SetupIntentResponse {
    clientSecret: string;
}

export type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error';