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
        `Student created successfully. Student ID: ${createdStudent.student_id}`,
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
    <div>
      <h1>Add Student</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Login Details</h3>

        <div>
          <label>Username</label>
          <br />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Temporary Password</label>
          <br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <h3>Student Details</h3>

        <div>
          <label>Full Name</label>
          <br />
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date of Birth</label>
          <br />
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            max={today}
          />
        </div>

        <div>
          <label>Gender</label>
          <br />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Phone Number</label>
          <br />
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Address</label>
          <br />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <h3>Academic Details</h3>

        <div>
          <label>Academic Institution</label>
          <br />
          <input
            type="text"
            name="academic_institution"
            value={formData.academic_institution}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Course Name</label>
          <br />
          <input
            type="text"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
          />
        </div>

        <h3>Guardian Details</h3>

        <div>
          <label>Guardian Name</label>
          <br />
          <input
            type="text"
            name="guardian_name"
            value={formData.guardian_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Guardian Phone</label>
          <br />
          <input
            type="text"
            name="guardian_phone"
            value={formData.guardian_phone}
            onChange={handleChange}
          />
        </div>

        <h3>Emergency Contact</h3>

        <div>
          <label>Emergency Contact Name</label>
          <br />
          <input
            type="text"
            name="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Emergency Contact Phone</label>
          <br />
          <input
            type="text"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}

export default AddStudent;
