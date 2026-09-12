import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewFeeRecords() {
  const [feeRecords, setFeeRecords] = useState([]);
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

  if (loading) {
    return <p>Loading fee records...</p>;
  }

  return (
    <div>
      <h1>Fee Records</h1>

      {error && <p>{error}</p>}

      {!error && feeRecords.length === 0 && <p>No fee records found.</p>}

      {feeRecords.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Fee ID</th>
              <th>Student ID</th>
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
                <td>{fee.fee_record_id}</td>
                <td>{fee.student_id}</td>
                <td>{fee.fee_type}</td>
                <td>{fee.amount}</td>
                <td>{fee.due_date}</td>
                <td>{fee.fee_status}</td>
                <td>{fee.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewFeeRecords;
