import { supabaseClient } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const activeChannels: Map<string, RealtimeChannel> = new Map();

/**
 * Centralized Supabase channel management
 */
export const subscribeToChannel = (
    channelName: string,
    eventSetup: (channel: RealtimeChannel) => void
): RealtimeChannel => {
    // Return existing channel if already subscribed
    if (activeChannels.has(channelName)) {
        return activeChannels.get(channelName)!;
    }

    const channel = supabaseClient.channel(channelName);
    
    // Allow caller to bind events
    eventSetup(channel);
    
    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log(`[Realtime] Subscribed to ${channelName}`);
        } else if (status === 'CLOSED') {
            console.log(`[Realtime] Closed ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
            console.error(`[Realtime] Error in ${channelName}`);
        }
    });

    activeChannels.set(channelName, channel);
    return channel;
};

export const unsubscribeFromChannel = async (channelName: string) => {
    const channel = activeChannels.get(channelName);
    if (channel) {
        await channel.unsubscribe();
        activeChannels.delete(channelName);
    }
};

export const unsubscribeAll = async () => {
    for (const [name, channel] of activeChannels.entries()) {
        await channel.unsubscribe();
    }
    activeChannels.clear();
};
