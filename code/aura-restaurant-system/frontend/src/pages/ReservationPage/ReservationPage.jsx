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
    
    const today = new Date();
    const minReservationDate = today.toISOString().split('T')[0];
    const maxReservationDate = (() => {
        const future = new Date(today);
        future.setMonth(future.getMonth() + 1);
        return future.toISOString().split('T')[0];
    })();

    const TABLE_COUNT = 10;
    const BOOKING_DURATION_HOURS = 2;

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: 2,
        tableNumber: '1',
        reservationDate: minReservationDate, // YYYY-MM-DD
        timeSlot: ''
    });

    const formatTimeLabel = (timeString) => {
        const [hour, minute] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatSlotLabel = (slotTime) => {
        const [hour, minute] = slotTime.split(':').map(Number);
        const start = new Date();
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);
        end.setHours(end.getHours() + BOOKING_DURATION_HOURS);

        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const formatReservationDate = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatReservationTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Slots state
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [confirmedData, setConfirmedData] = useState(null);

    // Fetch slots when date, partySize, or tableNumber changes
    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setError(null);
            try {
                const response = await reservationAPI.getAvailableSlots(
                    formData.reservationDate,
                    Number(formData.partySize),
                    formData.tableNumber
                );
                setSlots(response.slots || []);
                // Reset selected time if it's no longer available after date/party/table changes
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
    }, [formData.reservationDate, formData.partySize, formData.tableNumber]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });
    };

    const buildReservationTime = () => {
        if (!formData.reservationDate || !formData.timeSlot) {
            return null;
        }

        const [year, month, day] = formData.reservationDate.split('-').map(Number);
        const [hour, minute] = formData.timeSlot.split(':').map(Number);
        const reservationDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

        if (Number.isNaN(reservationDateTime.getTime())) {
            return null;
        }

        if (reservationDateTime <= new Date()) {
            return null;
        }

        const pad = (value) => String(value).padStart(2, '0');
        return `${reservationDateTime.getFullYear()}-${pad(reservationDateTime.getMonth() + 1)}-${pad(reservationDateTime.getDate())}T${pad(reservationDateTime.getHours())}:${pad(reservationDateTime.getMinutes())}:00`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            setFieldErrors({});
            const reservationTime = buildReservationTime();
            if (!reservationTime) {
                setError('Please select a valid future time slot.');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                customerName: formData.customerName,
                email: formData.customerEmail,
                phone: formData.customerPhone,
                partySize: Number(formData.partySize),
                tableNumber: Number(formData.tableNumber),
                reservationTime,
            };

            // 1. Submit booking (backend checks availability and locks atomically)
            const response = await reservationAPI.createReservation(payload);
            
            // 2. Success!
            setConfirmedData(response);
            setStep(2);
        } catch (err) {
            // 409 Conflict means slot was taken
            if (err.response?.status === 409) {
                setError("Sorry, that time slot was just booked by someone else. Please choose another time.");
                const response = await reservationAPI.getAvailableSlots(
                    formData.reservationDate,
                    Number(formData.partySize)
                );
                setSlots(response.slots || []);
                setFormData(prev => ({ ...prev, timeSlot: '' }));
            } else if (err.response?.status === 400) {
                const fieldErrors = err.response?.data?.fields || {};
                const validationMessage = Object.entries(fieldErrors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join('; ');

                console.error('Reservation validation failed:', fieldErrors);
                setFieldErrors(fieldErrors);
                setError(validationMessage || err.response?.data?.error || "An error occurred while booking. Please try again.");
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
                            <span>{formatReservationDate(confirmedData.reservationTime)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-100">
                            <Clock size={18} className="text-neon-cyan" />
                            <span>{formatReservationTime(confirmedData.reservationTime)} - {formatReservationTime(new Date(new Date(confirmedData.reservationTime).setHours(new Date(confirmedData.reservationTime).getHours() + BOOKING_DURATION_HOURS)))}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-100">
                            <Users size={18} className="text-neon-blue" />
                            <span>{confirmedData.partySize} Guests · Table {confirmedData.tableNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-100">
                            <span className="text-dark-300">Contact:</span>
                            <span>{confirmedData.email} · {confirmedData.phone}</span>
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
                                Experience the future of dining. Select your preferred date and time. Reservations are held for 2 hours.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <div className="text-sm text-dark-300">Opening Hours</div>
                                    <div className="font-medium text-white">11:00 AM - 11:00 PM</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                                    <CalendarIcon size={18} />
                                </div>
                                <div>
                                    <div className="text-sm text-dark-300">Available Tables</div>
                                    <div className="font-medium text-white">{TABLE_COUNT} tables</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <span className="text-sm font-bold">A</span>
                                </div>
                                <div>
                                    <div className="text-sm text-dark-300">Contact Us</div>
                                    <div className="font-medium text-white">pdnprojectaura17@gmail.com</div>
                                    <div className="text-sm text-dark-400">+94 760 609 159</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-dark-900 p-4 text-sm text-dark-300">
                                Each reservation holds the table for {BOOKING_DURATION_HOURS} hours, for example {formatSlotLabel('19:00')}.
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
                                    {fieldErrors.customerName && (
                                        <p className="text-xs text-red-400 mt-1">{fieldErrors.customerName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Email Address</label>
                                    <input 
                                        type="email" required name="customerEmail"
                                        value={formData.customerEmail} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                                        placeholder="john@example.com"
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                                    )}
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
                                    {fieldErrors.phone && (
                                        <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Table Number</label>
                                    <select
                                        name="tableNumber" required
                                        value={formData.tableNumber} onChange={handleInputChange}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all appearance-none"
                                    >
                                        {[...Array(TABLE_COUNT)].map((_, i) => (
                                            <option key={i+1} value={String(i+1)}>{`Table ${i+1}`}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.tableNumber && (
                                        <p className="text-xs text-red-400 mt-1">{fieldErrors.tableNumber}</p>
                                    )}
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
                                    min={minReservationDate}
                                    max={maxReservationDate}
                                    value={formData.reservationDate} onChange={handleInputChange}
                                    className="w-full md:w-1/2 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all [color-scheme:dark]"
                                />
                                {fieldErrors.reservationTime && (
                                    <p className="text-xs text-red-400 mt-1">{fieldErrors.reservationTime}</p>
                                )}
                            </div>

                            {/* Time Slots Grid */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Time Slot
                                    {loadingSlots && <span className="ml-2 w-3 h-3 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />}
                                </label>
                                
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {slots.map((slot) => {
                                        const isSelected = formData.timeSlot === slot.time;
                                        const tableLabel = slot.availableTables != null
                                            ? `${slot.availableTables} table${slot.availableTables === 1 ? '' : 's'} free`
                                            : '';
                                        // If frontend requested a specific table, prefer that availability marker
                                        const specificTableUnavailable = (slot.tableAvailable === false);
                                        return (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                disabled={!slot.available || specificTableUnavailable}
                                                onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.time }))}
                                                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border
                                                    ${(!slot.available || specificTableUnavailable)
                                                        ? 'bg-dark-800 border-dark-700 text-dark-500 cursor-not-allowed line-through decoration-dark-500'
                                                        : isSelected
                                                            ? 'bg-neon-blue/20 border-neon-blue text-neon-cyan shadow-[0_0_15px_rgba(76,110,245,0.2)]'
                                                            : 'bg-dark-800 border-dark-600 text-white hover:border-gold-500/50 hover:bg-gold-500/5'
                                                    }
                                                `}
                                            >
                                                <div>{formatSlotLabel(slot.time)}</div>
                                                {tableLabel && <div className="text-[10px] text-dark-300 mt-1">{tableLabel}</div>}
                                                {slot.tableAvailable === false && (
                                                    <div className="text-[10px] text-red-400 mt-1">Selected table is booked</div>
                                                )}
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
                                    disabled={isSubmitting || !formData.timeSlot || !formData.customerEmail || !formData.customerPhone}
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
