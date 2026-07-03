import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAppDispatch } from '../../app/hooks'
import { setToken, setUser } from '../../features/auth/authSlice'
import { connectSocket } from '../../api/socket'
import styles from './AuthPage.module.css'

type Step = 'form' | 'verify'

export function SignupPage() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const [step,    setStep]    = useState<Step>('form')
  const [userId,  setUserId]  = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      setUserId(res.data.userId)
      setStep('verify')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { userId, code: otp })
      dispatch(setToken(res.data.token))
      dispatch(setUser(res.data.user))
      connectSocket(res.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    await api.post('/auth/resend-otp', { userId })
    setError('New code sent!')
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

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form
              key="form"
              className={styles.form}
              onSubmit={handleSignup}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className={styles.title}>Create account</h1>
              <p className={styles.subtitle}>Join the orbits that matter to you</p>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.fields}>
                <input className={styles.input} placeholder="Display name" value={form.displayName} onChange={set('displayName')} required />
                <input className={styles.input} placeholder="Username" value={form.username} onChange={set('username')} required autoCapitalize="none" />
                <input className={styles.input} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
                <input className={styles.input} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required minLength={6} />
              </div>

              <motion.button
                className={styles.btn}
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? 'Creating…' : 'Create Account'}
              </motion.button>

              <p className={styles.switchLink}>
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="verify"
              className={styles.form}
              onSubmit={handleVerify}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className={styles.title}>Check your email</h1>
              <p className={styles.subtitle}>We sent a 6-digit code to <strong>{form.email}</strong></p>

              {error && <p className={styles.error}>{error}</p>}

              <input
                className={`${styles.input} ${styles.otpInput}`}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                required
              />

              <motion.button className={styles.btn} type="submit" disabled={loading || otp.length < 6} whileTap={{ scale: 0.97 }}>
                {loading ? 'Verifying…' : 'Verify Email'}
              </motion.button>

              <button type="button" className={styles.textBtn} onClick={resendOtp}>
                Resend code
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
