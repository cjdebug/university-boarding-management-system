import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import {
  BedDouble,
  CalendarCheck,
  CreditCard,
  Megaphone,
  MessageSquare,
  Wrench,
  ArrowRight,
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();

    const [roomAllocation, setRoomAllocation] = useState(null);
    const [roomLoading, setRoomLoading] = useState(true);

    const [attendancePercentage, setAttendancePercentage] = useState(null);
    const [attendanceLoading, setAttendanceLoading] = useState(true);

    const [feeRecords, setFeeRecords] = useState([]);
    const [feeLoading, setFeeLoading] = useState(true);

    useEffect(() => {
      const fetchRoomAllocation = async () => {
        try {
          const data = await apiRequest("/room-allocations/my");
          setRoomAllocation(data);
        } catch (error) {
          setRoomAllocation(null);
        } finally {
          setRoomLoading(false);
        }
      };

      fetchRoomAllocation();
    }, []);

    useEffect(() => {
      const fetchAttendancePercentage = async () => {
        try {
          const data = await apiRequest("/attendance/my/percentage");
          setAttendancePercentage(data);
        } catch (error) {
          setAttendancePercentage(null);
        } finally {
          setAttendanceLoading(false);
        }
      };

      fetchAttendancePercentage();
    }, []);

    useEffect(() => {
      const fetchFeeRecords = async () => {
        try {
          const data = await apiRequest("/fee-records/my");
          setFeeRecords(data);
        } catch (error) {
          setFeeRecords([]);
        } finally {
          setFeeLoading(false);
        }
      };

      fetchFeeRecords();
    }, []);

  const pendingFees = feeRecords.filter(
    (fee) => fee.fee_status?.toLowerCase() === "pending",
  );

  const overdueFees = feeRecords.filter(
    (fee) => fee.fee_status?.toLowerCase() === "overdue",
  );

  const unpaidFees = feeRecords.filter(
    (fee) => !["paid"].includes(fee.fee_status?.toLowerCase()),
  );

  let feeStatus = "No Fees";
  let feeSubtitle = "No fee records found";

  if (feeRecords.length > 0) {
    if (overdueFees.length > 0) {
      feeStatus = "Overdue";
      feeSubtitle = `${overdueFees.length} overdue fee${
        overdueFees.length > 1 ? "s" : ""
      }`;
    } else if (pendingFees.length > 0) {
      feeStatus = "Pending";
      feeSubtitle = `${pendingFees.length} pending fee${
        pendingFees.length > 1 ? "s" : ""
      }`;
    } else if (unpaidFees.length === 0) {
      feeStatus = "Paid";
      feeSubtitle = "All fees paid";
    }
  }

  const stats = [
    {
      title: "Room Allocation",
      value: roomLoading
        ? "..."
        : roomAllocation
          ? `Room ${roomAllocation.room_id}`
          : "Not Assigned",
      subtitle: roomAllocation
        ? `Bed ${roomAllocation.bed_number || "-"}`
        : "No active room allocation",
      icon: BedDouble,
    },
    {
      title: "Attendance",
      value: attendanceLoading
        ? "..."
        : attendancePercentage
          ? `${attendancePercentage.attendance_percentage}%`
          : "No Data",
      subtitle: attendancePercentage
        ? `${attendancePercentage.present} present / ${attendancePercentage.total_attendance} records`
        : "No attendance records",
      icon: CalendarCheck,
    },
    {
      title: "Fee Status",
      value: feeLoading ? "..." : feeStatus,
      subtitle: feeLoading ? "Checking fee records..." : feeSubtitle,
      icon: CreditCard,
    },
    {
      title: "Announcements",
      value: "—",
      subtitle: "Recent boarding updates",
      icon: Megaphone,
    },
  ];

  const quickActions = [
    {
      title: "My Room & Allocation",
      description: "View your current boarding room and allocation details.",
      icon: BedDouble,
      path: "/student/room-allocation",
    },
    {
      title: "Attendance",
      description: "View attendance and manage your leave requests.",
      icon: CalendarCheck,
      path: "/student/attendance-management",
    },
    {
      title: "Boarding Fee & Payments",
      description: "View your fees and payment history.",
      icon: CreditCard,
      path: "/student/fee-payments",
    },
    {
      title: "Announcements & Messages",
      description: "Read the latest boarding announcements.",
      icon: Megaphone,
      path: "/student/announcements",
    },
    {
      title: "Student Feedback",
      description: "Submit and review your feedback.",
      icon: MessageSquare,
      path: "/student/feedback-management",
    },
    {
      title: "My Requests",
      description: "Submit maintenance requests and complaints.",
      icon: Wrench,
      path: "/student/operations",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">STUDENT PORTAL</p>

          <h2>My Boarding Overview</h2>

          <p>
            View your boarding information and quickly access your main student
            services.
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
            <h3>Quick Access</h3>

            <p>Open the main student boarding services.</p>
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

export default StudentDashboard;
