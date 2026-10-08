import { Navigate, Route, Routes } from 'react-router-dom'
import MembershipRegistrationPage from './pages/MembershipRegistrationPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<MembershipRegistrationPage />} />
      <Route path="/manage" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  )
}
