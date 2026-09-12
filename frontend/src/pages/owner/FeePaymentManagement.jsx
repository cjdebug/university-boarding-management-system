import { useNavigate } from "react-router-dom";

function FeePaymentManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Boarding Fee & Payments</h1>

      <p>Manage student boarding fees and payment records.</p>

      <div>
        <button onClick={() => navigate("/owner/fee-records/add")}>
          Create Fee Record
        </button>

        <button onClick={() => navigate("/owner/fee-records")}>
          View Fee Records
        </button>

        <button onClick={() => navigate("/owner/payments/add")}>
          Record Payment
        </button>

        <button onClick={() => navigate("/owner/payments")}>
          View Payment History
        </button>
      </div>
    </div>
  );
}

export default FeePaymentManagement;
