import { supabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type RequestInsert = Database['public']['Tables']['blood_requests']['Insert']
type RequestUpdate = Database['public']['Tables']['blood_requests']['Update']

// Cast to any throughout — the supabase-js generated schema does not match
// our hand-crafted Database interface, which causes 'never' type collisions.
const db = supabaseClient as any

export class RequestService {
  /**
   * Creates a new emergency blood donation request.
   */
  static async createRequest(requestData: RequestInsert) {
    const { data, error } = await db
      .from('blood_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to create request: ${error.message}`)
    }
    
    return data
  }

  /**
   * Retrieves all requests across the platform ordered by recency.
   */
  static async getActiveRequests() {
    const { data, error } = await db
      .from('blood_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
       throw new Error(`Failed to fetch active requests: ${error.message}`)
    }
    return data
  }

  /**
   * Retrieves a specific request by ID.
   */
  static async getRequestById(requestId: string) {
    const { data, error } = await db
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) {
       throw new Error(`Failed to fetch request: ${error.message}`)
    }
    
    return data
  }

  /**
   * Retrieves requests submitted by a specific user.
   */
  static async getUserRequests(userId: string) {
    const { data, error } = await db
      .from('blood_requests')
      .select('*')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
       throw new Error(`Failed to fetch requests for user: ${error.message}`)
    }
    
    return data
  }

  /**
   * Updates an existing request status (e.g. mark as fulfilled/cancelled).
   */
  static async updateRequest(requestId: string, updateData: RequestUpdate) {
    const { data, error } = await db
      .from('blood_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to update request: ${error.message}`)
    }
    
    return data
  }
  
  /**
   * Deletes an existing request. Requires proper RLS permissions matching the requester.
   */
  static async deleteRequest(requestId: string) {
    const { error } = await db
      .from('blood_requests')
      .delete()
      .eq('id', requestId)

    if (error) {
       throw new Error(`Failed to delete request: ${error.message}`)
    }
    
    return true
  }
}
