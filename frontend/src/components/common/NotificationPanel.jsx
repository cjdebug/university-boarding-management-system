import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { apiRequest } from "../../services/api";

function NotificationPanel({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/notifications");

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await apiRequest(`/notifications/${notification.notification_id}/read`, {
        method: "PUT",
      });

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.notification_id === notification.notification_id
            ? { ...item, is_read: true }
            : item,
        ),
      );

      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <strong>Notifications</strong>
      </div>

      <div className="notification-panel-content">
        {loading ? (
          <p className="notification-empty">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="notification-empty">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.notification_id}
              type="button"
              className={`notification-item ${
                notification.is_read ? "read" : "unread"
              }`}
              onClick={() => handleMarkAsRead(notification)}
            >
              <div className="notification-item-content">
                <strong>{notification.title}</strong>

                <p>{notification.message}</p>

                <small>
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </div>

              {!notification.is_read && (
                <span className="notification-unread-dot">
                  <Check size={13} />
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
