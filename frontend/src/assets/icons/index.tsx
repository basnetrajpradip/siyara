// Brand icons lucide doesn't ship. Each one uses currentColor, so `text-*` classes color it,
// and is aria-hidden: give the surrounding link an aria-label ("Siyara on Instagram").
import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.52l.48-2.9H13.5V8.7c0-.84.24-1.41 1.44-1.41h1.56V4.7c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.12H7.9v2.9h2.52V21h3.08Z" />
    </svg>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  )
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.4 2.1 1.8 3.5 4 3.8v3.1c-1.5 0-2.9-.5-4-1.3v6.6c0 3.9-2.6 6.3-5.9 6.3A5.6 5.6 0 0 1 5 15.7c0-3.2 2.6-5.6 6-5.4v3.2c-1.6-.3-2.9.8-2.9 2.2 0 1.3 1 2.3 2.3 2.3 1.5 0 2.5-1 2.5-2.9V3h3.7Z" />
    </svg>
  )
}
