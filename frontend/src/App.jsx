import { Navigate, Route, Routes } from 'react-router-dom'
import MembershipRegistrationPage from './pages/MembershipRegistrationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<MembershipRegistrationPage />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  )
}
