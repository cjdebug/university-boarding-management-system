import { useState } from "react";
import { apiRequest } from "../../services/api";

function CreateAnnouncement() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    announcement_date: "",
    audience: "all_students",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setError("");

    try {
      const data = await apiRequest("/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          announcement_date: formData.announcement_date,
          audience: formData.audience,
        }),
      });

      setSuccessMessage(
        `Announcement ${data.announcement_id} created successfully`,
      );

      setFormData({
        title: "",
        message: "",
        announcement_date: "",
        audience: "all_students",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Create Announcement</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Announcement Date</label>
          <input
            type="date"
            name="announcement_date"
            value={formData.announcement_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Audience</label>
          <select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
          >
            <option value="all_students">All Students</option>
          </select>
        </div>

        <button type="submit">Create Announcement</button>
      </form>

      {successMessage && <p>{successMessage}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateAnnouncement;
