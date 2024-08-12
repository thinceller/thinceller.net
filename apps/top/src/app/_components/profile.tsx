import Link from 'next/link'

function ExternalLink(props: React.ComponentPropsWithoutRef<typeof Link>) {
  return <Link {...props} className="text-blue-700" />
}

export function Profile() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl">Profile</h2>

      <p className="text-lg">thinceller - Kohei Kawakami</p>

      <p className="text-lg">Web Developer</p>

      <ul className="mt-4">
        <li>
          <ExternalLink
            href="https://twitter.com/thinceller_dev"
            target="_blank"
          >
            Twitter
          </ExternalLink>
          {' / '}
          <ExternalLink href="https://github.com/thinceller" target="_blank">
            GitHub
          </ExternalLink>
        </li>
      </ul>
    </section>
  )
}
