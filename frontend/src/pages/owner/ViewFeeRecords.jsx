import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewFeeRecords() {
  const navigate = useNavigate();

  const [feeRecords, setFeeRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeeRecords = async () => {
      try {
        const data = await apiRequest("/fee-records");
        setFeeRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeRecords();
  }, []);

  const handleDelete = async (feeRecordId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fee record?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/fee-records/${feeRecordId}`, {
        method: "DELETE",
      });

      setFeeRecords((currentRecords) =>
        currentRecords.filter((fee) => fee.fee_record_id !== feeRecordId),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredFeeRecords = feeRecords.filter((fee) => {
    const search = searchTerm.toLowerCase();

    return (
      String(fee.student_id).includes(search) ||
      fee.fee_type.toLowerCase().includes(search) ||
      fee.fee_status.toLowerCase().includes(search)
    );
  });

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
        <h1>Fee Records</h1>
        <p>Review boarding fee records and payment status.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      <div className="form-group">
        <label>Search Fee Records</label>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student ID, fee type, or status"
        />
      </div>

      {!error && feeRecords.length === 0 && (
        <div className="empty-state">No fee records found.</div>
      )}

      {feeRecords.length > 0 && filteredFeeRecords.length === 0 && (
        <div className="empty-state">No fee records match your search.</div>
      )}

      {filteredFeeRecords.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fee ID</th>
                <th>Student ID</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeeRecords.map((fee) => (
                <tr key={fee.fee_record_id}>
                  <td>{fee.fee_record_id}</td>

                  <td>{fee.student_id}</td>

                  <td>{fee.fee_type}</td>

                  <td>Rs. {fee.amount}</td>

                  <td>{fee.due_date}</td>

                  <td>
                    <span className={`status-badge status-${fee.fee_status}`}>
                      {fee.fee_status.replace("_", " ")}
                    </span>
                  </td>

                  <td>{fee.description || "-"}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-action-btn table-action-edit"
                        onClick={() =>
                          navigate(
                            `/owner/fee-records/${fee.fee_record_id}/edit`,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="table-action-btn table-action-delete"
                        onClick={() => handleDelete(fee.fee_record_id)}
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

export default ViewFeeRecords;
