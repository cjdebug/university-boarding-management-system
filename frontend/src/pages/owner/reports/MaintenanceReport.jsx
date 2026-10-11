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
  LineChart,
  Line,
} from "recharts";

import { apiRequest } from "../../../services/api";

// Maintenance chart colors
const COLORS = {
  pending: "#e9ae42",
  in_progress: "#527ca8",
  completed: "#176b38",
  green: "#176b38",
  blue: "#527ca8",
};

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const initialFilters = {
  from_date: "",
  to_date: "",
  request_status: "",
};

function MaintenanceReport() {
  const [report, setReport] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch maintenance report using selected filters
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

      if (selectedFilters.request_status) {
        params.append("request_status", selectedFilters.request_status);
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/maintenance-reports?${queryString}`
        : "/maintenance-reports";

      const data = await apiRequest(endpoint);

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load maintenance report.");
    } finally {
      setLoading(false);
    }
  };

  // Load the initial unfiltered report
  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  // Update filter inputs
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Generate filtered report
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

  // Reset to the full report
  const handleReset = () => {
    setFilters({ ...initialFilters });
    loadReport(initialFilters);
  };

  // Export the displayed analytical report
  const handlePrint = () => {
    if (!loading && !error && report) {
      window.print();
    }
  };

  const summary = report?.summary || {};
  const charts = report?.charts || {};

  // Maintenance status distribution
  const statusDistribution = (charts.status_distribution || []).map((item) => {
    const key = String(item.status || "")
      .toLowerCase()
      .replace(/\s+/g, "_");

    return {
      name: item.status,
      value: Number(item.count || 0),
      color: COLORS[key] || "#64748b",
    };
  });

  // Maintenance issue type comparison
  const issueTypeData = (charts.issue_type_distribution || []).map((item) => ({
    name: item.issue_type,
    count: Number(item.count || 0),
  }));

  // Room maintenance comparison
  const roomData = (charts.requests_by_room || []).map((item) => ({
    name: item.room_number,
    count: Number(item.count || 0),
  }));

  // Monthly maintenance request trend
  const monthlyTrend = (charts.monthly_request_trend || []).map((item) => ({
    month: item.month,
    count: Number(item.count || 0),
  }));

  // Use a small number of categories in the charts
  // to keep the PDF readable.
  const visibleIssueTypes = issueTypeData.slice(0, 10);
  const visibleRooms = roomData.slice(0, 10);

  const hasStatusData = statusDistribution.some((item) => item.value > 0);

  const hasIssueTypeData = visibleIssueTypes.length > 0;
  const hasRoomData = visibleRooms.length > 0;
  const hasMonthlyData = monthlyTrend.length > 0;

  // Applied filters are taken from the API response,
  // rather than unsaved filter input values.
  const appliedFilters = report?.filters || {};

  const reportPeriod =
    appliedFilters.from_date || appliedFilters.to_date
      ? `${appliedFilters.from_date || "Beginning"} to ${
          appliedFilters.to_date || "Present"
        }`
      : "All Dates";

  const reportStatus = appliedFilters.request_status
    ? STATUS_LABELS[appliedFilters.request_status] ||
      appliedFilters.request_status
    : "All Statuses";

  const generatedDate = report?.generated_on || "-";

  const completionRate = Number(summary.completion_rate || 0);

  return (
    <div className="page-container report-page maintenance-analytics-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Reports</h1>

        <p>
          Generate analytical reports for boarding maintenance requests and
          operational performance.
        </p>
      </div>

      {/* REPORT FILTERS */}
      <form
        onSubmit={handleGenerate}
        className="maintenance-analytics-filter-panel"
      >
        <h3>Filter Maintenance Report</h3>

        <p>
          Select a request date range and maintenance status to generate the
          report.
        </p>

        <div className="maintenance-analytics-filter-grid">
          <div className="form-group">
            <label htmlFor="maintenance-from-date">From Date</label>

            <input
              id="maintenance-from-date"
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maintenance-to-date">To Date</label>

            <input
              id="maintenance-to-date"
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maintenance-status">Maintenance Status</label>

            <select
              id="maintenance-status"
              name="request_status"
              value={filters.request_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="maintenance-analytics-actions">
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

      {/* ERROR MESSAGE */}
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

      {/* LOADING MESSAGE */}
      {loading && (
        <div className="loading-text">
          Generating maintenance analytical report...
        </div>
      )}

      {/* ANALYTICAL REPORT CONTENT */}
      {!loading && !error && report && (
        <div className="report-section report-print-area maintenance-analytics-content">
          {/* PDF-ONLY HEADER */}
          <div className="print-report-header">
            <h1>Maintenance Analytical Report</h1>
            <p>Boarding Management System</p>
            <span>Generated on: {generatedDate}</span>
          </div>

          {/* WEBSITE REPORT HEADER */}
          <div className="report-section-header">
            <div>
              <h2>Maintenance Analytical Report</h2>

              <p>
                Analyze maintenance requests, issue patterns, room conditions,
                and completion performance.
              </p>
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
          <div className="maintenance-analytics-applied-filters">
            <div>
              <span>Request Date Period</span>
              <strong>{reportPeriod}</strong>
            </div>

            <div>
              <span>Maintenance Status</span>
              <strong>{reportStatus}</strong>
            </div>

            <div>
              <span>Generated On</span>
              <strong>{generatedDate}</strong>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <h3 className="maintenance-analytics-section-title">
            Maintenance Summary
          </h3>

          <div className="report-summary-grid maintenance-analytics-summary-grid">
            <div className="report-summary-card">
              <span>Total Requests</span>
              <strong>{summary.total_requests || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Pending</span>
              <strong>{summary.pending || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>In Progress</span>
              <strong>{summary.in_progress || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Completed</span>
              <strong>{summary.completed || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Unresolved</span>
              <strong>{summary.unresolved || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Completion Rate</span>
              <strong>{completionRate.toFixed(2)}%</strong>
            </div>
          </div>

          <p className="maintenance-analytics-summary-note">
            Completion Rate = Completed Requests ÷ Total Requests × 100. Results
            are based on the selected maintenance requests.
          </p>

          {/* ANALYTICAL CHARTS */}
          <h3 className="maintenance-analytics-section-title">
            Maintenance Performance Analysis
          </h3>

          <div className="maintenance-analytics-chart-grid">
            {/* CHART 1: STATUS DISTRIBUTION */}
            <div className="maintenance-analytics-chart-card">
              <h4>Maintenance Status Distribution</h4>

              <p>
                Distribution of maintenance requests by their current status.
              </p>

              {hasStatusData ? (
                <div className="maintenance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        nameKey="name"
                      >
                        {statusDistribution.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="maintenance-analytics-chart-empty">
                  No maintenance status data available.
                </div>
              )}
            </div>

            {/* CHART 2: ISSUE TYPE DISTRIBUTION */}
            <div className="maintenance-analytics-chart-card">
              <h4>Requests by Issue Type</h4>

              <p>Most frequently reported maintenance issue categories.</p>

              {hasIssueTypeData ? (
                <div className="maintenance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visibleIssueTypes}
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
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={105}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Requests"
                        fill={COLORS.blue}
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="maintenance-analytics-chart-empty">
                  No maintenance issue data available.
                </div>
              )}
            </div>

            {/* CHART 3: REQUESTS BY ROOM */}
            <div className="maintenance-analytics-chart-card">
              <h4>Maintenance Requests by Room</h4>

              <p>
                Rooms with the highest number of reported maintenance requests.
              </p>

              {hasRoomData ? (
                <div className="maintenance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visibleRooms}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 15,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Requests"
                        fill={COLORS.green}
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="maintenance-analytics-chart-empty">
                  No room maintenance data available.
                </div>
              )}
            </div>

            {/* CHART 4: MONTHLY REQUEST TREND */}
            <div className="maintenance-analytics-chart-card">
              <h4>Monthly Maintenance Request Trend</h4>

              <p>Number of maintenance requests submitted each month.</p>

              {hasMonthlyData ? (
                <div className="maintenance-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyTrend}
                      margin={{
                        top: 15,
                        right: 15,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Requests"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="maintenance-analytics-chart-empty">
                  No monthly maintenance data available.
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTIVE ANALYSIS */}
          <div className="maintenance-analytics-analysis">
            <h3>Descriptive Maintenance Analysis</h3>

            <p>
              The following observations are calculated from the selected
              maintenance request records.
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

export default MaintenanceReport;
