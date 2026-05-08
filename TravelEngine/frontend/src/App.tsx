import { useState } from 'react';

function App() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {role: 'assistant', content: 'Namaste! I am Safar, your travel assistant. Where are you starting from, where do you want to go, and what is your travel style (backpacker, standard, luxury)?'}
  ]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, {role: 'user', content: input}];
    setMessages(newMessages);
    setInput('');

    try {
      // In a real app this would call the FastAPI backend
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({messages: newMessages})
      });
      const data = await res.json();
      setMessages([...newMessages, data]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, {role: 'assistant', content: 'Oops! The server is not responding. Please make sure the FastAPI backend is running on port 8000.'}]);
    }
  };

  return (
    <div className="min-h-screen bg-slateBg relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 w-full p-6 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-saffron tracking-wider">TravelEngine</h1>
        <div className="flex gap-6 font-medium text-sm">
          <a href="#" className="hover:text-saffron transition-colors">Destinations</a>
          <a href="#" className="hover:text-saffron transition-colors">Trips</a>
          <a href="#" className="hover:text-saffron transition-colors">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center px-12 pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* A gradient placeholder representing a stunning Indian landscape */}
          <div className="absolute inset-0 bg-gradient-to-r from-slateBg via-slateBg/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80" 
            alt="Taj Mahal" 
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Discover the <br/><span className="text-saffron">Soul of India</span>
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-lg">
            Plan your perfect journey from the majestic Himalayas to the serene backwaters of Kerala with our AI travel assistant.
          </p>
          <button className="bg-saffron text-slateBg px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition-colors shadow-lg shadow-saffron/30">
            Start Exploring
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="px-12 py-20 relative z-10">
        <h3 className="text-3xl font-bold mb-10">Top Destinations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'},
            {name: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80'},
            {name: 'Varanasi', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80'}
          ].map((dest, idx) => (
            <div key={idx} className="glass-panel overflow-hidden group cursor-pointer h-72 relative">
              <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="text-2xl font-bold">{dest.name}</h4>
                <p className="text-saffron text-sm mt-1 flex items-center gap-1">Explore Itineraries ➔</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chatbot */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%-4rem)] opacity-90'}`}>
        {/* Chat Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-saffron text-slateBg w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-saffron/30 mb-4 hover:scale-105 transition-transform"
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
        
        {/* Chat Window */}
        <div className={`glass-panel w-80 md:w-96 h-[500px] flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isChatOpen ? 'scale-100' : 'scale-0'}`}>
          <div className="bg-saffron/20 p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-saffron text-slateBg flex items-center justify-center font-bold text-sm">S</div>
              <div>
                <h3 className="font-semibold text-white">Safar Agent</h3>
                <p className="text-xs text-saffron">Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-saffron text-slateBg rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'}`}>
                  {/* Using dangerouslySetInnerHTML to render basic bold markdown from backend */}
                  <div dangerouslySetInnerHTML={{__html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Where do you want to go?" 
                className="flex-1 bg-white/5 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-saffron"
              />
              <button 
                onClick={sendMessage}
                className="bg-saffron text-slateBg w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                ➔
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
