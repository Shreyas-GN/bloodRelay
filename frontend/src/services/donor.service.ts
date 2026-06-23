import { supabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class DonorService {
  /**
   * Fetches nearby donors using the PostGIS ST_DWithin helper function via RPC.
   *
   * @param reqLat - Search latitude
   * @param reqLng - Search longitude
   * @param radiusKm - Radius in Kilometers limits the search
   * @param reqBloodGroup - Blood group required
   * @returns Array of nearby donors sorted by distance
   */
  static async getNearbyDonors(reqLat: number, reqLng: number, radiusKm: number, reqBloodGroup: string, supabase = supabaseClient) {
    const { data, error } = await (supabase as any).rpc('find_nearby_donors_v2', {
      req_lat: reqLat,
      req_lng: reqLng,
      radius_km: radiusKm,
      req_blood_group: reqBloodGroup,
    })

    if (error) {
      throw new Error(`Failed to fetch nearby donors: ${error.message}`)
    }

    return data
  }

  /**
   * Fetches a specific donor's profile by their authenticating User ID.
   */
  static async getProfile(userId: string) {
    const { data, error } = await (supabaseClient as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
       throw new Error(`Failed to fetch profile: ${error.message}`)
    }
    
    return data
  }

  static async createProfile(profileData: ProfileInsert) {
    const { data, error } = await (supabaseClient as any)
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to create profile: ${error.message}`)
    }
    
    return data
  }

  static async updateProfile(userId: string, profileData: ProfileUpdate, supabase = supabaseClient) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .upsert({ id: userId, ...profileData })
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to update profile: ${error.message}`)
    }
    
    return data
  }

  /**
   * Submits a donor response to a blood request
   */
  static async submitDonorResponse(
    requestId: string, 
    donorId: string, 
    status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED' = 'ACCEPTED',
    distanceMeters?: number | null,
    etaMinutes?: number | null
  ) {
    const { data, error } = await (supabaseClient as any)
      .from('donor_responses')
      .upsert({ 
        request_id: requestId, 
        donor_id: donorId,
        status: status,
        distance_meters: distanceMeters,
        eta_minutes: etaMinutes,
        responded_at: new Date().toISOString()
      }, { onConflict: 'request_id,donor_id' })
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to submit donor response: ${error.message}`)
    }
    
    // Increment confirmed_count in blood_requests
    try {
        await (supabaseClient as any).rpc('increment_confirmed_count', { req_id: requestId });
    } catch (e) {
        console.error("Failed to increment confirmed count", e);
    }
    
    return data
  }

  /**
   * Gets all donor responses for a specific request
   */
  static async getResponsesForRequest(requestId: string) {
    const { data, error } = await (supabaseClient as any)
      .from('donor_responses')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('request_id', requestId)

    if (error) {
       throw new Error(`Failed to fetch donor responses: ${error.message}`)
    }
    
    return data
  }

  /**
   * Gets all donor responses for a specific donor
   */
  static async getResponsesForDonor(donorId: string) {
    const { data, error } = await (supabaseClient as any)
      .from('donor_responses')
      .select('request_id, status')
      .eq('donor_id', donorId)

    if (error) {
       throw new Error(`Failed to fetch donor responses: ${error.message}`)
    }
    
    return data
  }

  /**
   * Updates the status of a donor response (e.g., ACCEPTED -> CONFIRMED -> ARRIVED)
   */
  static async updateResponseStatus(requestId: string, donorId: string, status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED') {
    const { data, error } = await (supabaseClient as any)
      .from('donor_responses')
      .update({ status })
      .match({ request_id: requestId, donor_id: donorId })
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to update donor response status: ${error.message}`)
    }
    
    return data
  }

  /**
   * Cancels a donor response
   */
  static async cancelResponse(requestId: string, donorId: string) {
    return this.updateResponseStatus(requestId, donorId, 'CANCELLED')
  }
}
