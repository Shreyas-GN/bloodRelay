import type { BloodGroup, RequestStatus, UrgencyLevel, NotificationType, NotificationReadStatus, ActivityEventType } from './database.types'

export type { BloodGroup, RequestStatus, UrgencyLevel, NotificationType, NotificationReadStatus, ActivityEventType }

export type RequesterRelation = 'MYSELF' | 'FAMILY' | 'FRIEND' | 'OTHER'
export type EscalationPhase = 1 | 2 | 3

export interface User {
    id: string
    username?: string
    email?: string
    first_name?: string
    last_name?: string
    full_name?: string
    phone?: string | null
    blood_group: BloodGroup | null | ''
    city: string | null
    profile_completed?: boolean
    location?: string | null
    latitude: number | null
    longitude: number | null
    is_donor?: boolean
    is_available_donor: boolean
    last_donation_date: string | null
    cooldown_until?: string | null
    is_verified?: boolean
    fcm_token?: string | null
    created_at?: string
}

export interface BloodRequest {
    id: string
    requester_id: string
    blood_group: BloodGroup | string
    units: number
    patient_name: string | null
    hospital_name: string
    city: string | null
    contact_phone: string | null
    urgency_level: UrgencyLevel | string | null
    note?: string | null
    requester_relation?: string | null
    status: RequestStatus | string
    notified_count?: number
    confirmed_count?: number
    escalation_phase?: number
    donor_name?: string | null
    donor_phone?: string | null
    location?: string | null
    latitude?: number | null
    longitude?: number | null
    created_at: string
}

export interface DonorResponse {
    id: string
    request_id: string
    donor_id: string
    status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
    distance_meters?: number | null
    eta_minutes?: number | null
    responded_at?: string | null
    created_at: string
    profiles?: any
}

export interface NotificationLog {
    id: string
    request_id: string
    donor_id?: string | null
    channel: 'PUSH' | 'SMS' | 'WHATSAPP'
    status: 'SENT' | 'DELIVERED' | 'FAILED'
    metadata?: any
    created_at: string
}

export interface Notification {
    id: string
    user_id: string
    request_id: string | null
    title: string
    message: string
    type: NotificationType
    status: NotificationReadStatus
    sent_at: string
    read_at: string | null
}

export interface BloodBank {
    id: string
    name: string
    address?: string | null
    city?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    location?: string | null
    operating_hours?: string | null
    created_at: string
}

export interface ApiError {
    error?: string
    message?: string
    detail?: string
}
