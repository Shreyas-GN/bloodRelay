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
    const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error || 'Failed to create request');
    }
    
    return json.request;
  }

  /**
   * Retrieves all requests across the platform ordered by recency.
   */
  static async getActiveRequests() {
    const { data, error } = await db
      .from('blood_requests')
      .select(`
        *,
        donor_responses (
          *,
          profiles (full_name, phone, blood_group)
        )
      `)
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
      .select(`
        *,
        donor_responses (
          *,
          profiles (full_name, phone, blood_group)
        )
      `)
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

  /**
   * Retrieves a specific request and its donor responses in a single query.
   */
  static async getRequestWithResponses(requestId: string) {
    const { data, error } = await db
      .from('blood_requests')
      .select(`
        *,
        donor_responses (
          *,
          profiles (full_name, phone, blood_group)
        )
      `)
      .eq('id', requestId)
      .single()

    if (error) {
       throw new Error(`Failed to fetch request with responses: ${error.message}`)
    }
    
    return data
  }

  /**
   * Syncs notified and confirmed counts for a request.
   */
  static async updateRequestCounts(requestId: string, notifiedDelta: number = 0, confirmedDelta: number = 0) {
    const { data: current, error: fetchErr } = await db
      .from('blood_requests')
      .select('notified_count, confirmed_count')
      .eq('id', requestId)
      .single()
      
    if (fetchErr) return null;

    const { data, error } = await db
      .from('blood_requests')
      .update({
        notified_count: (current.notified_count || 0) + notifiedDelta,
        confirmed_count: (current.confirmed_count || 0) + confirmedDelta,
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
       throw new Error(`Failed to update request counts: ${error.message}`)
    }
    
    return data
  }

  /**
   * Marks older SEARCHING requests as EXPIRED based on timestamp logic in Edge Function
   * Kept here for potential client-side fallback triggers
   */
  static async expireStaleRequests(hoursThreshold: number = 2) {
    const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString()
    const { error } = await db
      .from('blood_requests')
      .update({ status: 'expired' })
      .eq('status', 'searching')
      .lte('created_at', thresholdDate)

    if (error) {
       throw new Error(`Failed to expire stale requests: ${error.message}`)
    }
  }
}
