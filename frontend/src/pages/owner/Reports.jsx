import { useNavigate } from "react-router-dom";

function Reports() {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Fee & Payment Report",
      description:
        "View boarding fee records, payments, and outstanding balances.",
      path: "/owner/reports/fee-payments",
    },
    {
      title: "Attendance Report",
      description:
        "View student attendance records and leave request summaries.",
      path: "/owner/reports/attendance",
    },
    {
      title: "Maintenance Report",
      description:
        "View maintenance requests, issue types, and request statuses.",
      path: "/owner/reports/maintenance",
    },
    {
      title: "Communication & Turnover Report",
      description:
        "View announcements, student feedback, and communication records.",
      path: "/owner/reports/communication-turnover",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>View and generate boarding management reports.</p>
      </div>

      <div className="action-grid">
        {reports.map((report) => (
          <div
            key={report.path}
            className="action-card"
            onClick={() => navigate(report.path)}
          >
            <h3>{report.title}</h3>
            <p>{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
