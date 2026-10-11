import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function OverdueFeeRecords() {
  const [overdueRecords, setOverdueRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverdueRecords = async () => {
      try {
        const data = await apiRequest("/fee-records/overdue");
        setOverdueRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueRecords();
  }, []);

  const filteredOverdueRecords = overdueRecords.filter((fee) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      (fee.student_name || "").toLowerCase().includes(search) ||
      (fee.fee_type || "").toLowerCase().includes(search) ||
      (fee.fee_status || "").replace(/_/g, " ").toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading overdue fee records...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Overdue Fee Records</h1>
        <p>
          View boarding fee records that are past their due date and have not
          been fully paid.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && (
        <div className="form-group">
          <label>Search Overdue Fee Records</label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, fee type, or status"
          />
        </div>
      )}

      {!error && overdueRecords.length === 0 && (
        <div className="empty-state">No overdue fee records found.</div>
      )}

      {!error &&
        overdueRecords.length > 0 &&
        filteredOverdueRecords.length === 0 && (
          <div className="empty-state">
            No overdue fee records match your search.
          </div>
        )}

      {!error && filteredOverdueRecords.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {filteredOverdueRecords.map((fee) => (
                <tr key={fee.fee_record_id}>
                  <td>{fee.student_name || "Unknown Student"}</td>

                  <td>{fee.fee_type}</td>

                  <td>Rs. {fee.amount}</td>

                  <td>{fee.due_date}</td>

                  <td>
                    <span className={`status-badge status-${fee.fee_status}`}>
                      {fee.fee_status.replace(/_/g, " ")}
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

export default OverdueFeeRecords;
