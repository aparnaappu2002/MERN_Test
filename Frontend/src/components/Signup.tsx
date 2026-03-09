import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Eye, EyeOff, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRegisterMutation } from "../hooks/userCustomHooks";

interface FormErrors {
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
    } else if (!/[!@#$%^&*]/.test(password)) {
      newErrors.password = "Password must contain at least one special character (!@#$%^&*).";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleBlur = (field: keyof FormErrors) => {
    const validationErrors = validate();
    setErrors((prev) => ({
      ...prev,
      [field]: validationErrors[field] || null,
    }));
  };

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const data = await registerMutation.mutateAsync({ email, password });
      toast.success(data.message || "Account created successfully! 🎉");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
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

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl p-px bg-linear-to-br from-purple-500 via-violet-500 to-fuchsia-500 shadow-2xl shadow-purple-900/60">
          <div className="bg-purple-950 rounded-2xl px-8 py-10">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-700/50">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-purple-300 text-sm mt-2">Sign up to get started today</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: null }));
                    }}
                    onBlur={() => handleBlur("email")}
                    className={`w-full bg-purple-900 border text-white placeholder-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                      ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-purple-700 focus:border-purple-400 focus:ring-purple-500"}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: null }));
                    }}
                    onBlur={() => handleBlur("password")}
                    className={`w-full bg-purple-900 border text-white placeholder-purple-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                      ${errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-purple-700 focus:border-purple-400 focus:ring-purple-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">⚠ {errors.password}</p>}

                {/* Password strength hints */}
                {password && !errors.password && (
                  <ul className="text-xs text-purple-400 space-y-0.5 mt-1">
                    <li className={password.length >= 8 ? "text-green-400" : ""}>
                      {password.length >= 8 ? "✔" : "○"} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
                      {/[A-Z]/.test(password) ? "✔" : "○"} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-green-400" : ""}>
                      {/[0-9]/.test(password) ? "✔" : "○"} One number
                    </li>
                    <li className={/[!@#$%^&*]/.test(password) ? "text-green-400" : ""}>
                      {/[!@#$%^&*]/.test(password) ? "✔" : "○"} One special character (!@#$%^&*)
                    </li>
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-200">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      setErrors((p) => ({ ...p, confirmPassword: null }));
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full bg-purple-900 border text-white placeholder-purple-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                      ${errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-purple-700 focus:border-purple-400 focus:ring-purple-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">⚠ {errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-3 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-purple-800" />
              <span className="text-xs text-purple-500">or</span>
              <div className="flex-1 h-px bg-purple-800" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-purple-400">
              Already have an account?{" "}
              <Link to="/" className="text-purple-300 font-medium hover:text-white transition-colors">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;