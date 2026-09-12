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
    return <p>Loading payment history...</p>;
  }

  return (
    <div>
      <h1>Payment History</h1>

      {error && <p>{error}</p>}

      {!error && payments.length === 0 && <p>No payment records found.</p>}

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
              <th>Note</th>
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
                <td>{payment.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewPaymentHistory;
