import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Heart, Phone, HelpCircle } from 'lucide-react';

export default function ResQChatbot({ isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I am ResQ Bot 🐾. How can I assist you with animal rescue, first-aid, or reporting today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const faqResponses = {
    dog_first_aid: {
      question: "🐶 Dog Accident First-Aid",
      answer: "If you see a dog in an accident:\n\n1. **Ensure Safety First**: Make sure you are not in danger of oncoming traffic.\n2. **Approach Calmly**: Speak softly so the dog doesn't get scared and bite.\n3. **Stop Bleeding**: Apply gentle pressure using a clean cloth on the wound.\n4. **Keep Warm**: Cover the dog with a blanket/bedsheet to prevent shock.\n5. **Report Immediately**: Click the 'Report Now' button at the top to alert local NGOs and Volunteers."
    },
    bird_first_aid: {
      question: "🐦 Injured Bird Guide",
      answer: "For an injured bird:\n\n1. **Use a Small Box**: Place the bird in a cardboard box with small ventilation holes.\n2. **Warm & Quiet Environment**: Place the box in a warm, dark, and quiet room away from pets.\n3. **Do Not Force Food/Water**: Forcing liquids can cause them to choke or drown.\n4. **Report**: Create a report on ResQPaws so a bird rehabilitation specialist or volunteer can assist."
    },
    how_to_report: {
      question: "📝 How do I submit a report?",
      answer: "To report an animal in need:\n\n1. Make sure you are logged in. (If you don't have an account, click Register).\n2. Click on the **'Report Now'** button.\n3. Upload a photo of the animal. Our simulated AI scanner will auto-detect the species!\n4. Use the interactive **OpenStreetMap Map Picker** to pinpoint the exact location on the map.\n5. Fill in the description & priority, then click Submit!"
    },
    helpline: {
      question: "📞 Local NGO Helplines",
      answer: "Emergency Numbers:\n\n- **ResQPaws Helpline**: +91 98765 43210 (24x7 Emergency Line)\n- **Sanjay Gandhi Animal Care Centre (Delhi)**: 011-25448062\n- **Friendicoes (Delhi/NCR)**: +91 98100 00538\n- **Help in Suffering (Jaipur)**: 0141-2760012\n- **Jeev Ashraya (Lucknow)**: +91 99368 47777"
    },
    volunteer_info: {
      question: "🤝 Join as a Volunteer/NGO",
      answer: "We are always looking for passionate animal lovers!\n\n1. Click **'Register'** on the landing page.\n2. Select your role as **Volunteer** or **NGO**.\n3. Once registered, the Admin will review your application and approve your account.\n4. After approval, you will get access to your dashboard to accept and verify active rescue cases in your city!"
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart bot response based on keywords
    setTimeout(() => {
      let replyText = "I'm sorry, I didn't quite get that. Try selecting one of our quick first-aid guide options below or query for keywords like 'first-aid', 'dog', 'bird', 'report', or 'helpline'.";
      const cleanText = text.toLowerCase();

      if (cleanText.includes('dog') || cleanText.includes('puppy') || cleanText.includes('accident') || cleanText.includes('bleed')) {
        replyText = faqResponses.dog_first_aid.answer;
      } else if (cleanText.includes('bird') || cleanText.includes('pigeon') || cleanText.includes('fly')) {
        replyText = faqResponses.bird_first_aid.answer;
      } else if (cleanText.includes('report') || cleanText.includes('post') || cleanText.includes('submit')) {
        replyText = faqResponses.how_to_report.answer;
      } else if (cleanText.includes('helpline') || cleanText.includes('number') || cleanText.includes('call') || cleanText.includes('ngo')) {
        replyText = faqResponses.helpline.answer;
      } else if (cleanText.includes('volunteer') || cleanText.includes('join') || cleanText.includes('register')) {
        replyText = faqResponses.volunteer_info.answer;
      } else if (cleanText.includes('hello') || cleanText.includes('hi') || cleanText.includes('hey')) {
        replyText = "Hello there! How can I help you today? You can select any category below to get instant guidance.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 900);
  };

  const handleChipClick = (key) => {
    const chip = faqResponses[key];
    if (!chip) return;

    // Add user's question first
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: chip.question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsTyping(true);

    // Reply with answer
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: chip.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Chat Bubble Icon */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1E5F3F',
          color: '#ffffff',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(30, 95, 63, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {/* Unread dot indicator */}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #ffffff'
          }} />
        )}
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '380px',
          height: '540px',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          textAlign: 'left'
        }}>
          {/* Header Panel */}
          <div style={{
            backgroundColor: '#1E5F3F',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                🐾
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>ResQ Bot Support</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#a7f3d0', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                  Online First-Aid Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Content */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--light-gray)'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{
                  backgroundColor: msg.sender === 'user' ? '#1E5F3F' : 'var(--white)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-dark)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-line',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                }}>
                  {msg.text}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-light)',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  padding: '0 4px'
                }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--white)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem' }}>🐾 Typing</span>
                <span className="dot-bounce" style={{ animation: 'bounce 1s infinite 0.1s' }}>.</span>
                <span className="dot-bounce" style={{ animation: 'bounce 1s infinite 0.2s' }}>.</span>
                <span className="dot-bounce" style={{ animation: 'bounce 1s infinite 0.3s' }}>.</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--white)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none'
          }}>
            {Object.keys(faqResponses).map(key => (
              <button
                key={key}
                onClick={() => handleChipClick(key)}
                style={{
                  fontSize: '0.72rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #1E5F3F',
                  backgroundColor: '#EBF5F0',
                  color: '#1E5F3F',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1E5F3F'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#EBF5F0'; e.currentTarget.style.color = '#1E5F3F'; }}
              >
                {faqResponses[key].question.split(' ')[0]} {faqResponses[key].question.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>

          {/* Input Chat Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--white)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask me something (e.g. dog bleeding)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                padding: '10px 16px',
                fontSize: '0.82rem',
                outline: 'none',
                backgroundColor: 'var(--light-gray)',
                color: 'var(--text-dark)'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#1E5F3F',
                color: '#ffffff',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Inline styles for custom bouncing dot animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />
    </>
  );
}
