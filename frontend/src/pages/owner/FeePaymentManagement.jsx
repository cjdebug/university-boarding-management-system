import { useNavigate } from "react-router-dom";

function FeePaymentManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Boarding Fee & Payments</h1>
        <p>Manage student fee records, payments, and payment history.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/fee-records/add")}
        >
          <h3>Create Fee Record</h3>
          <p>Add a new boarding fee record for a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/fee-records")}
        >
          <h3>View Fee Records</h3>
          <p>Review all student fee records and payment status.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/payments/add")}
        >
          <h3>Record Payment</h3>
          <p>Record a full or partial payment made by a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/payments")}
        >
          <h3>Payment History</h3>
          <p>View previously recorded student payments.</p>
        </div>
      </div>
    </div>
  );
}

export default FeePaymentManagement;
