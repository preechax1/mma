import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-white p-4">
      <h1 className="text-xl font-bold mb-6">FEC MMA Test OP3</h1>
      <nav className="space-y-2">
        <Link to="/" className="block p-2 rounded hover:bg-slate-700">Dashboard</Link>
        <Link to="/records" className="block p-2 rounded hover:bg-slate-700">Records</Link>
        <Link to="/updateform" className="block p-2 rounded hover:bg-slate-700">Register</Link>
      </nav>
    </aside>
  )
}
