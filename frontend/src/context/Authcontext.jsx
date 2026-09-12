import { createContext, useState, useEffect } from 'react'
import Api from '../services/Api'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	// Try to restore user from API on mount
	useEffect(() => {
		let mounted = true
		Api.get('/auth/me')
			.then(res => { if (mounted) setUser(res.data) })
			.catch(() => {})
			.finally(() => { if (mounted) setLoading(false) })
		return () => { mounted = false }
	}, [])

	const logout = async () => {
		try {
			await Api.post('/auth/logout')
		} catch (err) {
			console.error('logout error', err?.response?.data || err.message)
		} finally {
			setUser(null)
		}
	}

	const value = { user, setUser, logout, loading }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
