import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRealtime(table, filter, callback) {
  useEffect(() => {
    // Generate a unique ID to avoid channel collisions
    const subscriptionId = Math.random().toString(36).substring(7)
    
    const channel = supabase
      .channel(`realtime-${table}-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter || undefined
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback])
}
