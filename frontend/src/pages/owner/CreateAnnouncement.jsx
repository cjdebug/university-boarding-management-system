import { useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function CreateAnnouncement() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    announcement_date: today,
    audience: "All Students",
    status: "active",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setError("");

    try {
      const dataToSend = {
        title: formData.title,
        message: formData.message,
        announcement_date: formData.announcement_date,
        audience: formData.audience,
        status: formData.status,
      };

      const createdAnnouncement = await apiRequest("/announcements", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setSuccessMessage(
        `Announcement created successfully. Announcement ID: ${createdAnnouncement.announcement_id}`,
      );

      setFormData({
        title: "",
        message: "",
        announcement_date: today,
        audience: "All Students",
        status: "active",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Announcement</h1>
        <p>Create a new boarding announcement for student residents.</p>
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
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Message</label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter announcement message"
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
                min={today}
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
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Announcement
        </button>
      </form>
    </div>
  );
}

export default CreateAnnouncement;
