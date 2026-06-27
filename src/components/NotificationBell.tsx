import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndNotifications();
  }, []);

  const loadUserAndNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);
    loadNotifications(user.id);
    subscribeToNotifications(user.id);
  };

  const loadNotifications = async (uid: string) => {
    const { data } = await notificationService.getUserNotifications(uid, 10);
    setNotifications(data as Notification[]);

    const { count } = await notificationService.getUnreadCount(uid);
    setUnreadCount(count);
  };

  const subscribeToNotifications = (uid: string) => {
    const unsubscribe = notificationService.subscribeToNotifications(uid, (newNotification) => {
      setNotifications(prev => [newNotification as Notification, ...prev].slice(0, 10));
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.is_read ? 'bg-accent/50' : ''
                }`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(notification.created_at)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}