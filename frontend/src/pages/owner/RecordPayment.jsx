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

        // Only show fees that are not fully paid
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
    <div>
      <h1>Record Payment</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Fee Record</label>
          <br />

          <select
            name="fee_record_id"
            value={formData.fee_record_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Fee Record</option>

            {feeRecords.map((fee) => (
              <option key={fee.fee_record_id} value={fee.fee_record_id}>
                Fee #{fee.fee_record_id} - Student {fee.student_id} -{" "}
                {fee.fee_type} - Rs. {fee.amount}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Payment Amount</label>
          <br />

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div>
          <label>Payment Date</label>
          <br />

          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            max={today}
            required
          />
        </div>

        <div>
          <label>Payment Method</label>
          <br />

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

        <div>
          <label>Reference Number</label>
          <br />

          <input
            type="text"
            name="reference_no"
            value={formData.reference_no}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Note</label>
          <br />

          <textarea name="note" value={formData.note} onChange={handleChange} />
        </div>

        <br />

        <button type="submit">Record Payment</button>
      </form>
    </div>
  );
}

export default RecordPayment;
