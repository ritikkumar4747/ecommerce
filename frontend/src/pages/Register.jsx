import { useState } from "react";
import Api from "../services/Api";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function LuxuryRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
      const payload = { name, email, password, role: isAdmin ? 'admin' : (role === 'buyer' ? 'user' : 'seller') };
      try {
        await Api.post('/auth/register', payload);
        // Auto-login after successful registration
        await Api.post('/auth/login', { email, password });
        navigate('/');
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setError(err?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      {/* Glow background */}
      <div className="absolute w-[500px] h-[500px] bg-white/5 blur-3xl rounded-full"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-10 py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">

        {/* Brand */}
        <div className="flex justify-center mb-10 scale-110">
          <Logo className="h-10 w-auto" />
        </div>

        <form className="space-y-7" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-white/30 bg-transparent py-2 focus:outline-none focus:border-white"
            />
            <label className="absolute left-0 text-gray-400 text-sm transition-all -top-4 text-xs peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">
              Full Name
            </label>
          </div>

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

          {/* Role Selection (Luxury Toggle Style) */}
          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-3 tracking-widest">
              SELECT ROLE
            </p>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-2 border transition tracking-widest text-sm
                  ${role === "buyer"
                    ? "bg-white text-black border-white"
                    : "border-white/30 text-white hover:border-white"
                  }`}
              >
                BUYER
              </button>

              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-2 border transition tracking-widest text-sm
                  ${role === "seller"
                    ? "bg-white text-black border-white"
                    : "border-white/30 text-white hover:border-white"
                  }`}
              >
                SELLER
              </button>

            </div>
          </div>
          {/* Admin toggle */}
          <div className="mt-4 flex items-center gap-3">
            <input id="admin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <label htmlFor="admin" className="text-sm text-gray-300">Make account Admin</label>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 border border-white text-white tracking-widest hover:bg-white hover:text-black transition duration-300"
          >
            CREATE ACCOUNT
          </button>

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-10 text-sm tracking-wide">
          Already a member?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}