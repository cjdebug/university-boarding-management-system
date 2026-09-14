import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiRequest("/announcements");
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Announcements</h1>
        <p>Review boarding announcements created for student residents.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && announcements.length === 0 && (
        <div className="empty-state">No announcements found.</div>
      )}

      {announcements.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Announcement ID</th>
                <th>Title</th>
                <th>Message</th>
                <th>Date</th>
                <th>Audience</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {announcements.map((announcement) => {
                const status =
                  announcement.status ||
                  announcement.announcement_status ||
                  "Active";

                return (
                  <tr key={announcement.announcement_id}>
                    <td>{announcement.announcement_id}</td>
                    <td>{announcement.title}</td>
                    <td>{announcement.message}</td>
                    <td>
                      {announcement.announcement_date ||
                        announcement.date ||
                        "-"}
                    </td>
                    <td>{announcement.audience || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewAnnouncements;
