import TokenStore from "@/services/tokenStore"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = TokenStore.getAccessToken()
    if (!token) return <Navigate to="/login" replace />
    return <>{children}</>
}