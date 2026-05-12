import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Nouvel état pour gérer la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // On appelle la route NATIVE d'Odoo, plus besoin de ton contrôleur Python !
      const response = await api.post("/web/session/authenticate", {
        params: {
          db: "sds_ecommerce", // ⚠️ Assure-toi que c'est le VRAI nom de ta base
          login: formData.login,
          password: formData.password,
        }
      });

      // Odoo renvoie une erreur spécifique si le mot de passe est faux
      if (response.data.error) {
        setError("Email ou mot de passe invalide.");
        setLoading(false);
        return;
      }

      // Si la connexion réussit, Odoo place les données dans "result"
      const result = response.data.result;

      if (result && result.uid) {
        // On formate les données comme tu le souhaites pour ton application
        const userData = {
          user_id: result.uid,
          user_name: result.name,
          user_email: result.username,
          avatar_url: `/web/image/res.users/${result.uid}/avatar_128`
        };

        // Stocker les infos et rediriger
        localStorage.setItem('user', JSON.stringify(userData));
        navigate("/");
      } else {
        setError("Connexion échouée.");
      }
    } catch (err) {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-0 bg-white rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        
        {/* CÔTÉ GAUCHE : DESIGN MODERNE */}
        <div className="hidden lg:flex bg-gradient-to-br from-[#4f46ff] to-[#6a5cff] p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl border border-white/20">
              <ShieldCheck size={35} />
            </div>

            <h1 className="text-4xl font-extrabold mt-12 leading-tight tracking-tight">
              Bienvenue dans votre <br /> 
              <span className="text-indigo-200">espace admin </span>
            </h1>

            <p className="mt-6 text-white/80 max-w-sm text-lg leading-relaxed">
              Gérez vos statistiques, commandes et clients avec une interface 100% personnalisée et fluide.
            </p>

            <div className="mt-12 space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center text-green-300">✓</div>
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold tracking-tighter">Performance</p>
                  <p className="font-semibold">Interface Ultra Rapide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sphères de décoration */}
          <div className="absolute top-[-40px] right-[-40px] w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-[-60px] left-[-30px] w-72 h-72 rounded-full bg-indigo-400/20 blur-2xl"></div>
        </div>

        {/* CÔTÉ DROIT : FORMULAIRE ÉPURÉ */}
        <div className="p-8 md:p-16 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#10174f]">Connexion</h2>
              <p className="text-slate-400 mt-2 font-medium">
                Accédez à vos données en toute sécurité.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#10174f] ml-1">Email / Login</label>
                <div className="h-15 rounded-2xl border border-[#e9eaf4] bg-[#fafafe] px-5 flex items-center gap-4 focus-within:border-[#4f46ff] focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <Mail size={20} className="text-slate-400" />
<input
  type="text"
  name="login"
  value={formData.login}
  onChange={handleChange}
  placeholder="exemple@gmail.com"
  autoComplete="username" /* <-- Ajouté ici */
  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700"
/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#10174f] ml-1">Mot de passe</label>
                <div className="h-15 rounded-2xl border border-[#e9eaf4] bg-[#fafafe] px-5 flex items-center gap-4 focus-within:border-[#4f46ff] focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <Lock size={20} className="text-slate-400" />
<input
  type={showPassword ? "text" : "password"}
  name="password"
  value={formData.password}
  onChange={handleChange}
  placeholder="••••••••"
  autoComplete="current-password" /* <-- Ajouté ici */
  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700"
/>
                  {/* Bouton pour basculer l'affichage */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-[#4f46ff] transition-colors focus:outline-none flex items-center justify-center"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-red-600 text-sm font-bold animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-15 rounded-2xl bg-[#4f46ff] hover:bg-[#3d36d8] text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}