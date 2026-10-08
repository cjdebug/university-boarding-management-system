import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

function FeePaymentReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/reports/fee-payments");

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load fee and payment report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="page-container report-page">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Reports</h1>

          <div className="report-error">{error}</div>

          <button className="report-retry-button" onClick={loadReport}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Main page heading */}
      <div className="page-header">
        <h1>Reports</h1>
        <p>View and generate boarding management reports.</p>
      </div>

      {/* Fee & Payment Report */}
      <div className="report-section report-print-area">
        
        <div className="print-report-header">
          <h1>Fee & Payment Report</h1>
          <p>Boarding Management System</p>
          <span>Generated on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>

        <div className="report-section-header">
          <div>
            <h2>Fee & Payment Report</h2>
            <p>
              View boarding fee records, payments, and outstanding balances.
            </p>
          </div>

          <button
            className="generate-report-button"
            onClick={() => window.print()}
          >
            Generate Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Total Fee Records</span>
            <strong>{report.summary.total_fee_records}</strong>
          </div>

          <div className="report-summary-card">
            <span>Total Amount</span>
            <strong>
              Rs.{" "}
              {Number(report.summary.total_amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div className="report-summary-card">
            <span>Total Paid</span>
            <strong>
              Rs.{" "}
              {Number(report.summary.total_paid).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div className="report-summary-card">
            <span>Total Outstanding</span>
            <strong>
              Rs.{" "}
              {Number(report.summary.total_outstanding).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                },
              )}
            </strong>
          </div>
        </div>

        {/* Report table */}
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Fee ID</th>
                <th>Student ID</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Payments</th>
              </tr>
            </thead>

            <tbody>
              {report.records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="report-empty">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                report.records.map((record) => (
                  <tr key={record.fee_record_id}>
                    <td>{record.fee_record_id}</td>

                    <td>{record.student_id}</td>

                    <td>{record.fee_type}</td>

                    <td>
                      Rs.{" "}
                      {Number(record.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td>{record.due_date}</td>

                    <td>
                      <span className={`report-status ${record.fee_status}`}>
                        {record.fee_status}
                      </span>
                    </td>

                    <td>
                      Rs.{" "}
                      {Number(record.total_paid).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      Rs.{" "}
                      {Number(record.outstanding_balance).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td>{record.payment_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FeePaymentReport;
