import { useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function AddStudent() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    email: "",
    address: "",
    academic_institution: "",
    course_name: "",
    guardian_name: "",
    guardian_phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const dataToSend = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        address: formData.address || null,
        academic_institution: formData.academic_institution || null,
        course_name: formData.course_name || null,
        guardian_name: formData.guardian_name || null,
        guardian_phone: formData.guardian_phone || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
      };

      const createdStudent = await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Student created successfully. Registration Number: ${createdStudent.registration_no}`,
      );

      setFormData({
        username: "",
        password: "",
        full_name: "",
        date_of_birth: "",
        gender: "",
        phone_number: "",
        email: "",
        address: "",
        academic_institution: "",
        course_name: "",
        guardian_name: "",
        guardian_phone: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Student</h1>
        <p>Create a student login account and boarding resident profile.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Login Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label>Temporary Password</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter temporary password"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Personal Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={today}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter home address"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Academic Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Academic Institution</label>

              <input
                type="text"
                name="academic_institution"
                value={formData.academic_institution}
                onChange={handleChange}
                placeholder="University or institution"
              />
            </div>

            <div className="form-group">
              <label>Course Name</label>

              <input
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                placeholder="Course or programme"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Guardian Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Guardian Name</label>

              <input
                type="text"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleChange}
                placeholder="Guardian's name"
              />
            </div>

            <div className="form-group">
              <label>Guardian Phone</label>

              <input
                type="text"
                name="guardian_phone"
                value={formData.guardian_phone}
                onChange={handleChange}
                placeholder="Guardian's phone number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Emergency Contact</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Emergency Contact Name</label>

              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Contact person's name"
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Phone</label>

              <input
                type="text"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="Emergency phone number"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Student
        </button>
      </form>
    </div>
  );
}

export default AddStudent;
