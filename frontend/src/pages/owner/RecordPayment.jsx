import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function RecordPayment() {
  const [feeRecords, setFeeRecords] = useState([]);

  const [formData, setFormData] = useState({
    fee_record_id: "",
    amount: "",
    payment_date: today,
    payment_method: "",
    reference_no: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeeRecords = async () => {
      try {
        const data = await apiRequest("/fee-records");

        const unpaidFees = data.filter((fee) => fee.fee_status !== "paid");

        setFeeRecords(unpaidFees);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchFeeRecords();
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
        fee_record_id: Number(formData.fee_record_id),
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference_no: formData.reference_no || null,
        note: formData.note || null,
      };

      const payment = await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Payment recorded successfully. Payment ID: ${payment.payment_id}`,
      );

      setFormData({
        fee_record_id: "",
        amount: "",
        payment_date: today,
        payment_method: "",
        reference_no: "",
        note: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Record Payment</h1>
        <p>Record a full or partial boarding fee payment made by a student.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Fee Record</label>

            <select
              name="fee_record_id"
              value={formData.fee_record_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Fee Record</option>

              {feeRecords.map((fee) => (
                <option key={fee.fee_record_id} value={fee.fee_record_id}>
                  Fee #{fee.fee_record_id} - Student {fee.student_id}
                  {" - "}
                  {fee.fee_type}
                  {" - Rs. "}
                  {fee.amount}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Enter payment amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Date</label>

            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>

            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reference Number</label>

            <input
              type="text"
              name="reference_no"
              value={formData.reference_no}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group full-width">
            <label>Note</label>

            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Optional payment note"
            />
          </div>
        </div>

        <br />

        <button type="submit" className="btn btn-primary">
          Record Payment
        </button>
      </form>
    </div>
  );
}

export default RecordPayment;
