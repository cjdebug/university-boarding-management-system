import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const data = await apiRequest("/payments/my");
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPayments();
  }, []);

  if (loading) {
    return <p>Loading payment history...</p>;
  }

  return (
    <div>
      <h1>My Payment History</h1>

      {error && <p>{error}</p>}

      {!error && payments.length === 0 && <p>No payments found.</p>}

      {payments.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Fee Record ID</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Reference No.</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment.payment_id}>
                <td>{payment.payment_id}</td>
                <td>{payment.fee_record_id}</td>
                <td>{payment.amount}</td>
                <td>{payment.payment_date}</td>
                <td>{payment.payment_method}</td>
                <td>{payment.reference_no || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyPaymentHistory;
