import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function CreateFeeRecord() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    fee_type: "",
    amount: "",
    due_date: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiRequest("/students");
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, []);

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
        student_id: Number(formData.student_id),
        fee_type: formData.fee_type,
        amount: Number(formData.amount),
        due_date: formData.due_date,
        description: formData.description || null,
      };

      const createdFee = await apiRequest("/fee-records", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Fee record created successfully. Fee ID: ${createdFee.fee_record_id}`,
      );

      setFormData({
        student_id: "",
        fee_type: "",
        amount: "",
        due_date: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Fee Record</h1>
        <p>Add a new boarding fee record for a student.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Student</label>

            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Student</option>

              {students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.registration_no} - {student.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fee Type</label>

            <input
              type="text"
              name="fee_type"
              value={formData.fee_type}
              onChange={handleChange}
              placeholder="Monthly Boarding Fee"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              min={today}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </div>
        </div>

        <br />

        <button type="submit" className="btn btn-primary">
          Create Fee Record
        </button>
      </form>
    </div>
  );
}

export default CreateFeeRecord;
