import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/AdminProvisioning.css';

const AdminProvisioningPage = () => {
    const navigate = useNavigate();
    const { fetchProfile } = useUser();
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState('circuit'); // default selection
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        number: false,
        special: false,
        uppercase: false
    });

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordRequirements({
            length: value.length >= 8,
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*]/.test(value),
            uppercase: /[A-Z]/.test(value)
        });
    };

    const handleAuthorize = async (e) => {
        e.preventDefault();
        const { length, number, special, uppercase } = passwordRequirements;
        if (!(length && number && special && uppercase)) {
            alert('Please meet all password requirements for a strong access key.');
            return;
        }

        try {
            // 1. Create User Account (Signup)
            const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: 'admin'
                })
            });

            if (!signupResponse.ok) {
                const error = await signupResponse.json();
                throw new Error(error.detail || 'Account creation failed');
            }

            const data = await signupResponse.json();
            const token = data.access_token;

            // Store token
            localStorage.setItem('token', token);
            localStorage.setItem('role', 'admin');

            const avatars = {
                neural: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpOpazgfDmLvcKQcpcHFugJrw0n7-NQrg4keB4xbHDv3upPJb2Nb0fDxveX87bg0TiQCvYYigsX-4DMkoPVnFW113EvQ64wsA265fQzDVVY3-5EDlPLzd73H69qy0-UWRWs-WLXKoAGVW2MBlRGQfI8j26YlAKKaHnOFRcUMFbE2HA7adKtDD436DuklfQ2XJyjrceXtAnihxzl26eV2yt4hIo8KAvgoTy5gP23ySe5L53AGlwaRVTAqr6GtMk91Q1h2P1FPL5_yw",
                circuit: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZoHh_BbXs-qmuU0eX845bXXs_X50Tc5tkStJfjvQ2-kAWf2DHNuXN0CsWF7wwVd5RZcImZNzULlmTmeM1druz_FkXFBfwsJLCTC8Kz6YuK4KphzfSrJjkgyJXZxG_yN0RwB0JSIGB9Hns-hRia5hawo9_gegBzVcSZMVzXKY9rVZf5-_iSCcQVFH7SxBLMk6-uc6Fuxlcq_x3uK6VN1fEJqneN_42X3mVXnwuoRmVcWKmDj5hyVijFhvTO_tA3B6sOui0fC__sPo",
                sentient: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkiXoKUtWU7OkVPZEACsab0pxVvI-_XmslklxqmpNcmmbxFFnC23-JlkxGD5XvhlCtP4sX8F-fNoPESEPExH5D76ga8ocs4IOPKTPjAjcOjokh06MjYJc3o22ATsWUlwjm7ezlGFTiZTnsoE72YoXzt5SEPN6kS3NhweM_sQQEMcjr97RNLioMk9WHo0atOcG4EeTz-34l_5kc8_PPxI7NfBiqA7og3EovkDmtbHj2mDU4VNpNUBUnnIGllnCLAllXSZqOhpFH_xs"
            };

            // 2. Create Profile using the new token
            const response = await fetch(`${API_BASE_URL}/employees/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: name,
                    avatar_url: previewUrl || avatars[selectedAvatar] || null
                })
            });

            if (response.ok) {
                await fetchProfile();
                navigate('/admin/dashboard');
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Profile activation failed');
            }
        } catch (err) {
            console.error('Provisioning error:', err);
            let errorMessage = 'System activation failed.';
            if (typeof err === 'string') errorMessage = err;
            else if (err.message) errorMessage = err.message;
            alert(errorMessage);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setPreviewUrl(base64);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    return (
        <div className="bg-background-dark font-display text-white min-h-screen relative overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 technical-grid"></div>
            <div className="fixed inset-0 pointer-events-none z-0 hud-scanline opacity-50"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="flex items-center justify-between border-b border-solid border-primary/20 px-10 py-4 bg-background-dark/90 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/role-selection')}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-primary/30"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back
                        </button>
                        <div className="flex items-center gap-3">
                            <Logo textClassName="text-xl font-bold tracking-tighter uppercase" />
                            <span className="text-primary opacity-50 font-light text-xl mt-1 tracking-tighter uppercase -ml-1">Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="text-xs uppercase tracking-widest font-medium opacity-60 hover:opacity-100 transition-opacity" href="#">Provisioning</a>
                            <a className="text-xs uppercase tracking-widest font-medium opacity-60 hover:opacity-100 transition-opacity" href="#">Auth Logs</a>
                        </nav>
                        <div className="h-8 w-[1px] bg-primary/20"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase tracking-tighter opacity-50">Admin Level</p>
                                <p className="text-[10px] font-bold text-secondary tracking-widest uppercase">Root Access</p>
                            </div>
                            <div className="rounded-full border border-primary/30 p-1">
                                <div className="bg-primary/20 aspect-square bg-cover rounded-full size-8 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-primary">shield_person</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-start py-10 px-6 max-w-6xl mx-auto w-full">
                    <div className="w-full max-w-2xl mb-10">
                        <p className="text-primary text-xs font-bold tracking-[0.3em] text-center mb-4 uppercase">Step 3 of 4</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium uppercase tracking-widest text-secondary opacity-80">Identity Sync</span>
                                <span className="text-xs font-bold text-primary">75%</span>
                            </div>
                            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary shadow-[0_0_15px_#8B7CFF]" style={{ width: '75%' }}></div>
                            </div>
                            <p className="text-[10px] text-center text-secondary opacity-60 mt-2 italic">Verifying administrative credentials via neural bridge...</p>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-[0.15em] mb-4 uppercase">Administrator Provisioning</h1>
                        <p className="text-primary/70 text-sm font-light max-w-xl mx-auto uppercase tracking-widest">Calibrate your administrative identity and establish secure access parameters.</p>
                    </div>

                    <div className="w-full mb-12">
                        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60 mb-8 text-center text-secondary">Photo Identity & Neural Interface</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-32 h-32 rounded-full bg-card-bg border-2 border-dashed border-primary/40 flex flex-col items-center justify-center glow-purple hover:border-primary transition-all overflow-hidden relative">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-primary/40 text-4xl mb-1">add_a_photo</span>
                                                <span className="text-[14px] uppercase font-bold text-primary/40">Upload Headshot</span>
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="absolute -bottom-2 right-0 bg-secondary rounded-full p-1 border-2 border-background-dark">
                                        <span className="material-symbols-outlined text-background-dark text-xs block">verified</span>
                                    </div>
                                </div>
                                <p className="text-[15px] uppercase tracking-widest text-primary font-bold">Professional Headshot</p>
                            </div>
                            <div className="h-16 w-[1px] bg-primary/20 hidden md:block"></div>
                            <div className="flex gap-4">
                                <div
                                    onClick={() => setSelectedAvatar('neural')}
                                    className={`group cursor-pointer flex flex-col items-center p-4 rounded-lg border transition-all ${selectedAvatar === 'neural' ? 'border-primary shadow-[0_0_15px_rgba(139,124,255,0.4)] bg-primary/10 scale-105' : 'border-primary/20 bg-card-bg/40 hover:border-primary'}`}
                                >
                                    <div className="w-16 h-16 rounded-full mb-3 relative flex items-center justify-center bg-black/60 overflow-hidden border border-primary/20">
                                        <img className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70 neural-highlight" alt="Neural Silhouette" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpOpazgfDmLvcKQcpcHFugJrw0n7-NQrg4keB4xbHDv3upPJb2Nb0fDxveX87bg0TiQCvYYigsX-4DMkoPVnFW113EvQ64wsA265fQzDVVY3-5EDlPLzd73H69qy0-UWRWs-WLXKoAGVW2MBlRGQfI8j26YlAKKaHnOFRcUMFbE2HA7adKtDD436DuklfQ2XJyjrceXtAnihxzl26eV2yt4hIo8KAvgoTy5gP23ySe5L53AGlwaRVTAqr6GtMk91Q1h2P1FPL5_yw" />
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-tighter font-bold ${selectedAvatar === 'neural' ? 'text-primary' : 'opacity-60'}`}>Neural</span>
                                </div>
                                <div
                                    onClick={() => setSelectedAvatar('circuit')}
                                    className={`group cursor-pointer flex flex-col items-center p-4 rounded-lg border transition-all ${selectedAvatar === 'circuit' ? 'border-primary shadow-[0_0_15px_rgba(139,124,255,0.4)] bg-primary/10 scale-105' : 'border-primary/20 bg-card-bg/40 hover:border-primary'}`}
                                >
                                    <div className="w-16 h-16 rounded-full mb-3 relative flex items-center justify-center bg-black/60 overflow-hidden border border-primary/40">
                                        <img className="absolute inset-0 w-full h-full object-cover mix-blend-screen neural-highlight" alt="Circuit Halo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZoHh_BbXs-qmuU0eX845bXXs_X50Tc5tkStJfjvQ2-kAWf2DHNuXN0CsWF7wwVd5RZcImZNzULlmTmeM1druz_FkXFBfwsJLCTC8Kz6YuK4KphzfSrJjkgyJXZxG_yN0RwB0JSIGB9Hns-hRia5hawo9_gegBzVcSZMVzXKY9rVZf5-_iSCcQVFH7SxBLMk6-uc6Fuxlcq_x3uK6VN1fEJqneN_42X3mVXnwuoRmVcWKmDj5hyVijFhvTO_tA3B6sOui0fC__sPo" />
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-tighter font-bold ${selectedAvatar === 'circuit' ? 'text-primary' : 'opacity-60'}`}>Circuit</span>
                                </div>
                                <div
                                    onClick={() => setSelectedAvatar('sentient')}
                                    className={`group cursor-pointer flex flex-col items-center p-4 rounded-lg border transition-all ${selectedAvatar === 'sentient' ? 'border-primary shadow-[0_0_15px_rgba(139,124,255,0.4)] bg-primary/10 scale-105' : 'border-primary/20 bg-card-bg/40 hover:border-primary'}`}
                                >
                                    <div className="w-16 h-16 rounded-full mb-3 relative flex items-center justify-center bg-black/60 overflow-hidden border border-primary/20">
                                        <img className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70 neural-highlight" alt="Sentient Core" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkiXoKUtWU7OkVPZEACsab0pxVvI-_XmslklxqmpNcmmbxFFnC23-JlkxGD5XvhlCtP4sX8F-fNoPESEPExH5D76ga8ocs4IOPKTPjAjcOjokh06MjYJc3o22ATsWUlwjm7ezlGFTiZTnsoE72YoXzt5SEPN6kS3NhweM_sQQEMcjr97RNLioMk9WHo0atOcG4EeTz-34l_5kc8_PPxI7NfBiqA7og3EovkDmtbHj2mDU4VNpNUBUnnIGllnCLAllXSZqOhpFH_xs" />
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-tighter font-bold ${selectedAvatar === 'sentient' ? 'text-primary' : 'opacity-60'}`}>Sentient</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-5xl bg-card-bg/90 border border-primary/20 p-10 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[2px] h-8 bg-primary/30"></div>
                            <div className="absolute top-0 right-0 w-8 h-[2px] bg-primary/30"></div>
                        </div>
                        <form onSubmit={handleAuthorize} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                            <div className="relative">
                                <label className="text-[16px] uppercase font-bold tracking-[0.2em] text-primary mb-2 block">Full Name</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-background-dark/80 border-primary/30 border text-white py-4 px-5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:opacity-20 text-[24px]"
                                        placeholder="Enter Full Administrator Name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary opacity-70 text-lg">badge</span>
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[16px] uppercase font-bold tracking-[0.2em] text-primary mb-2 block">Enterprise Email</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-background-dark/80 border-primary/30 border text-white py-4 px-5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:opacity-20 text-[24px]"
                                        placeholder="admin@enterprise-nexo.ai"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary opacity-70 text-lg">alternate_email</span>
                                </div>
                            </div>
                            <div className="relative md:col-span-2">
                                <label className="text-[16px] uppercase font-bold tracking-[0.2em] text-primary mb-2 block">Access Key (Password)</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-background-dark/80 border-primary/30 border text-white py-4 px-5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:opacity-20 text-[24px] pr-20"
                                        placeholder="••••••••••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-secondary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                        {Object.values(passwordRequirements).every(v => v) ? (
                                            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-secondary text-sm">lock</span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className={`flex items-center gap-2 transition-opacity ${passwordRequirements.length ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? 'bg-green-400' : 'bg-secondary'}`}></span>
                                        <span className="text-[14px] uppercase font-bold text-secondary">8+ Characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-opacity ${passwordRequirements.uppercase ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? 'bg-green-400' : 'bg-secondary'}`}></span>
                                        <span className="text-[14px] uppercase font-bold text-secondary">Uppercase Letter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-opacity ${passwordRequirements.number ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? 'bg-green-400' : 'bg-secondary'}`}></span>
                                        <span className="text-[14px] uppercase font-bold text-secondary">Includes Number</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-opacity ${passwordRequirements.special ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.special ? 'bg-green-400' : 'bg-secondary'}`}></span>
                                        <span className="text-[14px] uppercase font-bold text-secondary">Special Symbol</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 relative z-10 md:col-span-2">
                                <button type="submit" className="w-full px-10 py-5 admin-gradient-btn text-white font-bold rounded-lg uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(139,124,255,0.4)] hover:shadow-[0_0_35px_rgba(139,124,255,0.6)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                                    <span className="relative z-10 text-lg">Authorize Admin Access</span>
                                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform relative z-10">bolt</span>
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                                <p className="text-[15px] text-center text-primary/40 mt-6 uppercase tracking-[0.1em]">By authorizing, you accept all root-level operational protocols.</p>
                            </div>
                        </form>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-10 opacity-60 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#8B7CFF]"></span> ENCRYPTION: AES-256</div>
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#8B7CFF]"></span> PROTOCOL: V3.4.1</div>
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#8B7CFF]"></span> LATENCY: 4MS</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminProvisioningPage;
