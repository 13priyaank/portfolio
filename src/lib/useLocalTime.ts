import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
})

/** Current time in Vadodara (IST), refreshed every 30 seconds. */
export function useLocalTime() {
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt.format(new Date())), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}
