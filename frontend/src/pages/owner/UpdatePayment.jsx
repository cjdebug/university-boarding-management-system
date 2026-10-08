import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function UpdatePayment() {
  const { payment_id } = useParams();
  const navigate = useNavigate();

  const [feeRecords, setFeeRecords] = useState([]);

  const [formData, setFormData] = useState({
    fee_record_id: "",
    amount: "",
    payment_date: today,
    payment_method: "",
    reference_no: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payments, feeData] = await Promise.all([
          apiRequest("/payments"),
          apiRequest("/fee-records"),
        ]);

        const payment = payments.find(
          (item) => item.payment_id === Number(payment_id),
        );

        if (!payment) {
          setError("Payment not found.");
          return;
        }

        setFeeRecords(feeData);

        setFormData({
          fee_record_id: payment.fee_record_id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method,
          reference_no: payment.reference_no || "",
          note: payment.note || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payment_id]);

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

      await apiRequest(`/payments/${payment_id}`, {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      });

      setMessage("Payment updated successfully.");

      setTimeout(() => {
        navigate("/owner/payments");
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading payment...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Payment</h1>
        <p>Update the selected student payment record.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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
                    Fee #{fee.fee_record_id} - Student {fee.student_id} -{" "}
                    {fee.fee_type}
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
            Update Payment
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/owner/payments")}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdatePayment;
