import { useState } from "react";
import { apiRequest } from "../../services/api";

function CreateFeeRecord() {
  const [formData, setFormData] = useState({
    student_id: "",
    fee_type: "",
    amount: "",
    due_date: "",
    description: "",
  });

  const [message, setMessage] = useState("");
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

    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/fee-records", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(formData.student_id),
          fee_type: formData.fee_type,
          amount: Number(formData.amount),
          due_date: formData.due_date,
          description: formData.description || null,
        }),
      });

      setMessage(`Fee record ${data.fee_record_id} created successfully`);

      setFormData({
        student_id: "",
        fee_type: "",
        amount: "",
        due_date: "",
        description: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Create Fee Record</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Student ID</label>
          <input
            type="number"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Fee Type</label>
          <select
            name="fee_type"
            value={formData.fee_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Fee Type</option>
            <option value="Monthly Boarding Fee">Monthly Boarding Fee</option>
            <option value="Advance Payment">Advance Payment</option>
          </select>
        </div>

        <div>
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

        <div>
          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Create Fee Record</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateFeeRecord;
