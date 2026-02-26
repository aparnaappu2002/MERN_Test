import React from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedKYC = ({ children }) => {
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const checkKYC = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("notoken");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/users/kyc-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.kycStatus === "submitted" || data.kycStatus === "verified") {
          setStatus("done");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("pending");
      }
    };

    checkKYC();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-purple-300 text-sm">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  if (status === "notoken") return <Navigate to="/" replace />;

  // ✅ Already done KYC → redirect to dashboard
  if (status === "done") return <Navigate to="/dashboard" replace />;

  // ✅ KYC pending → show KYC page
  return children;
};

export default ProtectedKYC;