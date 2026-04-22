export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RequesterRelation = 'MYSELF' | 'FAMILY' | 'FRIEND' | 'OTHER';

export type UrgencyLevel = 'IMMEDIATE' | 'TODAY' | 'SCHEDULED';

export type RequestStatus =
    | 'CREATED'
    | 'SEARCHING_FOR_DONORS'
    | 'DONOR_ACCEPTED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'EXPIRED';

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
    requester_relation?: RequesterRelation;
    urgency_level: UrgencyLevel | string | null;
    note?: string;
    status: RequestStatus | string;
    requester?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone_number'>;
    requester_id: number | string;
    assigned_donor?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone_number'> | null;
    created_at: string;
    updated_at?: string;
    donor_name?: string | null;
    donor_phone?: string | null;
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
