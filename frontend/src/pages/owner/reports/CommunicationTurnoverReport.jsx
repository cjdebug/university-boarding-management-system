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

const COLORS = {
  green: "#176b38",
  lightGreen: "#70b997",
  blue: "#527ca8",
  yellow: "#e9ae42",
  red: "#dc5656",
};

const announcementColors = {
  active: COLORS.green,
  inactive: COLORS.red,
};

const feedbackColors = {
  submitted: COLORS.yellow,
  reviewed: COLORS.blue,
  resolved: COLORS.green,
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  submitted: "Submitted",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

const initialFilters = {
  from_date: "",
  to_date: "",
  announcement_status: "",
  feedback_status: "",
};

function CommunicationTurnoverReport() {
  const [report, setReport] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch report from FastAPI
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

      if (selectedFilters.announcement_status) {
        params.append(
          "announcement_status",
          selectedFilters.announcement_status,
        );
      }

      if (selectedFilters.feedback_status) {
        params.append("feedback_status", selectedFilters.feedback_status);
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/communication-turnover-reports?${queryString}`
        : "/communication-turnover-reports";

      const data = await apiRequest(endpoint);

      setReport(data);
    } catch (err) {
      setError(
        err.message || "Failed to load communication analytical report.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load unfiltered report when page opens
  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  // Update filter values
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

  // Clear filters and reload complete report
  const handleReset = () => {
    setFilters({ ...initialFilters });
    loadReport(initialFilters);
  };

  // Export displayed report using browser PDF printing
  const handlePrint = () => {
    if (!loading && !error && report) {
      window.print();
    }
  };

  // Backend report data
  const summary = report?.summary || {};
  const charts = report?.charts || {};

  // Announcement status distribution
  const announcementStatusData = (
    charts.announcement_status_distribution || []
  ).map((item) => {
    const status = String(item.status || "").toLowerCase();

    return {
      name: item.status,
      value: Number(item.count || 0),
      color: announcementColors[status] || COLORS.blue,
    };
  });

  // Announcement audience comparison
  const audienceData = (charts.announcements_by_audience || []).map((item) => ({
    name: item.audience,
    count: Number(item.count || 0),
  }));

  // Feedback category comparison
  const categoryData = (charts.feedback_by_category || []).map((item) => ({
    name: item.feedback_type,
    count: Number(item.count || 0),
  }));

  // Feedback status distribution
  const feedbackStatusData = (charts.feedback_status_distribution || []).map(
    (item) => {
      const status = String(item.status || "").toLowerCase();

      return {
        name: item.status,
        value: Number(item.count || 0),
        color: feedbackColors[status] || COLORS.blue,
      };
    },
  );

  // Keep chart labels readable
  const visibleAudienceData = audienceData.slice(0, 10);
  const visibleCategoryData = categoryData.slice(0, 10);

  const hasAnnouncementStatusData = announcementStatusData.some(
    (item) => item.value > 0,
  );

  const hasAudienceData = visibleAudienceData.length > 0;

  const hasCategoryData = visibleCategoryData.length > 0;

  const hasFeedbackStatusData = feedbackStatusData.some(
    (item) => item.value > 0,
  );

  // Filters applied by the backend
  const appliedFilters = report?.filters || {};

  const reportPeriod =
    appliedFilters.from_date || appliedFilters.to_date
      ? `${appliedFilters.from_date || "Beginning"} to ${
          appliedFilters.to_date || "Present"
        }`
      : "All Dates";

  const announcementStatus = appliedFilters.announcement_status
    ? STATUS_LABELS[appliedFilters.announcement_status] ||
      appliedFilters.announcement_status
    : "All Statuses";

  const feedbackStatus = appliedFilters.feedback_status
    ? STATUS_LABELS[appliedFilters.feedback_status] ||
      appliedFilters.feedback_status
    : "All Statuses";

  const generatedDate = report?.generated_on || "-";

  const activeRate = Number(summary.announcement_active_rate || 0);

  const resolutionRate = Number(summary.feedback_resolution_rate || 0);

  const responseRate = Number(summary.feedback_response_rate || 0);

  return (
    <div className="page-container report-page communication-analytics-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Reports</h1>

        <p>
          Generate analytical reports for boarding announcements and student
          feedback.
        </p>
      </div>

      {/* FILTER PANEL */}
      <form
        onSubmit={handleGenerate}
        className="communication-analytics-filter-panel"
      >
        <h3>Filter Communication & Turnover Report</h3>

        <p>
          Select a reporting period and announcement or feedback statuses to
          generate the report.
        </p>

        <div className="communication-analytics-filter-grid">
          <div className="form-group">
            <label htmlFor="communication-from-date">From Date</label>

            <input
              id="communication-from-date"
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="communication-to-date">To Date</label>

            <input
              id="communication-to-date"
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="communication-announcement-status">
              Announcement Status
            </label>

            <select
              id="communication-announcement-status"
              name="announcement_status"
              value={filters.announcement_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="communication-feedback-status">
              Feedback Status
            </label>

            <select
              id="communication-feedback-status"
              name="feedback_status"
              value={filters.feedback_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="communication-analytics-actions">
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
          Generating communication analytical report...
        </div>
      )}

      {/* REPORT CONTENT */}
      {!loading && !error && report && (
        <div className="report-section report-print-area communication-analytics-content">
          {/* PDF-ONLY HEADER */}
          <div className="print-report-header">
            <h1>Communication &amp; Turnover Analytical Report</h1>
            <p>Boarding Management System</p>
            <span>Generated on: {generatedDate}</span>
          </div>

          {/* WEBSITE REPORT HEADER */}
          <div className="report-section-header">
            <div>
              <h2>Communication &amp; Turnover Analytical Report</h2>

              <p>
                Analyze announcements, communication audiences, and student
                feedback.
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
          <div className="communication-analytics-applied-filters">
            <div>
              <span>Reporting Period</span>
              <strong>{reportPeriod}</strong>
            </div>

            <div>
              <span>Announcement Status</span>
              <strong>{announcementStatus}</strong>
            </div>

            <div>
              <span>Feedback Status</span>
              <strong>{feedbackStatus}</strong>
            </div>

            <div>
              <span>Generated On</span>
              <strong>{generatedDate}</strong>
            </div>
          </div>

          {/* ANNOUNCEMENT SUMMARY */}
          <h3 className="communication-analytics-section-title">
            Announcement Summary
          </h3>

          <div className="report-summary-grid communication-analytics-summary-grid">
            <div className="report-summary-card">
              <span>Total Announcements</span>
              <strong>{summary.total_announcements || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Active</span>
              <strong>{summary.active_announcements || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Inactive</span>
              <strong>{summary.inactive_announcements || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Pinned</span>
              <strong>{summary.pinned_announcements || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Active Rate</span>
              <strong>{activeRate.toFixed(2)}%</strong>
            </div>
          </div>

          {/* FEEDBACK SUMMARY */}
          <h3 className="communication-analytics-section-title">
            Student Feedback Summary
          </h3>

          <div className="report-summary-grid communication-analytics-summary-grid">
            <div className="report-summary-card">
              <span>Total Feedback</span>
              <strong>{summary.total_feedback || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Submitted</span>
              <strong>{summary.submitted_feedback || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Reviewed</span>
              <strong>{summary.reviewed_feedback || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Resolved</span>
              <strong>{summary.resolved_feedback || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Resolution Rate</span>
              <strong>{resolutionRate.toFixed(2)}%</strong>
            </div>

            <div className="report-summary-card">
              <span>Owner Response Rate</span>
              <strong>{responseRate.toFixed(2)}%</strong>
            </div>
          </div>

          {/* ANALYTICAL CHARTS */}
          <h3 className="communication-analytics-section-title">
            Communication &amp; Feedback Analysis
          </h3>

          <div className="communication-analytics-chart-grid">
            {/* ANNOUNCEMENT STATUS */}
            <div className="communication-analytics-chart-card">
              <h4>Announcement Status Distribution</h4>

              <p>Active versus inactive announcements</p>

              {hasAnnouncementStatusData ? (
                <div className="communication-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={announcementStatusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        nameKey="name"
                      >
                        {announcementStatusData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="communication-analytics-chart-empty">
                  No announcement status data available.
                </div>
              )}
            </div>

            {/* ANNOUNCEMENTS BY AUDIENCE */}
            <div className="communication-analytics-chart-card">
              <h4>Announcements by Audience</h4>

              <p>Number of announcements targeted at each audience</p>

              {hasAudienceData ? (
                <div className="communication-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visibleAudienceData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 15,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                      />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Announcements"
                        fill={COLORS.blue}
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="communication-analytics-chart-empty">
                  No audience data available.
                </div>
              )}
            </div>

            {/* FEEDBACK BY CATEGORY */}
            <div className="communication-analytics-chart-card">
              <h4>Feedback by Category</h4>

              <p>Most frequently reported feedback categories</p>

              {hasCategoryData ? (
                <div className="communication-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visibleCategoryData}
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
                        name="Feedback"
                        fill={COLORS.green}
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="communication-analytics-chart-empty">
                  No feedback category data available.
                </div>
              )}
            </div>

            {/* FEEDBACK STATUS */}
            <div className="communication-analytics-chart-card">
              <h4>Feedback Status Distribution</h4>

              <p>Submitted, reviewed, and resolved feedback</p>

              {hasFeedbackStatusData ? (
                <div className="communication-analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedbackStatusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        nameKey="name"
                      >
                        {feedbackStatusData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="communication-analytics-chart-empty">
                  No feedback status data available.
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTIVE ANALYSIS */}
          <div className="communication-analytics-analysis">
            <h3>Descriptive Communication Analysis</h3>

            <p>
              The following observations are calculated from the selected
              announcement and feedback records.
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

export default CommunicationTurnoverReport;
