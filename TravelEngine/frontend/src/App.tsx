import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, X, Compass, User, Sparkles, Calendar, Users, Phone, ArrowLeft, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [messages, setMessages] = useState<{role: string, content: string, displayContent?: string, isHidden?: boolean}[]>([
    {role: 'assistant', content: 'Namaste! I am Safar, your travel assistant. Please fill out your trip details, and I will craft the perfect itinerary for you!'}
  ]);
  const [input, setInput] = useState('');
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  
  // View state: 'home' | 'plan'
  const [view, setView] = useState<'home' | 'plan'>('home');
  const [tripPlan, setTripPlan] = useState<string>('');
  
  // Profile Form State
  const [profile, setProfile] = useState({
    username: '',
    phone: '',
    address: '',
    startDate: '',
    endDate: '',
    location: '',
    adults: 1,
    children: 0,
    budget: 'medium',   // 'low' | 'medium' | 'high'
    climate: 'any'      // 'cold' | 'tropical' | 'desert' | 'coastal' | 'any'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const tripsRef = useRef<HTMLDivElement>(null);
  // const aboutRef = useRef<HTMLDivElement>(null);
  const [showAbout, setShowAbout] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/api/trips`);
        const data = await res.json();
        setTrips(data);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      }
    };
    fetchTrips();
  }, []);

  const sendMessage = async (messageText: string = input, isInitialPlan: boolean = false) => {
    if (!messageText.trim()) return;
    
    // For the initial plan, we hide the massive prompt from the chat window
    const newUserMessage = {
      role: 'user', 
      content: messageText, 
      isHidden: isInitialPlan
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      
      // We only send the actual 'role' and 'content' to the backend
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({messages: apiMessages})
      });
      const data = await res.json();
      
      if (isInitialPlan) {
        setTripPlan(data.content);
        // Add a short summary version to the chat bubble instead of the full plan
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: data.content, 
          displayContent: `Here is your detailed travel plan for ${profile.location}! I have displayed the full itinerary on the dashboard to the left.\n\nLet me know if you want to tweak the budget, add pit stops, or change any hotels!` 
        }]);
      } else {
        setMessages([...newMessages, data]);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, {role: 'assistant', content: 'Oops! The server is not responding. Please make sure the FastAPI backend is running.'}]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProfileModal(false);
    setView('plan');
    setTripPlan('');
    // setIsChatOpen(true);

    const budgetLabel = profile.budget === 'low' ? 'Budget/Backpacker (₹500-₹1500/day per person)' : profile.budget === 'high' ? 'Luxury (₹5000+/day per person)' : 'Mid-Range (₹1500-₹5000/day per person)';
    const climateLabel = profile.climate === 'any' ? 'no specific climate preference' : `a preference for ${profile.climate} climates`;

    const initialPrompt = `Hi Safar! My name is ${profile.username}. I am currently based in ${profile.address}.
I want to plan a trip to ${profile.location} from ${profile.startDate} to ${profile.endDate}.
We are a group of ${profile.adults} adults and ${profile.children} children.
Budget Category: ${budgetLabel}.
Climate Preference: ${climateLabel}.
Please generate a complete, detailed travel plan with:
- All primary locations and attractions to cover
- Hotel recommendations matching my EXACT budget category (${profile.budget} budget)
- Day-by-day itinerary
- Realistic budget breakdown in INR (₹) for my group size
- Best transport options
- Local food recommendations
- Weather/climate tips for my travel dates
- Packing suggestions based on the climate`;

    sendMessage(initialPrompt, true);
  };

  return (
    <div className="min-h-screen bg-slateBg text-white font-sans overflow-x-hidden selection:bg-saffron selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full px-8 py-5 z-20 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/5">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-2xl font-bold text-saffron tracking-wider">
          <Compass className="w-8 h-8" />
          <span>SafarEngine</span>
        </button>
        <div className="hidden md:flex gap-8 font-medium text-sm items-center">
          <button onClick={() => { if(view!=='home') setView('home'); setTimeout(() => tripsRef.current?.scrollIntoView({behavior:'smooth'}), 100); }} className="hover:text-saffron transition-colors">Destinations</button>
          <button onClick={() => { if(view!=='home') setView('home'); setTimeout(() => tripsRef.current?.scrollIntoView({behavior:'smooth'}), 100); }} className="hover:text-saffron transition-colors">Trips</button>
          <button onClick={() => setShowAbout(true)} className="hover:text-saffron transition-colors flex items-center gap-1"><Info className="w-4 h-4" />About</button>
          <button onClick={() => setShowProfileModal(true)} className="bg-saffron text-slateBg px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-all">Plan a Trip</button>
        </div>
      </nav>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className="relative bg-[#1a1f2e] border border-white/10 rounded-3xl p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAbout(false)} className="absolute right-5 top-5 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-orange-600 flex items-center justify-center shadow-lg">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">SafarEngine</h2>
                <p className="text-saffron text-sm font-medium tracking-wider uppercase">India's AI Travel Companion</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-saffron/50 to-transparent my-6" />

            {/* Mission */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-saffron" /> Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">At SafarEngine, we believe every Indian journey deserves to be extraordinary. Our mission is to democratize world-class travel planning — making it effortless, affordable, and deeply personal for every traveller, whether you're a solo backpacker heading to Spiti or a family of ten exploring the ghats of Varanasi.</p>
            </div>

            {/* Who We Are */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><MapPin className="w-5 h-5 text-saffron" /> Who We Are</h3>
              <p className="text-gray-300 leading-relaxed">SafarEngine is a next-generation AI travel platform purpose-built for the Indian subcontinent. Unlike generic travel aggregators, we don't just list hotels and flights — we think like a seasoned local travel agent. Our AI agent, <strong className="text-white">Safar</strong>, powered by <span className="text-saffron font-semibold">Google Gemini Flash 3.0</span>, understands the nuances of Indian travel: monsoon seasons, regional festivals, train routes, budget dhabas, and heritage stays.</p>
            </div>

            {/* What We Offer */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-saffron" /> What We Offer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🗺️', title: 'Custom Itineraries', desc: 'Day-by-day plans tailored to your travel dates and group.' },
                  { icon: '🏨', title: 'Hotel Suggestions', desc: 'Budget to luxury picks curated for every destination.' },
                  { icon: '💰', title: 'Smart Budgeting', desc: 'Realistic cost breakdowns for adults and children.' },
                  { icon: '🚂', title: 'Transport Guidance', desc: 'Trains, flights, buses — the best way to get there.' },
                  { icon: '🍛', title: 'Local Food Spots', desc: 'Famous dhabas, coastal shacks, and rooftop restaurants.' },
                  { icon: '🤖', title: 'AI Chat Agent', desc: 'Tweak your plan in real-time with our Safar agent.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { stat: '500+', label: 'Destinations' },
                { stat: '28+', label: 'States Covered' },
                { stat: '24/7', label: 'AI Assistance' },
              ].map((s, i) => (
                <div key={i} className="text-center bg-saffron/10 border border-saffron/20 rounded-2xl py-4">
                  <p className="text-2xl font-bold text-saffron">{s.stat}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-white/10 text-center text-xs text-gray-500">
              Built with ❤️ for India &nbsp;·&nbsp; FastAPI &nbsp;·&nbsp; React &nbsp;·&nbsp; Gemini Flash 3.0 &nbsp;·&nbsp; Euri API
            </div>
          </div>
        </div>
      )}



      {/* Selected Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTrip(null)} />
          <div className="relative glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedTrip(null)} className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <img src={selectedTrip.image} alt={selectedTrip.name} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg" />
            <h2 className="text-4xl font-bold text-white mb-2">{selectedTrip.name}</h2>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-saffron font-bold bg-saffron/10 border border-saffron/20 px-4 py-1.5 rounded-full text-sm">{selectedTrip.price} est. budget</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-lg mb-8">{selectedTrip.full_description}</p>
            
            <button 
              onClick={() => {
                setProfile({...profile, location: selectedTrip.name});
                setSelectedTrip(null);
                setShowProfileModal(true);
              }}
              className="w-full bg-gradient-to-r from-saffron to-orange-500 text-slateBg py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,153,51,0.4)] flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" /> Plan Your Trip Here
            </button>
          </div>
        </div>
      )}

      {/* Profile/Trip Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowProfileModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron to-yellow-400 mb-2">Plan Your Journey</h2>
              <p className="text-gray-300">Tell us about yourself and your dream destination in India, and Safar will handle the rest.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><User className="w-4 h-4 text-saffron"/> Full Name</label>
                  <input required type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Phone className="w-4 h-4 text-saffron"/> Phone Number</label>
                  <input required type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-saffron"/> Your Current Address</label>
                <input required type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" placeholder="City, State" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Compass className="w-4 h-4 text-saffron"/> Destination (Anywhere in India)</label>
                <input required type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" placeholder="e.g. Manali, Kerala, Goa..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4 text-saffron"/> Start Date</label>
                  <input required type="date" value={profile.startDate} onChange={e => setProfile({...profile, startDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4 text-saffron"/> End Date</label>
                  <input required type="date" value={profile.endDate} onChange={e => setProfile({...profile, endDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Users className="w-4 h-4 text-saffron"/> Adults</label>
                  <input required type="number" min="1" value={profile.adults} onChange={e => setProfile({...profile, adults: parseInt(e.target.value) || 1})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Users className="w-4 h-4 text-saffron"/> Children</label>
                  <input required type="number" min="0" value={profile.children} onChange={e => setProfile({...profile, children: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron/50 focus:outline-none focus:bg-white/10 transition-colors" />
                </div>
              </div>

              {/* Budget Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">💰 Budget Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', icon: '🎒', label: 'Budget', sub: '₹500–₹1,500/day' },
                    { value: 'medium', icon: '🏨', label: 'Mid-Range', sub: '₹1,500–₹5,000/day' },
                    { value: 'high', icon: '✨', label: 'Luxury', sub: '₹5,000+/day' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({...profile, budget: opt.value})}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        profile.budget === opt.value
                          ? 'border-saffron bg-saffron/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-[10px] text-gray-400">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Climate Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">🌤️ Climate Preference</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { value: 'any', icon: '🌍', label: 'Any' },
                    { value: 'cold & mountainous', icon: '❄️', label: 'Cold & Mountains' },
                    { value: 'tropical & lush', icon: '🌴', label: 'Tropical' },
                    { value: 'coastal & beach', icon: '🏖️', label: 'Coastal' },
                    { value: 'desert & dry', icon: '🏜️', label: 'Desert' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({...profile, climate: opt.value})}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        profile.climate === opt.value
                          ? 'border-saffron bg-saffron/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[10px] font-medium text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-saffron to-orange-500 text-slateBg py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,153,51,0.4)] transition-all mt-2">
                Generate My Travel Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Views */}
      {view === 'home' ? (
        <>
          {/* Hero Section */}
          <div className="relative h-[80vh] flex items-center px-8 md:px-20 pt-20">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-slateBg via-slateBg/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slateBg via-transparent to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80" 
                alt="Taj Mahal" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="relative z-10 max-w-2xl mt-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-saffron text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Travel Planning
              </div>
              <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Discover the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron to-yellow-400">Soul of India</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed">
                Plan your perfect journey from the majestic Himalayas to the serene backwaters of Kerala with our intelligent travel assistant.
              </p>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-gradient-to-r from-saffron to-orange-500 text-slateBg px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,153,51,0.4)] flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" /> Start Exploring
              </button>
            </div>
          </div>

          {/* Destinations Grid */}
          <div ref={tripsRef} className="px-8 md:px-20 py-24 relative z-10">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className="text-4xl font-bold">Top Destinations</h3>
                <p className="text-gray-400 mt-2">Curated experiences for your next adventure</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trips.length > 0 ? trips.map((trip, idx) => (
                <div key={idx} onClick={() => setSelectedTrip(trip)} className="group cursor-pointer rounded-3xl overflow-hidden h-[400px] relative shadow-2xl">
                  <img src={trip.image} alt={trip.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slateBg via-slateBg/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-3xl font-bold text-white">{trip.name}</h4>
                      <span className="text-saffron font-bold text-lg bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">{trip.price}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{trip.short_description || trip.description}</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-saffron group-hover:text-slateBg transition-colors">
                      ➔
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center text-gray-400 py-10">Loading trips...</div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Plan Dashboard — true split screen */
        <div className="flex h-screen pt-[72px] overflow-hidden">
          {/* LEFT: Itinerary */}
          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 relative">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-saffron hover:text-white transition-colors mb-8 font-medium">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
            <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex flex-wrap items-center justify-between mb-8 pb-8 border-b border-white/10 gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Your Safar to <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron to-yellow-400">{profile.location}</span></h2>
                  <p className="text-gray-400">Curated for {profile.username}</p>
                </div>
                <div className="flex flex-col gap-1 bg-black/20 px-4 py-3 rounded-2xl text-sm text-gray-300">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-saffron"/>{profile.startDate} → {profile.endDate}</span>
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-saffron"/>{profile.adults} Adults, {profile.children} Children</span>
                </div>
              </div>
              <div className="markdown-body prose prose-invert prose-orange max-w-none">
                {isLoading && !tripPlan ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Compass className="w-16 h-16 text-saffron animate-spin mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Crafting your magical Indian journey...</h3>
                    <p className="text-gray-400 max-w-md mx-auto">Safar is analyzing hotels, selecting the best locations, and calculating the perfect budget.</p>
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{tripPlan}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Embedded Chat */}
          <div className="w-[380px] shrink-0 border-l border-white/10 flex flex-col bg-[#0d1117]">
            <div className="bg-gradient-to-r from-saffron to-orange-500 p-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-saffron">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slateBg text-lg leading-tight">Safar Agent</h3>
                <p className="text-xs text-slateBg/80 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-200 animate-pulse"></span>Online — Ask me anything!</p>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {messages.filter(m => !m.isHidden).map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role==='user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role==='user' ? 'bg-slate-700' : 'bg-saffron text-slateBg'}`}>
                    {msg.role==='user' ? <User className="w-4 h-4 text-white"/> : <Compass className="w-4 h-4"/>}
                  </div>
                  <div className={`max-w-[80%] p-3 text-sm leading-relaxed rounded-2xl ${msg.role==='user' ? 'bg-saffron text-slateBg rounded-tr-sm font-medium' : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5'}`}>
                    <div dangerouslySetInnerHTML={{__html:(msg.displayContent||msg.content).replace(/\*\*(.*?)\*\*/g,'<strong class="text-saffron font-bold">$1</strong>').replace(/\n/g,'<br/>')}} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-saffron text-slateBg flex items-center justify-center"><Compass className="w-4 h-4 animate-spin"/></div>
                  <div className="p-3 bg-white/10 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1 items-center">
                    <div className="w-2 h-2 bg-saffron rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-saffron rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-saffron rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-white/10 bg-[#0d1117] shrink-0">
              <div className="relative">
                <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&sendMessage()} placeholder="Ask Safar to tweak your plan..." className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-11 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-saffron/50 transition-all" />
                <button onClick={()=>sendMessage()} disabled={isLoading||!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-saffron text-slateBg w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors disabled:opacity-50">
                  <Send className="w-3.5 h-3.5"/>
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-2">Safar can make mistakes. Verify important details.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
