import React, { useState, useEffect } from "react";
import { Search, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 5;
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      toast.error("Please login to access the dashboard.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    fetchData();
  }, [page, debouncedSearch, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/dashboard?page=${page}&search=${encodeURIComponent(search)}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          localStorage.removeItem("token");
          navigate("/");
          toast.error("Session expired. Please login again.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast.error(error.message || "Error fetching users.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logged out successfully! 👋", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const totalPages = Math.ceil(total / limit);
  const isPrevDisabled = page === 1;
  const isNextDisabled = page >= totalPages;

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
      {/* Background decorative blobs */}
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 shadow-2xl shadow-purple-900/60 flex-1">
          <div className="bg-purple-950 rounded-2xl px-8 py-10 h-full flex flex-col">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-700/50">
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
            {isLoading ? (
              <div className="flex items-center justify-center flex-1">
                <svg className="animate-spin w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-purple-300 flex-1 flex items-center justify-center">No users found.</p>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-white">
                  <thead className="bg-purple-900">
                    <tr>
                      <th className="p-3 rounded-tl-xl">ID</th>
                      <th className="p-3 rounded-tr-xl">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-purple-800 last:border-0">
                        <td className="p-3">{user._id}</td>
                        <td className="p-3">{user.email}</td>
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
                disabled={isPrevDisabled}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-purple-300 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={isNextDisabled}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;