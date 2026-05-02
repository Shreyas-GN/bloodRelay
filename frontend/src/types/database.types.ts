export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          blood_group: string
          is_donor: boolean
          is_available_donor: boolean
          location: string | null
          latitude: number | null
          longitude: number | null
          last_donation_date: string | null
          cooldown_until: string | null
          is_verified: boolean
          fcm_token: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          blood_group: string
          is_donor?: boolean
          is_available_donor?: boolean
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          last_donation_date?: string | null
          cooldown_until?: string | null
          is_verified?: boolean
          fcm_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          blood_group?: string
          is_donor?: boolean
          is_available_donor?: boolean
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          last_donation_date?: string | null
          cooldown_until?: string | null
          is_verified?: boolean
          fcm_token?: string | null
          created_at?: string
        }
      }
      blood_requests: {
        Row: {
          id: string
          requester_id: string
          blood_group: string
          units: number
          patient_name: string | null
          hospital_name: string
          city: string | null
          contact_phone: string | null
          urgency_level: string | null
          location: string
          latitude: number | null
          longitude: number | null
          requester_phone: string | null
          notified_count: number
          confirmed_count: number
          escalation_phase: number
          expires_at: string | null
          status: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED' | 'SEARCHING' | 'ACCEPTED' | 'CONFIRMED' | 'ARRIVING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED'
          created_at: string
          donor_name: string | null
          donor_phone: string | null
          note: string | null
          requester_relation: string | null
        }
        Insert: {
          id?: string
          requester_id: string
          blood_group: string
          units?: number
          patient_name?: string | null
          hospital_name: string
          city?: string | null
          contact_phone?: string | null
          urgency_level?: string | null
          location: string
          latitude?: number | null
          longitude?: number | null
          requester_phone?: string | null
          notified_count?: number
          confirmed_count?: number
          escalation_phase?: number
          expires_at?: string | null
          status?: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED' | 'SEARCHING' | 'ACCEPTED' | 'CONFIRMED' | 'ARRIVING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED'
          created_at?: string
          donor_name?: string | null
          donor_phone?: string | null
          note?: string | null
          requester_relation?: string | null
        }
        Update: {
          id?: string
          requester_id?: string
          blood_group?: string
          units?: number
          patient_name?: string | null
          hospital_name?: string
          city?: string | null
          contact_phone?: string | null
          urgency_level?: string | null
          location?: string
          latitude?: number | null
          longitude?: number | null
          requester_phone?: string | null
          notified_count?: number
          confirmed_count?: number
          escalation_phase?: number
          expires_at?: string | null
          status?: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED' | 'SEARCHING' | 'ACCEPTED' | 'CONFIRMED' | 'ARRIVING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED'
          created_at?: string
          donor_name?: string | null
          donor_phone?: string | null
          note?: string | null
          requester_relation?: string | null
        }
      }
      donor_responses: {
        Row: {
          id: string
          request_id: string
          donor_id: string
          status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
          distance_meters: number | null
          responded_at: string | null
          eta_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          donor_id: string
          status?: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
          distance_meters?: number | null
          responded_at?: string | null
          eta_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          donor_id?: string
          status?: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
          distance_meters?: number | null
          responded_at?: string | null
          eta_minutes?: number | null
          created_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          request_id: string
          donor_id: string | null
          channel: 'PUSH' | 'SMS' | 'WHATSAPP' | null
          status: 'SENT' | 'DELIVERED' | 'FAILED' | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          request_id: string
          donor_id?: string | null
          channel?: 'PUSH' | 'SMS' | 'WHATSAPP' | null
          status?: 'SENT' | 'DELIVERED' | 'FAILED' | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          request_id?: string
          donor_id?: string | null
          channel?: 'PUSH' | 'SMS' | 'WHATSAPP' | null
          status?: 'SENT' | 'DELIVERED' | 'FAILED' | null
          created_at?: string
          metadata?: Json | null
        }
      }
      blood_banks: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          phone: string | null
          latitude: number | null
          longitude: number | null
          operating_hours: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          phone?: string | null
          latitude?: number | null
          longitude?: number | null
          operating_hours?: string | null
          website?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          phone?: string | null
          latitude?: number | null
          longitude?: number | null
          operating_hours?: string | null
          website?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      find_nearby_donors: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: {
          id: string
          full_name: string
          phone: string | null
          blood_group: string
          distance_meters: number
        }[]
      }
      find_nearby_donors_v2: {
        Args: {
          req_lat: number
          req_lng: number
          radius_km: number
          req_blood_group: string
        }
        Returns: {
          id: string
          full_name: string
          phone: string | null
          blood_group: string
          fcm_token: string | null
          distance_meters: number
        }[]
      }
    }
  }
}
