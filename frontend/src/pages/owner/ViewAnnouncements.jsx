import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

const handleDelete = async (announcementId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this announcement?",
  );

  if (!confirmed) {
    return;
  }

  try {
    setMessage("");
    setError("");

    await apiRequest(`/announcements/${announcementId}`, {
      method: "DELETE",
    });

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.filter(
        (announcement) => announcement.announcement_id !== announcementId,
      ),
    );

    setMessage("Announcement deleted successfully.");
  } catch (err) {
    setError(err.message);
  }
};

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

      {message && <div className="message-success">{message}</div>}

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
                <th>Actions</th>
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
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action-btn table-action-edit"
                          onClick={() =>
                            navigate(
                              `/owner/announcements/${announcement.announcement_id}/edit`,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="table-action-btn table-action-delete"
                          onClick={() =>
                            handleDelete(announcement.announcement_id)
                          }
                        >
                          Delete
                        </button>
                      </div>
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
