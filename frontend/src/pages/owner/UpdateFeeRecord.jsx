import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateFeeRecord() {
  const { fee_record_id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    fee_type: "",
    amount: "",
    due_date: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeRecords, studentData] = await Promise.all([
          apiRequest("/fee-records"),
          apiRequest("/students"),
        ]);

        const fee = feeRecords.find(
          (record) => record.fee_record_id === Number(fee_record_id),
        );

        if (!fee) {
          setError("Fee record not found.");
          return;
        }

        setStudents(studentData);

        setFormData({
          student_id: fee.student_id,
          fee_type: fee.fee_type,
          amount: fee.amount,
          due_date: fee.due_date,
          description: fee.description || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fee_record_id]);

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

      await apiRequest(`/fee-records/${fee_record_id}`, {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      });

      setMessage("Fee record updated successfully.");

      setTimeout(() => {
        navigate("/owner/fee-records");
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading fee record...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Fee Record</h1>
        <p>Update the details of the selected boarding fee record.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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
            Update Fee Record
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/owner/fee-records")}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdateFeeRecord;
