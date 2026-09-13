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

      {announcements.map((announcement) => (
        <div key={announcement.announcement_id}>
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
          <p>{announcement.announcement_date}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default ViewAnnouncements;
