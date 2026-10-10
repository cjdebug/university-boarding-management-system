import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function MyProfile() {
  const navigate = useNavigate();   
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const data = await apiRequest("/students/me");
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

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
        <h1>My Profile</h1>

        <p>View your personal, academic, and contact information.</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/student/profile/edit")}
        >
          Edit Profile
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}

      {profile && (
        <>
          <div className="form-card">
            <div className="form-section">
              <h3>Personal Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Registration Number</label>
                  <p>{profile.registration_no || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <p>{profile.full_name || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <p>{profile.date_of_birth || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <p>{profile.gender || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <p>{profile.phone_number || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <p>{profile.email || "-"}</p>
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <p>{profile.address || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section">
              <h3>Academic Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Academic Institution</label>
                  <p>{profile.academic_institution || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Course</label>
                  <p>{profile.course_name || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section">
              <h3>Guardian Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Guardian Name</label>
                  <p>{profile.guardian_name || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Guardian Phone</label>
                  <p>{profile.guardian_phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section">
              <h3>Emergency Contact</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Name</label>
                  <p>{profile.emergency_contact_name || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <p>{profile.emergency_contact_phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section">
              <h3>Account Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Student ID</label>
                  <p>{profile.student_id}</p>
                </div>

                <div className="form-group">
                  <label>Account Status</label>

                  <p>
                    <span
                      className={`status-badge status-${profile.student_status}`}
                    >
                      {profile.student_status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MyProfile;
