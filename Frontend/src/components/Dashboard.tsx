import { useState } from "react";
import { Search, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import { useGetDashboardQuery } from "../hooks/userCustomHooks";

export interface DashboardResponse {
  users: {
    _id: string;
    email: string;
    kycStatus?: string;
    imageUrl?: string;
    audioUrl?: string;
    updatedAt?: string; 
  }[];
  total: number;
}

const Dashboard = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();
  const limit = 5;
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useGetDashboardQuery(page, debouncedSearch);
  console.log(data)

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logged out successfully! 👋");
  };

  if (isError) {
    toast.error("Error fetching users.");
  }

  return (
    <div className="min-h-screen bg-purple-950 flex flex-col p-4 relative overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          backgroundColor: "#2e1065",
          border: "1px solid #7e22ce",
          color: "#e9d5ff",
          borderRadius: "12px",
        }}
      />

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-fuchsia-700 rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-purple-300 text-sm mt-2">Manage your users</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-px bg-linear-to-br from-purple-500 via-violet-500 to-fuchsia-500 shadow-2xl shadow-purple-900/60 flex-1">
          <div className="bg-purple-950 rounded-2xl px-8 py-10 h-full flex flex-col">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-700/50">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Search */}
            <div className="space-y-1.5 mb-6">
              <label className="text-sm font-medium text-purple-200">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-purple-900 border text-white placeholder-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all border-purple-700 focus:border-purple-400 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Users List */}
            {/* Users List */}
{isLoading ? (
  <div className="flex items-center justify-center flex-1">
    <svg className="animate-spin w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
) : users.length === 0 ? (
  <p className="text-center text-purple-300 flex-1 flex items-center justify-center">
    No users found.
  </p>
) : (
  <div className="overflow-x-auto flex-1">
    <table className="w-full text-left text-sm text-white">
      <thead className="bg-purple-900">
        <tr>
          <th className="p-3 rounded-tl-xl">Email</th>
          <th className="p-3">KYC Status</th>
          <th className="p-3">Photo</th>
          <th className="p-3">Audio</th>
          <th className="p-3 rounded-tr-xl">Updated At</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="border-b border-purple-800 last:border-0 hover:bg-purple-900/30 transition-colors">

            {/* Email */}
            <td className="p-3">{user.email}</td>

            {/* KYC Status */}
            <td className="p-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${user.kycStatus === "verified" ? "bg-green-900 text-green-300 border border-green-700"
                : user.kycStatus === "submitted" ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                : "bg-purple-800 text-purple-400 border border-purple-600"}`}>
                {user.kycStatus || "pending"}
              </span>
            </td>

            {/* Photo */}
            <td className="p-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="KYC"
                  className="w-10 h-10 rounded-lg object-cover border border-purple-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => window.open(user.imageUrl, "_blank")}
                />
              ) : (
                <span className="text-xs text-purple-500">No photo</span>
              )}
            </td>

            {/* Audio */}
            <td className="p-3">
              {user.audioUrl ? (
                <audio
                  controls
                  src={user.audioUrl}
                  className="h-8 w-40"
                />
              ) : (
                <span className="text-xs text-purple-500">No audio</span>
              )}
            </td>

            {/* Updated At */}
            <td className="p-3 text-purple-400 text-xs">
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-purple-300 text-sm">
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;