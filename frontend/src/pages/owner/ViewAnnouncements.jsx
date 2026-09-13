import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiRequest("/announcements");
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <p>Loading announcements...</p>;
  }

  return (
    <div>
      <h1>Announcements</h1>

      {error && <p>{error}</p>}

      {!error && announcements.length === 0 && <p>No announcements found.</p>}

      {announcements.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
              <th>Audience</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.announcement_id}>
                <td>{announcement.announcement_id}</td>
                <td>{announcement.title}</td>
                <td>{announcement.message}</td>
                <td>{announcement.announcement_date}</td>
                <td>{announcement.audience}</td>
                <td>{announcement.announcement_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewAnnouncements;
