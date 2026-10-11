import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewAnnouncements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  // Search by audience, status, or importance
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const search = searchTerm.trim().toLowerCase();

      if (!search) {
        return true;
      }

      const audience = String(announcement.audience || "").toLowerCase();

      const status = String(
        announcement.announcement_status || announcement.status || "",
      ).toLowerCase();

      const importance = announcement.is_pinned ? "pinned" : "normal";

      // Prevent "active" from matching "inactive"
      const matchesStatus =
        search === "active" || search === "inactive"
          ? status === search
          : status.includes(search);

      const matchesAudience = audience.includes(search);

      const matchesImportance = importance.includes(search);

      return matchesAudience || matchesStatus || matchesImportance;
    })
    .sort(
      (a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)),
    );

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

      {!error && (
        <div className="form-group">
          <label htmlFor="search-announcements">Search Announcements</label>

          <input
            id="search-announcements"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by audience, status, or importance"
          />
        </div>
      )}

      {!error && announcements.length === 0 && (
        <div className="empty-state">No announcements found.</div>
      )}

      {!error &&
        announcements.length > 0 &&
        filteredAnnouncements.length === 0 && (
          <div className="empty-state">No announcements match your search.</div>
        )}

      {!error && filteredAnnouncements.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Date</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Importance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAnnouncements.map((announcement) => {
                const status =
                  announcement.announcement_status ||
                  announcement.status ||
                  "Active";

                return (
                  <tr key={announcement.announcement_id}>
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
                      {announcement.is_pinned ? (
                        <span className="status-badge status-pinned">
                          <strong>Pinned</strong>
                        </span>
                      ) : (
                        <span className="status-badge">Normal</span>
                      )}
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
