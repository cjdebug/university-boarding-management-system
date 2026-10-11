import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/students/me");

        setFormData({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
          address: data.address || "",
          guardian_name: data.guardian_name || "",
          guardian_phone: data.guardian_phone || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      await apiRequest("/students/me", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate("/student/profile");
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
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Edit Profile</h1>
        <p>Update your personal and contact information.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {successMessage && (
        <div className="message-success">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Personal Information</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Guardian Information</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Guardian Name</label>

              <input
                type="text"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Guardian Phone</label>

              <input
                type="tel"
                name="guardian_phone"
                value={formData.guardian_phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Emergency Contact</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>

              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>

              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
              />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/student/profile")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
