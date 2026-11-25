import { AgentApp } from '@/components/app/AgentApp'

/**
 * One page, five tabs, hash routing. One document means the service worker can cache a single shell and
 * the app opens offline; it also makes a notification's deep link (/app#inbox/12) a hash change rather
 * than a cold navigation.
 */
export default function AgentAppPage() {
  return <AgentApp />
}
