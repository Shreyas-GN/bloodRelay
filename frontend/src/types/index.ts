export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RequesterRelation = 'MYSELF' | 'FAMILY' | 'FRIEND' | 'OTHER';

export type UrgencyLevel = 'IMMEDIATE' | 'TODAY' | 'SCHEDULED';

export type RequestStatus =
    | 'CREATED'
    | 'SEARCHING'
    | 'ACCEPTED'
    | 'CONFIRMED'
    | 'ARRIVING'
    | 'FULFILLED'
    | 'CANCELLED'
    | 'EXPIRED';

export type EscalationPhase = 1 | 2 | 3;

export type NotificationType =
    | 'DONOR_MATCH'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_COMPLETED'
    | 'REQUEST_CANCELLED'
    | 'DONOR_NEEDED';

export interface User {
    id: number | string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    phone_number: string;
    phone?: string;
    blood_group: BloodGroup | string | '';
    city: string;
    location?: string;
    latitude: number | null;
    longitude: number | null;
    is_available_donor: boolean;
    last_donation_date: string | null;
    cooldown_until?: string | null;
    is_verified?: boolean;
    fcm_token?: string | null;
}

export interface BloodRequest {
    id: number | string;
    blood_group: BloodGroup | string;
    units: number;
    patient_name: string | null;
    hospital_name: string;
    hospital_latitude?: number;
    hospital_longitude?: number;
    city: string | null;
    contact_phone: string | null;
    requester_phone?: string | null;
    requester_relation?: RequesterRelation;
    urgency_level: UrgencyLevel | string | null;
    note?: string;
    status: RequestStatus | string;
    requester?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone_number'>;
    requester_id: number | string;
    assigned_donor?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone_number'> | null;
    notified_count?: number;
    confirmed_count?: number;
    escalation_phase?: number;
    expires_at?: string | null;
    created_at: string;
    updated_at?: string;
    donor_name?: string | null;
    donor_phone?: string | null;
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
    requester_name?: string | null;
    metadata?: {
        relation?: string;
        is_anonymous?: boolean;
    } | any;
}

export interface DonorResponse {
    id: string | number;
    request_id: string | number;
    donor_id: string | number;
    status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED';
    distance_meters?: number | null;
    responded_at?: string | null;
    eta_minutes?: number | null;
    created_at: string;
    profiles?: any;
}

export interface NotificationLog {
    id: string | number;
    request_id: string | number;
    donor_id?: string | number | null;
    channel: 'PUSH' | 'SMS' | 'WHATSAPP';
    status: 'SENT' | 'DELIVERED' | 'FAILED';
    created_at: string;
    metadata?: any;
}

export interface BloodBank {
    id: string | number;
    name: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    operating_hours?: string | null;
    website?: string | null;
    created_at: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    related_request: Pick<BloodRequest, 'id'> | null;
    is_read: boolean;
    created_at: string;
}

export interface ApiError {
    error?: string;
    message?: string;
    detail?: string;
}
