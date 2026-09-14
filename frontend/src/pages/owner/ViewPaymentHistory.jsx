import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      {error && <div className="message-error">{error}</div>}

      {!error && payments.length === 0 && (
        <div className="empty-state">No payment records found.</div>
      )}

      {payments.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Fee Record ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Reference No.</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td>{payment.fee_record_id}</td>
                  <td>Rs. {payment.amount}</td>
                  <td>{payment.payment_date}</td>

                  <td>
                    <span className="status-badge status-active">
                      {payment.payment_method}
                    </span>
                  </td>

                  <td>{payment.reference_no || "-"}</td>
                  <td>{payment.note || "-"}</td>
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
