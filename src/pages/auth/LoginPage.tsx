import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { login, clearError } from '../../features/auth/authSlice'
import { connectSocket } from '../../api/socket'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      connectSocket(result.payload.token)
      navigate('/')
    }
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={`${styles.card} glass`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className={styles.brand}>
          <img src="/guffgaaf-logo.png" alt="GuffGaaf" className={styles.brandLogo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to GuffGaaf</p>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.fields}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            className={styles.btn}
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>

          <p className={styles.switchLink}>
            New to GuffGaaf? <Link to="/signup">Create account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
