import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Users, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { reservationAPI } from '../../api/reservationAPI';
import auraLogo from '../../assets/aura_logo.png';

/**
 * ============================================================
 *  Reservation Page
 * ============================================================
 *  Customer-facing form to book a table.
 *  Includes real-time slot availability checking.
 * ============================================================
 */
export default function ReservationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: details & date, 2: success
    
    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: 2,
        reservationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timeSlot: ''
    });

    // Slots state
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [confirmedData, setConfirmedData] = useState(null);

    // Fetch slots when date changes
    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setError(null);
            try {
                const response = await reservationAPI.getAvailableSlots(formData.reservationDate);
                setSlots(response.slots || []);
                // Reset selected time if it's no longer available on this new date
                setFormData(prev => ({ ...prev, timeSlot: '' }));
            } catch (err) {
                setError("Could not load available times. Please try again.");
            } finally {
                setLoadingSlots(false);
            }
        };

        if (formData.reservationDate) {
            fetchSlots();
        }
    }, [formData.reservationDate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // 1. Submit booking (backend checks availability and locks atomically)
            const response = await reservationAPI.createReservation(formData);
            
            // 2. Success!
            setConfirmedData(response);
            setStep(2);
        } catch (err) {
            // 409 Conflict means slot was taken
            if (err.response?.status === 409) {
                setError("Sorry, that time slot was just booked by someone else. Please choose another time.");
                // Refresh slots
                const response = await reservationAPI.getAvailableSlots(formData.reservationDate);
                setSlots(response.slots || []);
                setFormData(prev => ({ ...prev, timeSlot: '' }));
            } else {
                setError(err.response?.data?.error || "An error occurred while booking. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Render Success Screen ───
    if (step === 2 && confirmedData) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 bg-grid relative overflow-hidden">
                <div className="absolute inset-0 bg-neon-blue/10 blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-gold p-10 rounded-3xl max-w-lg w-full text-center relative z-10 border-gold-500/30"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 size={40} />
                    </motion.div>

                    <h2 className="text-3xl font-display font-bold text-white mb-2">Table Confirmed!</h2>
                    <p className="text-dark-200 mb-8">Thank you, {confirmedData.customerName}. We've sent a confirmation email to {confirmedData.customerEmail}.</p>
                    
                    <div className="bg-dark-900/50 rounded-xl p-6 text-left space-y-4 mb-8 border border-white/5">
                        <div className="flex items-center gap-3 text-dark-100">
                            <CalendarIcon size={18} className="text-gold-400" />
                            <span>{confirmedData.reservationDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-100">
                            <Clock size={18} className="text-neon-cyan" />
                            <span>{confirmedData.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-100">
                            <Users size={18} className="text-neon-blue" />
                            <span>{confirmedData.partySize} Guests</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/landing')}
                        className="w-full bg-white text-dark-950 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── Render Booking Form ───
    return (
        <div className="min-h-screen bg-dark-950 relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="p-6 relative z-10 flex items-center justify-between">
                <button 
                    onClick={() => navigate('/landing')}
                    className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <img src={auraLogo} alt="AURA" className="h-10 w-auto opacity-80" />
                <div className="w-20" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border-white/10"
                >
                    {/* Left Info Panel */}
                    <div className="w-full md:w-1/3 bg-dark-900 p-8 border-r border-white/5 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-4">Book a Table</h2>
                            <p className="text-dark-300 text-sm leading-relaxed mb-8">
                                Experience the future of dining. Select your preferred date and time. Reservations are held for 15 minutes.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <div className="text-sm text-dark-300">Opening Hours</div>
                                    <div className="font-medium text-white">11:00 AM - 10:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className="w-full md:w-2/3 p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Personal Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text" required name="customerName"
                                        value={formData.customerName} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Email Address</label>
                                    <input 
                                        type="email" required name="customerEmail"
                                        value={formData.customerEmail} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Phone Number</label>
                                    <input 
                                        type="tel" required name="customerPhone"
                                        value={formData.customerPhone} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                                        placeholder="+94 77 123 4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Party Size</label>
                                    <select 
                                        name="partySize" required
                                        value={formData.partySize} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all appearance-none"
                                    >
                                        {[...Array(20)].map((_, i) => (
                                            <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Guest' : 'Guests'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
                                    <CalendarIcon size={14} /> Date
                                </label>
                                <input 
                                    type="date" required name="reservationDate"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.reservationDate} onChange={handleInputChange}
                                    className="w-full md:w-1/2 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all [color-scheme:dark]"
                                />
                            </div>

                            {/* Time Slots Grid */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Time Slot
                                    {loadingSlots && <span className="ml-2 w-3 h-3 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />}
                                </label>
                                
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {slots.map((slot) => {
                                        const isSelected = formData.timeSlot === slot.timeSlot;
                                        return (
                                            <button
                                                key={slot.timeSlot}
                                                type="button"
                                                disabled={!slot.available}
                                                onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.timeSlot }))}
                                                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border
                                                    ${!slot.available 
                                                        ? 'bg-dark-800 border-dark-700 text-dark-500 cursor-not-allowed line-through decoration-dark-500' 
                                                        : isSelected
                                                            ? 'bg-neon-blue/20 border-neon-blue text-neon-cyan shadow-[0_0_15px_rgba(76,110,245,0.2)]'
                                                            : 'bg-dark-800 border-dark-600 text-white hover:border-gold-500/50 hover:bg-gold-500/5'
                                                    }
                                                `}
                                            >
                                                {slot.timeSlot}
                                            </button>
                                        );
                                    })}
                                    {slots.length === 0 && !loadingSlots && (
                                        <div className="col-span-full text-sm text-dark-400 italic">No slots available for this date.</div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !formData.timeSlot}
                                    className="w-full btn-glow bg-neon-cyan text-dark-950 font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
