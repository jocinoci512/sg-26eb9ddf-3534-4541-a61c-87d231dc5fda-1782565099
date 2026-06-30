import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | 'shipment_created'
  | 'shipment_updated'
  | 'status_changed'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'cancelled';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'shipment_created' | 'shipment_updated' | 'quote_received' | 'system_alert';
  metadata?: Record<string, any>;
  customerId?: string;
  shipmentId?: string;
}

export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: params.userId,
            customer_id: params.customerId || params.metadata?.customer_id || null,
            shipment_id: params.shipmentId || params.metadata?.shipment_id || null,
            type: params.type,
            title: params.title,
            message: params.message,
            is_read: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create notification error:', error);
      return { data: null, error };
    }
  },

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { data: [], error };
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { count: count ?? 0, error: null };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { count: 0, error };
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { error };
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { error };
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { error };
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Create shipment notification
   */
  async notifyShipmentStatusChange(
    shipmentId: string,
    customerId: string,
    status: string,
    trackingNumber: string
  ) {
    try {
      // Get customer's user_id
      const { data: customer } = await supabase
        .from('customers')
        .select('user_id, full_name')
        .eq('id', customerId)
        .single();

      if (!customer?.user_id) return { error: 'Customer not found' };

      const statusMessages: Record<string, { title: string; message: string }> = {
        'picked_up': {
          title: 'Shipment Picked Up',
          message: `Your shipment ${trackingNumber} has been picked up and is on its way.`
        },
        'in_transit': {
          title: 'Shipment In Transit',
          message: `Your shipment ${trackingNumber} is currently in transit.`
        },
        'out_for_delivery': {
          title: 'Out For Delivery',
          message: `Your shipment ${trackingNumber} is out for delivery and will arrive soon.`
        },
        'delivered': {
          title: 'Shipment Delivered',
          message: `Your shipment ${trackingNumber} has been successfully delivered.`
        },
        'delayed': {
          title: 'Shipment Delayed',
          message: `Your shipment ${trackingNumber} has been delayed. We apologize for the inconvenience.`
        },
      };

      const notification = statusMessages[status] || {
        title: 'Shipment Update',
        message: `Your shipment ${trackingNumber} status has been updated.`
      };

      return await this.createNotification({
        userId: customer.user_id,
        customerId,
        shipmentId,
        type: status as NotificationType,
        title: notification.title,
        message: notification.message,
      });
    } catch (error) {
      console.error('Notify shipment status change error:', error);
      return { error };
    }
  },
};

/**
 * Standalone createNotification function
 * Wrapper around notificationService.createNotification for easier imports
 */
export async function createNotification(params: {
  userId: string;
  type: 'shipment_created' | 'shipment_updated' | 'shipment_delayed' | 'quote_received' | 'system_alert';
  title: string;
  message: string;
  shipmentId?: string;
  quoteId?: string;
}) {
  try {
    const result = await notificationService.createNotification(params);
    if (result.error) {
      return { success: false, error: String(result.error) };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}