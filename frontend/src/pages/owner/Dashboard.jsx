import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import {
  Users,
  BedDouble,
  CreditCard,
  CalendarCheck,
  Wrench,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  
  const [counts, setCounts] = useState({
    students: null,
    rooms: null,
    feeRecords: null,
    attendance: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const results = await Promise.allSettled([
          apiRequest("/students"),
          apiRequest("/rooms"),
          apiRequest("/fee-records"),
          apiRequest("/attendance"),
        ]);

        const getCount = (result) =>
          result.status === "fulfilled" && Array.isArray(result.value)
            ? result.value.length
            : null;

        setCounts({
          students: getCount(results[0]),
          rooms: getCount(results[1]),
          feeRecords: getCount(results[2]),
          attendance: getCount(results[3]),
        });
      } catch (error) {
        console.error("Failed to load dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);


  // retriew student info
  const stats = [
    {
      title: "Students",
      value: loading ? "..." : (counts.students ?? "—"),
      subtitle: "Registered residents",
      icon: Users,
    },
    {
      title: "Rooms",
      value: loading ? "..." : (counts.rooms ?? "—"),
      subtitle: "Boarding rooms",
      icon: BedDouble,
    },
    {
      title: "Fee Records",
      value: loading ? "..." : (counts.feeRecords ?? "—"),
      subtitle: "Total fee records",
      icon: CreditCard,
    },
    {
      title: "Attendance",
      value: loading ? "..." : (counts.attendance ?? "—"),
      subtitle: "Total attendance records",
      icon: CalendarCheck,
    },
  ];


  const quickActions = [
    {
      title: "Student & Room Allocation",
      description: "Manage student profiles, rooms, and allocations.",
      icon: Users,
      path: "/owner/student-room-management",
    },
    {
      title: "Boarding Fee & Payments",
      description: "Manage fee records and student payments.",
      icon: CreditCard,
      path: "/owner/fee-payments",
    },
    {
      title: "Attendance Management",
      description: "Record attendance and review leave requests.",
      icon: CalendarCheck,
      path: "/owner/attendance-management",
    },
    {
      title: "Boarding Operations",
      description: "Review maintenance requests and complaints.",
      icon: Wrench,
      path: "/owner/operations",
    },
    {
      title: "Communication & Turnover",
      description: "Manage announcements and student feedback.",
      icon: MessageSquare,
      path: "/owner/communication-turnover",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">BOARDING MANAGEMENT</p>
          <h2>Overview</h2>
          <p>
            Monitor the main boarding operations and quickly access each
            management area.
          </p>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card dashboard-stat-card" key={stat.title}>
              <div className="stat-card-content">
                <span className="stat-card-title">{stat.title}</span>

                <strong className="stat-card-value">{stat.value}</strong>

                <span className="stat-card-subtitle">{stat.subtitle}</span>
              </div>

              <div className="stat-card-icon">
                <Icon size={23} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h3>Quick Management</h3>
            <p>Open the main boarding management functions.</p>
          </div>
        </div>

        <div className="dashboard-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                className="dashboard-action-card"
                onClick={() => navigate(action.path)}
              >
                <div className="dashboard-action-icon">
                  <Icon size={22} />
                </div>

                <div className="dashboard-action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>

                <ArrowRight className="dashboard-action-arrow" size={19} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
