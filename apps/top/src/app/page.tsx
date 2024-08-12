import { Blog } from './_components/blog'
import { Contact } from './_components/Contact'
import { Header } from './_components/header'
import { Profile } from './_components/profile'
import { Works } from './_components/works'

export default function Page() {
  return (
    <div className="p-20 w-screen h-screen bg-gray-100">
      <Header />

      <main className="mt-20 space-y-10">
        <Profile />

        <Blog />

        <Works />

        <Contact />
      </main>
    </div>
  )
}
