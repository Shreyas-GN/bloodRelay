import { getToken } from "firebase/messaging";
import { messaging } from "./config";
import { DonorService } from "@/services/donor.service";

/**
 * Registers the current device for push notifications.
 * Saves the FCM token to the user's Supabase profile.
 */
export async function registerForPushNotifications(userId: string) {
    try {
        const msg = await messaging();
        if (!msg) {
            console.warn("[FCM] Messaging not supported in this browser");
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("[FCM] Notification permission denied");
            return null;
        }

        // Get FCM Token
        // Note: You need a VAPID key from Firebase Console -> Project Settings -> Cloud Messaging
        const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (token) {
            console.log("[FCM] Token acquired:", token);
            
            // Save to Supabase
            await DonorService.updateProfile(userId, {
                fcm_token: token
            } as any);

            return token;
        }
        
        return null;
    } catch (error) {
        console.error("[FCM] Registration failed:", error);
        return null;
    }
}
