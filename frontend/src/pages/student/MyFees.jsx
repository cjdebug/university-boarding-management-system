import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyFees() {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyFees = async () => {
      try {
        const data = await apiRequest("/fee-records/my");
        setFeeRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyFees();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading fee records...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Fees</h1>
        <p>View your boarding fee records, due dates, and current status.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && feeRecords.length === 0 && (
        <div className="empty-state">No fee records found.</div>
      )}

      {feeRecords.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {feeRecords.map((fee) => (
                <tr key={fee.fee_record_id}>
                  <td>{fee.fee_type}</td>
                  <td>Rs. {fee.amount}</td>
                  <td>{fee.due_date}</td>

                  <td>
                    <span className={`status-badge status-${fee.fee_status}`}>
                      {fee.fee_status.replace("_", " ")}
                    </span>
                  </td>

                  <td>{fee.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyFees;
