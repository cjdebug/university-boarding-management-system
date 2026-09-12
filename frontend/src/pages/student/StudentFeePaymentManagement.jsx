import { useNavigate } from "react-router-dom";

function StudentFeePaymentManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Boarding Fee & Payments</h1>

      <p>View your boarding fee records and payment history.</p>

      <div>
        <button onClick={() => navigate("/student/fees")}>My Fees</button>

        <button onClick={() => navigate("/student/payment-history")}>
          My Payment History
        </button>
      </div>
    </div>
  );
}

export default StudentFeePaymentManagement;
