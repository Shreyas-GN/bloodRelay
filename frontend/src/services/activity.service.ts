import { supabaseClient } from '@/lib/supabase/client'
import type { ActivityEventType } from '@/types/database.types'

export class ActivityService {
  static async log(
    userId: string,
    eventType: ActivityEventType,
    description: string,
    requestId?: string | null,
    supabase = supabaseClient
  ): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('activities')
        .insert({
          user_id: userId,
          event_type: eventType,
          description,
          request_id: requestId ?? null,
        })
      if (error) console.error('ActivityService.log failed:', error)
    } catch (err) {
      console.error('ActivityService.log threw:', err)
    }
  }
}
