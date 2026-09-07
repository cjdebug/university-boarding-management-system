import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom'

import Login from '../pages/auth/Login'

import OwnerLayout from '../components/layout/OwnerLayout'
import StudentLayout from '../components/layout/StudentLayout'

import OwnerDashboard from '../pages/owner/Dashboard'
import StudentDashboard from '../pages/student/Dashboard'

function AppRoutes() {
return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            <Route path="/owner" element={<OwnerLayout />}>
                <Route
                    path="dashboard"
                    element={<OwnerDashboard />}
            />
            </Route>

            <Route
                path="/student"
                element={<StudentLayout />}
            >
            <Route
                path="dashboard"
                element={<StudentDashboard />}
            />
            </Route>
        </Routes>
    </BrowserRouter>
)
}

export default AppRoutes