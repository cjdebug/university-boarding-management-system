import { useNavigate } from "react-router-dom";

function StudentFeePaymentManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Boarding Fee & Payments</h1>
        <p>View your boarding fee records and payment history.</p>
      </div>

      <div className="action-grid">
        <div className="action-card" onClick={() => navigate("/student/fees")}>
          <h3>My Fees</h3>
          <p>View your boarding fee records, due dates, and payment status.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/payment-history")}
        >
          <h3>My Payment History</h3>
          <p>Review payments that have been recorded for your boarding fees.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentFeePaymentManagement;
