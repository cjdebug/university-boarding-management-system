import { Bell, Search, UserRound } from 'lucide-react'

function TopNavbar({
    userType,
    userName,
    userId,
}) {
    const isOwner = userType === 'owner'

    return (
        <header className="top-navbar">
            <div className="navbar-left">
                {isOwner ? (
            <>
                <h1>Dashboard</h1>
                <p>
                    Welcome back! Here's the overview of your boarding operations.
                </p>
            </>
        ) : (
            <>
                <h1>Welcome back, {userName}!</h1>
                    <p>
                        Here's your boarding information and recent updates.
                    </p>
            </>
        )}
            </div>

        <div className="navbar-right">
            {isOwner && (
                <div className="navbar-search">
            <Search size={19} />
            <input
                type="text"
                placeholder="Search students, rooms,..."
            />
            </div>
        )}

        <button
            className="notification-button"
            type="button"
            aria-label="Notifications"
        >
            <Bell size={25} strokeWidth={1.8} />

            <span className="notification-badge">
            3
            </span>
        </button>

        <div className="navbar-profile">
            <div className="navbar-profile-avatar">
            <UserRound size={23} />
            </div>

            <div className="navbar-profile-info">
                {isOwner ? (
                <>
                <strong>Boarding Owner</strong>
                <span>Administrator</span>
                </>
            ) : (
                <>
                <strong>{userName}</strong>
                <span>{userId}</span>
                </>
            )}
            </div>
        </div>
        </div>
    </header>
)
}

export default TopNavbar