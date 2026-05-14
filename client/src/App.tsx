import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashbord"
import CreatePoll from "./pages/CreatePoll"
import Analytics from "./pages/Analytics"
import PublicPoll from "./pages/PublicPoll"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard /> }/>
        <Route path="/polls/create" element={<CreatePoll />} />
        <Route path="/polls/:pollId" element={<Analytics />} />
        <Route path="/p/:pollId" element={<PublicPoll />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
