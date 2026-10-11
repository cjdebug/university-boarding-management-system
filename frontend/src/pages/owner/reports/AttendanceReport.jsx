import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { apiRequest } from "../../../services/api";

// Attendance chart colors
const COLORS = {
  present: "#176b38",
  absent: "#dc5656",
  late: "#e9ae42",
  leave: "#527ca8",
  approved: "#176b38",
  pending: "#e9ae42",
  rejected: "#dc5656",
};

const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  leave: "Leave",
};

const initialFilters = {
  from_date: "",
  to_date: "",
  attendance_status: "",
};

function AttendanceReport() {
  const [report, setReport] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load analytical report from FastAPI
  const loadReport = async (selectedFilters = initialFilters) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (selectedFilters.from_date) {
        params.append("from_date", selectedFilters.from_date);
      }

      if (selectedFilters.to_date) {
        params.append("to_date", selectedFilters.to_date);
      }

      if (selectedFilters.attendance_status) {
        params.append("attendance_status", selectedFilters.attendance_status);
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/attendance-reports?${queryString}`
        : "/attendance-reports";

      const data = await apiRequest(endpoint);

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load attendance report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  // Handle filter inputs
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Generate report using selected filters
  const handleGenerate = (event) => {
    event.preventDefault();

    if (
      filters.from_date &&
      filters.to_date &&
      filters.from_date > filters.to_date
    ) {
      setError("From Date cannot be after To Date.");
      return;
    }

    loadReport(filters);
  };

  // Restore unfiltered report
  const handleReset = () => {
    setFilters({ ...initialFilters });
    loadReport(initialFilters);
  };

  // Print existing report as PDF
  const handlePrint = () => {
    if (!loading && !error && report) {
      window.print();
    }
  };

  // Report values
  const summary = report?.summary || {};
  const charts = report?.charts || {};

  // Attendance distribution
  const attendanceDistribution = (charts.attendance_distribution || []).map(
    (item) => ({
      name: item.status,
      value: Number(item.count || 0),
      color: COLORS[item.status.toLowerCase()] || "#64748b",
    }),
  );

  // Daily attendance data
  const dailyAttendance = (charts.daily_attendance_trend || []).map((item) => ({
    date: item.date,
    present: Number(item.present || 0),
    absent: Number(item.absent || 0),
    late: Number(item.late || 0),
    leave: Number(item.leave || 0),
  }));

  // Student attendance comparison
  // Display up to 10 students to keep charts readable.
  const allStudentData = (charts.student_comparison || []).map((item) => ({
    name: item.student_name,
    student_id: item.student_id,
    total: Number(item.total_records || 0),
    rate: Number(item.attendance_rate || 0),
  }));

  const studentComparison = allStudentData.slice(0, 10);

  // Leave request distribution
  const leaveDistribution = (charts.leave_status_distribution || []).map(
    (item) => ({
      status: item.status,
      count: Number(item.count || 0),
      color: COLORS[item.status.toLowerCase()] || "#64748b",
    }),
  );

  const hasAttendanceData = attendanceDistribution.some(
    (item) => item.value > 0,
  );

  const hasDailyData = dailyAttendance.length > 0;

  const hasStudentData = studentComparison.length > 0;

  const hasLeaveData = leaveDistribution.some((item) => item.count > 0);

  // Applied filters returned by the backend
  const appliedFilters = report?.filters || {};

  const reportPeriod =
    appliedFilters.from_date || appliedFilters.to_date
      ? `${appliedFilters.from_date || "Beginning"} to ${
          appliedFilters.to_date || "Present"
        }`
      : "All Dates";

  const reportStatus = appliedFilters.attendance_status
    ? STATUS_LABELS[appliedFilters.attendance_status] ||
      appliedFilters.attendance_status
    : "All Statuses";

  const generatedDate = report?.generated_on || "-";

  const attendanceRate = Number(summary.attendance_rate || 0);

  return (
    <div className="page-container report-page attendance-analytics-page">
      {/* PAGE HEADING */}
      <div className="page-header">
        <h1>Reports</h1>

        <p>
          Generate analytical reports for student attendance and leave
          management.
        </p>
      </div>

      {/* FILTER PANEL */}
      <form
        onSubmit={handleGenerate}
        className="attendance-analytics-filter-panel"
      >
        <h3>Filter Attendance Report</h3>

        <p>
          Select an attendance date range and status to generate the report.
        </p>

        <div className="attendance-analytics-filter-grid">
          <div className="form-group">
            <label htmlFor="attendance-from-date">From Date</label>

            <input
              id="attendance-from-date"
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="attendance-to-date">To Date</label>

            <input
              id="attendance-to-date"
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="attendance-status">Attendance Status</label>

            <select
              id="attendance-status"
              name="attendance_status"
              value={filters.attendance_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>

        <div className="attendance-analytics-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset Filters
          </button>
        </div>
      </form>

      {/* ERROR */}
      {error && (
        <div className="report-error" role="alert">
          {error}

          <div>
            <button
              type="button"
              className="report-retry-button"
              onClick={() => loadReport(filters)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading-text">
          Generating attendance analytical report...
        </div>
      )}

      {/* ANALYTICAL REPORT */}
      {!loading && !error && report && (
        <div className="report-section report-print-area attendance-analytics-content">
          {/* PRINT-ONLY HEADER */}
          <div className="print-report-header">
            <h1>Attendance Analytical Report</h1>
            <p>Boarding Management System</p>
            <span>Generated on: {generatedDate}</span>
          </div>

          {/* WEBSITE REPORT HEADER */}
          <div className="report-section-header">
            <div>
              <h2>Attendance Analytical Report</h2>

              <p>Analyze student attendance patterns and leave requests.</p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
            >
              Download PDF
            </button>
          </div>

          {/* APPLIED FILTERS */}
          <div className="attendance-analytics-applied-filters">
            <div>
              <span>Attendance Date Period</span>
              <strong>{reportPeriod}</strong>
            </div>

            <div>
              <span>Attendance Status</span>
              <strong>{reportStatus}</strong>
            </div>

            <div>
              <span>Generated On</span>
              <strong>{generatedDate}</strong>
            </div>
          </div>

          {/* ATTENDANCE SUMMARY */}
          <h3 className="attendance-analytics-section-title">
            Attendance Summary
          </h3>

          <div className="report-summary-grid attendance-analytics-summary-grid">
            <div className="report-summary-card">
              <span>Total Attendance Records</span>
              <strong>{summary.total_attendance || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Present</span>
              <strong>{summary.present || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Absent</span>
              <strong>{summary.absent || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Late</span>
              <strong>{summary.late || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Leave</span>
              <strong>{summary.leave || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Attendance Rate</span>
              <strong>{attendanceRate.toFixed(2)}%</strong>
            </div>
          </div>

          <p className="attendance-analytics-summary-note">
            Attendance rate = (Present + Late) / Total Attendance Records × 100.
            The rate reflects the selected attendance records.
          </p>

          {/* ATTENDANCE CHARTS */}
          <h3 className="attendance-analytics-section-title">
            Attendance Performance Analysis
          </h3>

          <div className="attendance-analytics-chart-grid">
            {/* CHART 1: ATTENDANCE DISTRIBUTION */}
            <div className="attendance-analytics-chart-card">
              <h4>Attendance Status Distribution</h4>

              <p>Distribution of attendance records by status</p>

              {hasAttendanceData ? (
                <div className="attendance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        nameKey="name"
                      >
                        {attendanceDistribution.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="attendance-analytics-chart-empty">
                  No attendance data available.
                </div>
              )}
            </div>

            {/* CHART 2: DAILY ATTENDANCE */}
            <div className="attendance-analytics-chart-card">
              <h4>Daily Attendance Trend</h4>

              <p>Daily attendance status counts</p>

              {hasDailyData ? (
                <div className="attendance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyAttendance}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                        height={55}
                        minTickGap={12}
                      />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="present"
                        name="Present"
                        stackId="attendance"
                        fill={COLORS.present}
                      />

                      <Bar
                        dataKey="absent"
                        name="Absent"
                        stackId="attendance"
                        fill={COLORS.absent}
                      />

                      <Bar
                        dataKey="late"
                        name="Late"
                        stackId="attendance"
                        fill={COLORS.late}
                      />

                      <Bar
                        dataKey="leave"
                        name="Leave"
                        stackId="attendance"
                        fill={COLORS.leave}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="attendance-analytics-chart-empty">
                  No daily attendance records available.
                </div>
              )}
            </div>

            {/* CHART 3: STUDENT COMPARISON */}
            <div className="attendance-analytics-chart-card">
              <h4>Student Attendance Comparison</h4>

              <p>
                Recorded attendance rates for up to 10 students with the lowest
                rates
              </p>

              {hasStudentData ? (
                <div className="attendance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studentComparison}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fontSize: 10 }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={125}
                        tick={{ fontSize: 10 }}
                      />

                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(2)}%`,
                          "Attendance Rate",
                        ]}
                      />

                      <Bar
                        dataKey="rate"
                        name="Attendance Rate"
                        fill={COLORS.present}
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="attendance-analytics-chart-empty">
                  No student comparison data available.
                </div>
              )}
            </div>

            {/* CHART 4: LEAVE STATUS */}
            <div className="attendance-analytics-chart-card">
              <h4>Leave Request Status Distribution</h4>

              <p>Approved, Pending, and Rejected leave requests</p>

              {hasLeaveData ? (
                <div className="attendance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={leaveDistribution}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="status" tick={{ fontSize: 11 }} />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Leave Requests"
                        radius={[5, 5, 0, 0]}
                      >
                        {leaveDistribution.map((item) => (
                          <Cell key={item.status} fill={item.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="attendance-analytics-chart-empty">
                  No leave requests available.
                </div>
              )}
            </div>
          </div>

          {/* LEAVE REQUEST SUMMARY */}
          <h3 className="attendance-analytics-section-title">
            Leave Request Summary
          </h3>

          <div className="report-summary-grid attendance-analytics-leave-grid">
            <div className="report-summary-card">
              <span>Total Leave Requests</span>
              <strong>{summary.total_leave_requests || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Approved</span>
              <strong>{summary.approved_leave || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Pending</span>
              <strong>{summary.pending_leave || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Rejected</span>
              <strong>{summary.rejected_leave || 0}</strong>
            </div>
          </div>

          {/* DESCRIPTIVE ANALYSIS */}
          <div className="attendance-analytics-analysis">
            <h3>Descriptive Attendance Analysis</h3>

            <p>
              The following observations are calculated from the selected
              attendance records and related leave requests.
            </p>

            <ul>
              {(report.analysis || []).map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceReport;
