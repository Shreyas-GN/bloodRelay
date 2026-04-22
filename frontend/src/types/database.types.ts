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
          status: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED'
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
          status?: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED'
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
          status?: 'open' | 'fulfilled' | 'cancelled' | 'DONOR_ACCEPTED' | 'SEARCHING_FOR_DONORS' | 'CREATED'
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
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          donor_id: string
          status?: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          donor_id?: string
          status?: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED'
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
    }
  }
}
