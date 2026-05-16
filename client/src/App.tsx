import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashbord"
import CreatePoll from "./pages/CreatePoll"
import Analytics from "./pages/Analytics"
import PublicPoll from "./pages/PublicPoll"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "./pages/HomePage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/p/:pollId" element={<PublicPoll />} />
        <Route path="/" element={<HomePage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/polls/create" element={
          <ProtectedRoute><CreatePoll /></ProtectedRoute>
        } />
        <Route path="/polls/:pollId" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App