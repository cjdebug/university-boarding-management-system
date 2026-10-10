import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function FeePaymentManagement() {
  const navigate = useNavigate();

  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [sendingReminders, setSendingReminders] = useState(false);

  const handleSendReminders = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to send payment reminders for overdue fee records?",
    );

    if (!confirmed) {
      return;
    }

    setReminderMessage("");
    setReminderError("");
    setSendingReminders(true);

    try {
      const data = await apiRequest("/notifications/payment-reminders", {
        method: "POST",
      });

      setReminderMessage(
        `${data.message} ${data.reminders_created} reminder(s) created.`,
      );
    } catch (err) {
      setReminderError(err.message);
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Boarding Fee & Payments</h1>
        <p>Manage student fee records, payments, and payment history.</p>
      </div>

      {reminderMessage && (
        <div className="message-success">{reminderMessage}</div>
      )}

      {reminderError && <div className="message-error">{reminderError}</div>}

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/fee-records/add")}
        >
          <h3>Create Fee Record</h3>
          <p>Add a new boarding fee record for a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/fee-records")}
        >
          <h3>View Fee Records</h3>
          <p>Review all student fee records and payment status.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/payments/add")}
        >
          <h3>Record Payment</h3>
          <p>Record a full or partial payment made by a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/payments")}
        >
          <h3>Payment History</h3>
          <p>View previously recorded student payments.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/fee-records/overdue")}
        >
          <h3>Overdue Fee Records</h3>
          <p>
            View fee records that are past their due date and not fully paid.
          </p>
        </div>

        <div className="action-card">
          <h3>Payment Reminders</h3>

          <p>Send reminders to students who have overdue payments.</p>

          <button
            type="button"
            className="table-action-btn table-action-edit"
            onClick={handleSendReminders}
            disabled={sendingReminders}
          >
            {sendingReminders ? "Sending..." : "Send Payment Reminders"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeePaymentManagement;
