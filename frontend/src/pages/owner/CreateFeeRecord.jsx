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
    <div>
      <h1>Create Fee Record</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Student</label>
          <br />

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

        <div>
          <label>Fee Type</label>
          <br />

          <input
            type="text"
            name="fee_type"
            value={formData.fee_type}
            onChange={handleChange}
            placeholder="Example: Monthly Boarding Fee"
            required
          />
        </div>

        <div>
          <label>Amount</label>
          <br />

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

        <div>
          <label>Due Date</label>
          <br />

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <br />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">Create Fee Record</button>
      </form>
    </div>
  );
}

export default CreateFeeRecord;
