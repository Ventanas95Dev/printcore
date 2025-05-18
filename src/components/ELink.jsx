
import Link from 'next/link'

export const ELink = ({ href, children, className }) => {
  return (
    <Link href={href} prefetch={false} className={className ? className : ''}>
      {children}
    </Link>
  )
}
