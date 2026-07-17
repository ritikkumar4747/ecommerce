import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Api from "../services/Api";
import { AuthContext } from "../context/Authcontext";
import Logo from "../components/Logo";

export default function LuxuryLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await Api.post("/auth/login", { email, password });
      console.log("login response", res.data);
      const meRes = await Api.get("/auth/me");
      setUser(meRes.data);
      navigate("/");
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-white/5 blur-3xl rounded-full"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-10 py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">

        {/* Brand Name */}
        <div className="flex justify-center mb-10 scale-110">
          <Logo className="h-10 w-auto" />
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-white/30 bg-transparent py-2 focus:outline-none focus:border-white"
            />
            <label className="absolute left-0 text-gray-400 text-sm transition-all -top-4 text-xs peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-white/30 bg-transparent py-2 focus:outline-none focus:border-white"
            />
            <label className="absolute left-0 text-gray-400 text-sm transition-all -top-4 text-xs peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">
              Password
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 mt-6 border border-white text-white tracking-widest hover:bg-white hover:text-black transition duration-300">
            SIGN IN
          </button>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        </form>

        {/* Create Account */}
        <p className="text-center text-gray-400 mt-10 text-sm tracking-wide">
          New to luxury?{" "}
          <Link to="/register" className="text-white hover:underline">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}