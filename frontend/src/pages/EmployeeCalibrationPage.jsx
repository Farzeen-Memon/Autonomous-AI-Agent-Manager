import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import '../styles/EmployeeCalibration.css';

const EmployeeCalibrationPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedAvatar, setSelectedAvatar] = useState('neural');
    const [customAvatarUrl, setCustomAvatarUrl] = useState(null);

    const handleBackToHub = (e) => {
        if (e) e.preventDefault();
        navigate('/role-selection');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomAvatarUrl(url);
            setSelectedAvatar('custom');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would typically handle form submission
        navigate('/employee');
    };

    return (
        <div className="employee-calibration-container font-display text-white min-h-screen relative overflow-x-hidden">
            <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="flex items-center justify-between border-b border-white/5 px-10 py-5 bg-[#0F0C1D]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity" href="#network">Network</a>
                            <a className="text-[10px] uppercase tracking-widest font-bold text-primary" href="#identity">Operational Identity</a>
                            <a className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity" href="#protocols">Protocols</a>
                        </nav>
                        <div className="h-6 w-[1px] bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-[20px] uppercase tracking-tighter opacity-40">System Access</p>
                                <p className="text-[20px] font-bold text-secondary tracking-widest uppercase">Employee Tier 1</p>
                            </div>
                            <div className="size-9 rounded-full border border-white/10 p-0.5 overflow-hidden">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-full" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKXbzBhZLcgbUhDXIcbqOs3-Y1OUZNlu1ADRCUGyTsz4FhNAGlqWO1KIVETPidIrSQfxxZHkFq1QfF3esphA5vFG3Yknfq-lJlkN36Y_hDU0iNs1JEH9o3pVfMMiggRzYA6EbY2ycb-07_1tuhSQp-4LTCIwHQBy1IAbcVAxxUV7HDsxFv7GIYv5HNlMjQtkrUI6MZokKvfq2p-Un5lhEc_MgWyLFWBXlWtC3xIQkdSoE6k8CkV7PENA5J5uWPxQcx2nuZjdK-v98")' }}></div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-[2200px] mx-auto w-full px-6 py-12 lg:py-16">
                    <div className="mb-16 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Calibration Phase 01</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 uppercase">Employee Signup & Calibration</h1>
                        <p className="text-white/50 text-base max-w-2xl font-light leading-relaxed">Configure your operational identity, secure credentials, and technical proficiency matrix for autonomous task routing within the Nexo ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Avatar Selection */}
                        <div className="lg:col-span-4 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Avatar Selection</h2>
                                <div className="grid gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group relative cursor-pointer overflow-hidden rounded-[12px] border transition-all hover:bg-[#1B1730]/60 p-5 ${selectedAvatar === 'custom' ? 'border-primary/40 bg-card-bg avatar-glow' : 'border-white/5 bg-[#1B1730]/40 hover:border-primary/30'}`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-black/40 border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                                                {customAvatarUrl ? (
                                                    <img src={customAvatarUrl} alt="Custom" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-white/20 text-2xl">add_a_photo</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-[21px] font-bold text-white/80">Upload Photo</h3>
                                                <p className="text-[15px] text-white/40 uppercase tracking-wider">JPG, PNG up to 5MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Avatar 1 */}
                                        <div
                                            onClick={() => setSelectedAvatar('neural')}
                                            className={`relative group cursor-pointer flex items-center gap-4 p-4 rounded-[12px] border transition-all duration-300 ${selectedAvatar === 'neural' ? 'border-primary/40 bg-card-bg avatar-glow' : 'border-white/5 bg-[#1B1730]/40 hover:border-primary/30'}`}
                                        >
                                            <div className="w-14 h-14 rounded-full relative flex items-center justify-center bg-black/60 overflow-hidden border border-primary/20">
                                                <img className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpOpazgfDmLvcKQcpcHFugJrw0n7-NQrg4keB4xbHDv3upPJb2Nb0fDxveX87bg0TiQCvYYigsX-4DMkoPVnFW113EvQ64wsA265fQzDVVY3-5EDlPLzd73H69qy0-UWRWs-WLXKoAGVW2MBlRGQfI8j26YlAKKaHnOFRcUMFbE2HA7adKtDD436DuklfQ2XJyjrceXtAnihxzl26eV2yt4hIo8KAvgoTy5gP23ySe5L53AGlwaRVTAqr6GtMk91Q1h2P1FPL5_yw" alt="Neural Silhouette" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-base ${selectedAvatar === 'neural' ? 'text-primary' : 'text-white/60 group-hover:text-white'}`}>Neural Silhouette</h3>
                                                <p className="text-[15px] text-white/40 uppercase tracking-widest">Identity Neutral</p>
                                            </div>
                                            {selectedAvatar === 'neural' && <span className="material-symbols-outlined text-primary text-xl">verified</span>}
                                        </div>

                                        {/* Avatar 2 */}
                                        <div
                                            onClick={() => setSelectedAvatar('circuit')}
                                            className={`relative group cursor-pointer flex items-center gap-4 p-4 rounded-[12px] border transition-all duration-300 ${selectedAvatar === 'circuit' ? 'border-primary/40 bg-card-bg avatar-glow' : 'border-white/5 bg-[#1B1730]/40 hover:border-primary/30'}`}
                                        >
                                            <div className="w-14 h-14 rounded-full relative flex items-center justify-center bg-black/60 overflow-hidden border border-white/10">
                                                <img className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZoHh_BbXs-qmuU0eX845bXXs_X50Tc5tkStJfjvQ2-kAWf2DHNuXN0CsWF7wwVd5RZcImZNzULlmTmeM1druz_FkXFBfwsJLCTC8Kz6YuK4KphzfSrJjkgyJXZxG_yN0RwB0JSIGB9Hns-hRia5hawo9_gegBzVcSZMVzXKY9rVZf5-_iSCcQVFH7SxBLMk6-uc6Fuxlcq_x3uK6VN1fEJqneN_42X3mVXnwuoRmVcWKmDj5hyVijFhvTO_tA3B6sOui0fC__sPo" alt="Circuit Silhouette" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-base ${selectedAvatar === 'circuit' ? 'text-primary' : 'text-white/60 group-hover:text-white'}`}>Circuit Silhouette</h3>
                                                <p className="text-[15px] text-white/40 uppercase tracking-widest">Geometric Form</p>
                                            </div>
                                            {selectedAvatar === 'circuit' && <span className="material-symbols-outlined text-primary text-xl">verified</span>}
                                        </div>

                                        {/* Avatar 3 */}
                                        <div
                                            onClick={() => setSelectedAvatar('organic')}
                                            className={`relative group cursor-pointer flex items-center gap-4 p-4 rounded-[12px] border transition-all duration-300 ${selectedAvatar === 'organic' ? 'border-primary/40 bg-card-bg avatar-glow' : 'border-white/5 bg-[#1B1730]/40 hover:border-primary/30'}`}
                                        >
                                            <div className="w-14 h-14 rounded-full relative flex items-center justify-center bg-black/60 overflow-hidden border border-white/10">
                                                <img className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkiXoKUtWU7OkVPZEACsab0pxVvI-_XmslklxqmpNcmmbxFFnC23-JlkxGD5XvhlCtP4sX8F-fNoPESEPExH5D76ga8ocs4IOPKTPjAjcOjokh06MjYJc3o22ATsWUlwjm7ezlGFTiZTnsoE72YoXzt5SEPN6kS3NhweM_sQQEMcjr97RNLioMk9WHo0atOcG4EeTz-34l_5kc8_PPxI7NfBiqA7og3EovkDmtbHj2mDU4VNpNUBUnnIGllnCLAllXSZqOhpFH_xs" alt="Organic-Tech" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-base ${selectedAvatar === 'organic' ? 'text-primary' : 'text-white/60 group-hover:text-white'}`}>Organic-Tech</h3>
                                                <p className="text-[15px] text-white/40 uppercase tracking-widest">Biological Core</p>
                                            </div>
                                            {selectedAvatar === 'organic' && <span className="material-symbols-outlined text-primary text-xl">verified</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Form Fields */}
                        <div className="lg:col-span-8 bg-[#1B1730]/20 border border-white/5 rounded-2xl p-8 lg:p-10 backdrop-blur-sm shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="space-y-2">
                                    <label className="text-[20px] uppercase font-bold tracking-[0.2em] text-primary/80">Identifier</label>
                                    <input className="w-full text-white py-3.5 px-5 rounded-[12px] outline-none transition-all placeholder:text-white/10 text-sm border" placeholder="e.g. Node_Delta_4" type="text" defaultValue="NX_772_EMPLOYEE" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] uppercase font-bold tracking-[0.2em] text-primary/80">Primary Specialization</label>
                                    <input className="w-full text-white py-3.5 px-5 rounded-[12px] outline-none transition-all placeholder:text-white/10 text-sm border" placeholder="e.g. LLM Engineering" type="text" defaultValue="Frontend Systems Architecture" />
                                </div>
                            </div>

                            <div className="mb-12 space-y-6">
                                <h3 className="text-[22px] uppercase font-bold tracking-[0.2em] text-white border-b border-white/5 pb-4">Account Access</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[20px] uppercase font-bold tracking-[0.2em] text-primary/80">Enterprise Email</label>
                                        <input className="w-full text-white py-3.5 px-5 rounded-[12px] outline-none transition-all placeholder:text-white/20 text-sm border" placeholder="employee@nexo-agent.ai" type="email" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[20px] uppercase font-bold tracking-[0.2em] text-primary/80">Set Access Key</label>
                                        <div className="relative">
                                            <input className="w-full text-white py-3.5 px-5 pr-12 rounded-[12px] outline-none transition-all placeholder:text-white/20 text-sm border" placeholder="••••••••••••" type="password" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5">
                                                <span className="material-symbols-outlined text-[16px] text-white/20 validation-glow" title="Complexity met">security</span>
                                                <span className="material-symbols-outlined text-[16px] text-white/20 validation-glow" title="Length verified">verified_user</span>
                                            </div>
                                        </div>
                                        <p className="text-[15px] text-white/30 uppercase tracking-widest mt-1">Min. 12 characters with biometric hash</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h3 className="text-[22px] uppercase font-bold tracking-[0.2em] text-white">Skills & Experience Matrix</h3>
                                    <button className="text-[20px] uppercase font-bold tracking-widest text-secondary hover:text-white flex items-center gap-2 transition-all">
                                        <span className="material-symbols-outlined text-sm">add</span> Add New Stack
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Tech Stack 1 */}
                                    <div className="p-6 rounded-[20px] border border-white/5 bg-[#1B1730]/30 space-y-4 hover:border-primary/20 transition-colors">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            <div className="lg:col-span-3 space-y-3">
                                                <label className="text-[20px] uppercase tracking-[0.2em] text-white/30 font-bold">Technical Stack</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[11px] font-bold">
                                                        React.js
                                                        <button className="material-symbols-outlined text-[20px] hover:text-white">close</button>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[11px] font-bold">
                                                        Tailwind CSS
                                                        <button className="material-symbols-outlined text-[20px] hover:text-white">close</button>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[11px] font-bold">
                                                        TypeScript
                                                        <button className="material-symbols-outlined text-[20px] hover:text-white">close</button>
                                                    </div>
                                                    <button className="px-3 py-1.5 rounded-full border border-dashed border-white/20 text-[10px] text-white/40 hover:text-white hover:border-white/40 transition-all">+ Add</button>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-2 space-y-3">
                                                <label className="text-[20px] uppercase tracking-[0.2em] text-white/30 font-bold">Experience level</label>
                                                <div className="relative">
                                                    <select className="w-full text-white py-2.5 px-4 rounded-[20px] text-xs outline-none appearance-none cursor-pointer border">
                                                        <option>Entry (0-1 Year)</option>
                                                        <option>Junior (1-3 Years)</option>
                                                        <option value="Mid-Level (3-5 Years)" selected>Mid-Level (3-5 Years)</option>
                                                        <option>Senior (5-8 Years)</option>
                                                        <option>Expert (8+ Years)</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 text-lg pointer-events-none">unfold_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tech Stack 2 */}
                                    <div className="p-6 rounded-[20px] border border-white/5 bg-[#1B1730]/30 space-y-4 hover:border-primary/20 transition-colors">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            <div className="lg:col-span-3 space-y-3">
                                                <label className="text-[20px] uppercase tracking-[0.2em] text-white/30 font-bold">Technical Stack</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[11px] font-bold">
                                                        Python
                                                        <button className="material-symbols-outlined text-[14px] hover:text-white">close</button>
                                                    </div>
                                                    <button className="px-3 py-1.5 rounded-full border border-dashed border-white/20 text-[10px] text-white/40 hover:text-white hover:border-white/40 transition-all">+ Add</button>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-2 space-y-3">
                                                <label className="text-[20px] uppercase tracking-[0.2em] text-white/30 font-bold">Experience level</label>
                                                <div className="relative">
                                                    <select className="w-full text-white py-2.5 px-4 rounded-[20px] text-xs outline-none appearance-none cursor-pointer border">
                                                        <option>Entry (0-1 Year)</option>
                                                        <option value="Junior (1-3 Years)" selected>Junior (1-3 Years)</option>
                                                        <option>Mid-Level (3-5 Years)</option>
                                                        <option>Senior (5-8 Years)</option>
                                                        <option>Expert (8+ Years)</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 text-lg pointer-events-none">unfold_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
                                <a
                                    href="#back"
                                    onClick={handleBackToHub}
                                    className="text-[18px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white flex items-center gap-2 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
                                    Back to Hub
                                </a>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full sm:w-auto px-12 py-6 premium-button-gradient text-white font-bold rounded-[20px] uppercase tracking-[0.2em] text-xl flex items-center justify-center gap-3 transition-all group"
                                >
                                    Submit to Nexo AI
                                    <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">bolt</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-4 opacity-20 text-[20px] uppercase tracking-[0.3em] font-bold text-secondary">
                        <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-secondary"></span> Encryption: AES-256</div>
                        <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-secondary"></span> Neural Sync: Active</div>
                        <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-secondary"></span> Protocol: V4.0.2</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeCalibrationPage;
