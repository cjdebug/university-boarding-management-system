import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewPaymentHistory() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await apiRequest("/payments");
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await apiRequest(`/payments/${paymentId}`, {
        method: "DELETE",
      });

      setPayments((currentPayments) =>
        currentPayments.filter((payment) => payment.payment_id !== paymentId),
      );

      setMessage("Payment deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete payment.");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      (payment.student_name || "").toLowerCase().includes(search) ||
      (payment.payment_method || "").toLowerCase().includes(search)
    );
  });


  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment History</h1>
        <p>Review all payments recorded for student boarding fees.</p>
      </div>

      {message && <div className="message-success">{message}</div>}
      {error && <div className="message-error">{error}</div>}

      {!error && (
        <div className="form-group">
          <label>Search Payment History</label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, payment method"
          />
        </div>
      )}

      {!error && payments.length === 0 && (
        <div className="empty-state">No payment records found.</div>
      )}

      {!error && payments.length > 0 && filteredPayments.length === 0 && (
        <div className="empty-state">No payment records match your search.</div>
      )}

      {!error && filteredPayments.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Reference No.</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.student_name || "Unknown Student"}</td>

                  <td>Rs. {payment.amount}</td>

                  <td>{payment.payment_date}</td>

                  <td>
                    <span className="status-badge status-active">
                      {payment.payment_method}
                    </span>
                  </td>

                  <td>
                    {payment.reference_no &&
                    payment.reference_no.toLowerCase() !== "null"
                      ? payment.reference_no
                      : "-"}
                  </td>

                  <td>
                    {payment.note && payment.note.toLowerCase() !== "null"
                      ? payment.note
                      : "-"}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-action-btn table-action-edit"
                        onClick={() =>
                          navigate(`/owner/payments/${payment.payment_id}/edit`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="table-action-btn table-action-delete"
                        onClick={() => handleDelete(payment.payment_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewPaymentHistory;
