import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toast } from '../ui/Toast'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <Toast />
    </div>
  )
}
