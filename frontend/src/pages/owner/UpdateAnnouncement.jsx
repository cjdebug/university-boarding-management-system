import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateAnnouncement() {
  const navigate = useNavigate();
  const { announcementId } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    announcement_date: "",
    audience: "All Students",
    announcement_status: "active",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await apiRequest("/announcements");

        const announcement = data.find(
          (item) => item.announcement_id === Number(announcementId),
        );

        if (!announcement) {
          setError("Announcement not found.");
          return;
        }

        setFormData({
          title: announcement.title || "",
          message: announcement.message || "",
          announcement_date: announcement.announcement_date || "",
          audience: announcement.audience || "All Students",
          announcement_status: announcement.announcement_status || "active",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/announcements/${announcementId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          announcement_date: formData.announcement_date,
          audience: formData.audience,
          announcement_status: formData.announcement_status,
        }),
      });

      setSuccessMessage("Announcement updated successfully.");

      setTimeout(() => {
        navigate("/owner/announcements");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading announcement...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Edit Announcement</h1>
        <p>Update the selected boarding announcement.</p>
      </div>

      {successMessage && (
        <div className="message-success">{successMessage}</div>
      )}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Announcement Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Message</label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Announcement Date</label>

              <input
                type="date"
                name="announcement_date"
                value={formData.announcement_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Audience</label>

              <select
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                required
              >
                <option value="All Students">All Students</option>
                <option value="Residents">Residents</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="announcement_status"
                value={formData.announcement_status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default UpdateAnnouncement;
