
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, ChatGroup } from '../types';
import { getContacts, getMessages, sendMessage, markMessagesAsRead, clearChat, toggleBlockUser, isUserBlocked, getGroups, createGroup, sendGroupMessage, getUsers, getUserById } from '../services/mockDatabase';
import { Search, Send, User as UserIcon, MoreVertical, Phone, Video, Trash2, UserX, UserCircle, CheckCircle, Info, X, Lock, Unlock, Shield, Mail, AlertTriangle, Mic, MicOff, VideoOff, PhoneOff, Users, Plus, CheckSquare, Square } from 'lucide-react';

interface ChatViewProps {
  currentUser: User;
}

interface ActiveCall {
    type: 'audio' | 'video';
    status: 'calling' | 'connected';
}

// Unified interface for the sidebar list (can be a User or a Group)
interface ConversationItem {
    id: string;
    name: string;
    avatar?: string;
    type: 'user' | 'group';
    unread: number;
    lastMessage?: string;
    isBlocked?: boolean; // Only for users
    role?: string; // Only for users
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  
  // UI State for Modals/Toasts
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Group Creation State
  const [newGroupName, setNewGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Call State
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [currentUser, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
        loadMessages();
        if (selectedConversation.type === 'user') {
             markMessagesAsRead(currentUser.id, selectedConversation.id);
             // Refresh blocked status for selected contact if it's a user
             const currentStatus = isUserBlocked(currentUser.id, selectedConversation.id);
             if (selectedConversation.isBlocked !== currentStatus) {
                 setSelectedConversation(prev => prev ? ({ ...prev, isBlocked: currentStatus }) : null);
             }
        }
        
        setIsHeaderMenuOpen(false);
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call Timer Logic
  useEffect(() => {
    let interval: any;
    if (activeCall?.status === 'connected') {
        interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  const loadData = () => {
      // Load Users
      const users = getContacts(currentUser.id);
      // Load Groups
      const groups = getGroups(currentUser.id);

      // Merge into Conversations
      const userItems: ConversationItem[] = users.map(u => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          type: 'user',
          unread: u.unread,
          lastMessage: u.lastMessage,
          isBlocked: u.isBlocked,
          role: u.role
      }));

      const groupItems: ConversationItem[] = groups.map(g => {
          // Logic to get last message for group would be similar to users
          const groupMsgs = getMessages(currentUser.id, g.id, true);
          const lastMsg = groupMsgs.length > 0 ? groupMsgs[groupMsgs.length - 1].content : undefined;
          return {
              id: g.id,
              name: g.name,
              avatar: g.avatar,
              type: 'group',
              unread: 0, // TODO: Implement unread count for groups
              lastMessage: lastMsg
          };
      });

      setConversations([...userItems, ...groupItems]);
  };

  const loadMessages = () => {
      if (selectedConversation) {
          const isGroup = selectedConversation.type === 'group';
          const msgs = getMessages(currentUser.id, selectedConversation.id, isGroup);
          setMessages(msgs);
      }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedConversation) return;
      
      if (selectedConversation.type === 'user' && selectedConversation.isBlocked) {
          showNotification("No puedes enviar mensajes a un usuario bloqueado.", 'error');
          return;
      }

      if (selectedConversation.type === 'group') {
          sendGroupMessage(currentUser.id, selectedConversation.id, newMessage);
      } else {
          sendMessage(currentUser.id, selectedConversation.id, newMessage);
      }
      
      setNewMessage('');
      loadMessages();
      loadData();
  };

  const handleClearChatClick = () => {
      setIsHeaderMenuOpen(false);
      setIsClearChatModalOpen(true);
  };

  const confirmClearChat = () => {
    if (selectedConversation) {
        clearChat(currentUser.id, selectedConversation.id);
        setMessages([]);
        loadData();
        showNotification("Conversación vaciada correctamente.", 'success');
        setIsClearChatModalOpen(false);
    }
  };

  const handleViewProfile = () => {
      if(selectedConversation) {
          setIsHeaderMenuOpen(false);
          setIsProfileModalOpen(true);
      }
  };

  const handleToggleBlockUser = () => {
      if(selectedConversation && selectedConversation.type === 'user') {
          const isNowBlocked = toggleBlockUser(currentUser.id, selectedConversation.id);
          setSelectedConversation({ ...selectedConversation, isBlocked: isNowBlocked });
          setIsHeaderMenuOpen(false);
          loadData();
          
          if (isNowBlocked) {
              showNotification(`Has bloqueado a ${selectedConversation.name}.`, 'error');
          } else {
              showNotification(`Has desbloqueado a ${selectedConversation.name}.`, 'success');
          }
      }
  };

  // Call Functions
  const startCall = (type: 'audio' | 'video') => {
      if (!selectedConversation || (selectedConversation.type === 'user' && selectedConversation.isBlocked)) return;
      // Optional: Disable calls for groups in this demo
      if (selectedConversation.type === 'group') {
          showNotification("Las llamadas grupales no están disponibles en esta versión.", 'info');
          return;
      }
      
      setActiveCall({ type, status: 'calling' });
      setCallDuration(0);
      setIsMuted(false);
      setIsCamOff(type === 'audio'); 

      // Simulate connection
      setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
      }, 2500);
  };

  const endCall = () => {
      setActiveCall(null);
      setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group Creation Logic
  const openCreateGroupModal = () => {
      // Load all users except me
      const users = getUsers().filter(u => u.id !== currentUser.id);
      setAvailableUsers(users);
      setSelectedGroupMembers([]);
      setNewGroupName('');
      setIsGroupModalOpen(true);
  };

  const toggleGroupMember = (userId: string) => {
      if (selectedGroupMembers.includes(userId)) {
          setSelectedGroupMembers(prev => prev.filter(id => id !== userId));
      } else {
          setSelectedGroupMembers(prev => [...prev, userId]);
      }
  };

  const handleCreateGroup = () => {
      if (!newGroupName || selectedGroupMembers.length === 0) return;
      createGroup(newGroupName, selectedGroupMembers, currentUser.id);
      setIsGroupModalOpen(false);
      showNotification("Grupo creado exitosamente", 'success');
      loadData();
  };

  const filteredConversations = conversations.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper to get sender name for group chats
  const getSenderName = (senderId: string) => {
      if (senderId === currentUser.id) return 'Tú';
      const user = getUserById(senderId);
      return user ? user.name.split(',')[0] : 'Usuario'; // Just return Surname or generic
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col min-w-[280px]">
        <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">Mensajes</h2>
                <button 
                    onClick={openCreateGroupModal}
                    className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition"
                    title="Crear Grupo"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..."
                    className="w-full bg-gray-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
                <div 
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 transition ${selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                >
                    <div className="relative mr-3">
                        {conv.type === 'group' ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                        ) : (
                            <img src={conv.avatar} alt={conv.name} className={`w-10 h-10 rounded-full object-cover border ${conv.isBlocked ? 'border-red-300 grayscale' : 'border-gray-200'}`} />
                        )}
                        
                        {/* Blocked indicator */}
                        {conv.isBlocked && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                <Lock className="w-2.5 h-2.5" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`text-sm font-semibold truncate ${selectedConversation?.id === conv.id ? 'text-indigo-900' : 'text-gray-900'} ${conv.isBlocked ? 'text-gray-500' : ''}`}>
                                {conv.name}
                            </h3>
                            {conv.unread > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {conv.unread}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center">
                            {conv.isBlocked && <Lock className="w-3 h-3 mr-1 text-red-400" />}
                            {conv.lastMessage ? (
                                <span className={conv.unread > 0 ? 'font-semibold text-gray-800' : ''}>{conv.lastMessage}</span>
                            ) : (
                                <span className="italic text-gray-400">
                                    {conv.type === 'group' ? 'Nuevo grupo creado' : 'Inicia una conversación'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/50 relative">
        {selectedConversation ? (
            <>
                {/* Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm relative z-20">
                    <div className="flex items-center cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                        {selectedConversation.type === 'group' ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 mr-3">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                        ) : (
                            <img 
                                src={selectedConversation.avatar} 
                                alt={selectedConversation.name} 
                                className={`w-10 h-10 rounded-full mr-3 border border-gray-200 ${selectedConversation.isBlocked ? 'grayscale' : ''}`} 
                            />
                        )}
                        <div>
                            <h3 className="font-bold text-gray-800 flex items-center">
                                {selectedConversation.name}
                                {selectedConversation.isBlocked && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">BLOQUEADO</span>}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {selectedConversation.type === 'group' ? 'Grupo' : selectedConversation.role}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-2 text-gray-400 relative">
                        {selectedConversation.type === 'user' && (
                            <>
                                <button 
                                    onClick={() => startCall('audio')}
                                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition" 
                                    disabled={selectedConversation.isBlocked}
                                    title="Llamada de voz"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => startCall('video')}
                                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition" 
                                    disabled={selectedConversation.isBlocked}
                                    title="Videollamada"
                                >
                                    <Video className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                            className={`p-2 rounded-full transition ${isHeaderMenuOpen ? 'bg-gray-100 text-gray-600' : 'hover:bg-gray-100'}`}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Header Menu Dropdown */}
                        {isHeaderMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsHeaderMenuOpen(false)}></div>
                                <div className="absolute right-0 top-10 w-56 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100 animate-fadeIn">
                                    <button 
                                        onClick={handleViewProfile}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <UserCircle className="w-4 h-4 mr-2" /> Ver Info
                                    </button>
                                    <button 
                                        onClick={handleClearChatClick}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Vaciar Chat
                                    </button>
                                    
                                    {selectedConversation.type === 'user' && (
                                        <>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button 
                                                onClick={handleToggleBlockUser}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${selectedConversation.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {selectedConversation.isBlocked ? (
                                                    <>
                                                        <Unlock className="w-4 h-4 mr-2" /> Desbloquear
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="w-4 h-4 mr-2" /> Bloquear Usuario
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                             <p className="text-sm italic">No hay mensajes en esta conversación.</p>
                         </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUser.id;
                            const senderName = selectedConversation.type === 'group' && !isMe ? getSenderName(msg.senderId) : null;
                            
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {senderName && (
                                        <span className="text-[10px] text-gray-500 mb-1 ml-1">{senderName}</span>
                                    )}
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                        isMe 
                                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] text-right mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (
                                                <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    {selectedConversation.isBlocked ? (
                        <div className="text-center p-2 text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium flex items-center justify-center">
                                <Lock className="w-4 h-4 mr-2" />
                                Has bloqueado a este usuario. No puedes enviar mensajes.
                            </p>
                            <button 
                                onClick={handleToggleBlockUser}
                                className="text-xs text-indigo-600 hover:underline mt-1"
                            >
                                Desbloquear ahora
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 border border-gray-600 bg-gray-700 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <UserIcon className="w-12 h-12 text-indigo-200" />
                </div>
                <h3 className="text-lg font-medium text-gray-600">Selecciona un contacto o grupo</h3>
                <p className="text-sm">Comienza a chatear con docentes, alumnos o preceptores.</p>
            </div>
        )}

        {/* Toast Notification */}
        {notification && (
            <div className={`absolute top-20 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fadeIn z-50 ${
                notification.type === 'success' ? 'bg-green-800 text-white' : 
                notification.type === 'error' ? 'bg-red-800 text-white' : 'bg-gray-800 text-white'
            }`}>
                {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                <span className="text-sm font-medium">{notification.message}</span>
            </div>
        )}

        {/* Create Group Modal */}
        {isGroupModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Crear Nuevo Grupo</h3>
                        <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                            <input 
                                type="text"
                                className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Ej. Proyecto Final 2024"
                            />
                        </div>
                        
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Integrantes</label>
                            <div className="space-y-2 border border-gray-200 rounded-lg p-2 max-h-60 overflow-y-auto">
                                {availableUsers.map(user => (
                                    <div 
                                        key={user.id} 
                                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 ${selectedGroupMembers.includes(user.id) ? 'bg-indigo-50' : ''}`}
                                        onClick={() => toggleGroupMember(user.id)}
                                    >
                                        <div className="mr-3">
                                            {selectedGroupMembers.includes(user.id) ? (
                                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {selectedGroupMembers.length} seleccionados
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button 
                            onClick={() => setIsGroupModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleCreateGroup}
                            disabled={!newGroupName || selectedGroupMembers.length === 0}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Crear Grupo
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Profile Modal (Reused for Group Info roughly) */}
        {isProfileModalOpen && selectedConversation && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                    <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        className="absolute top-3 right-3 bg-white/20 p-1 rounded-full hover:bg-white/40 text-white transition z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Cover & Avatar */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500 relative">
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                            {selectedConversation.type === 'group' ? (
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-indigo-100 flex items-center justify-center">
                                    <Users className="w-12 h-12 text-indigo-600" />
                                </div>
                            ) : (
                                <img 
                                    src={selectedConversation.avatar} 
                                    alt={selectedConversation.name} 
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                />
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pt-12 pb-6 px-6 text-center">
                        <h3 className="text-xl font-bold text-gray-800">{selectedConversation.name}</h3>
                        <p className="text-indigo-600 font-medium text-sm mb-4">
                            {selectedConversation.type === 'group' ? 'Grupo de Chat' : selectedConversation.role}
                        </p>
                        
                        <div className="space-y-3 text-left mb-6">
                             <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <Shield className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">ID: {selectedConversation.id}</span>
                            </div>
                             {selectedConversation.type === 'user' && (
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                    {/* In a real app, we would fetch the email here */}
                                    <span className="text-sm">usuario@instituto.edu.ar</span>
                                </div>
                             )}
                        </div>

                        {selectedConversation.type === 'user' && (
                            selectedConversation.isBlocked ? (
                                <button 
                                    onClick={handleToggleBlockUser}
                                    className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 flex justify-center items-center"
                                >
                                    <Unlock className="w-4 h-4 mr-2" /> Desbloquear Usuario
                                </button>
                            ) : (
                                <button 
                                    onClick={handleToggleBlockUser}
                                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 flex justify-center items-center"
                                >
                                    <UserX className="w-4 h-4 mr-2" /> Bloquear Usuario
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Clear Chat Confirmation Modal */}
        {isClearChatModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2">¿Vaciar conversación?</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        Esta acción eliminará permanentemente todos los mensajes de este chat. No podrás deshacer esta acción.
                    </p>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setIsClearChatModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmClearChat}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Vaciar
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Active Call Overlay */}
        {activeCall && selectedConversation && (
             <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-4 animate-fadeIn">
                 {/* Background Blur Effect */}
                 <div className="absolute inset-0 overflow-hidden opacity-20">
                    {selectedConversation.avatar && <img src={selectedConversation.avatar} className="w-full h-full object-cover blur-xl" alt="" />}
                 </div>

                 <div className="z-10 flex flex-col items-center">
                     <div className="mb-8 relative">
                         <img 
                            src={selectedConversation.avatar} 
                            alt={selectedConversation.name} 
                            className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl" 
                        />
                        {activeCall.status === 'calling' && (
                            <div className="absolute -inset-2 rounded-full border-4 border-indigo-500/50 animate-ping"></div>
                        )}
                     </div>
                     
                     <h2 className="text-3xl font-bold mb-2">{selectedConversation.name}</h2>
                     <p className="text-indigo-300 text-lg mb-12 font-medium">
                         {activeCall.status === 'calling' ? 'Llamando...' : formatDuration(callDuration)}
                     </p>

                     <div className="flex items-center space-x-8">
                         <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                         >
                             {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                         </button>
                         
                         <button 
                            onClick={endCall}
                            className="p-6 rounded-full bg-red-600 hover:bg-red-700 shadow-lg transform hover:scale-105 transition"
                         >
                             <PhoneOff className="w-10 h-10 fill-current" />
                         </button>

                         <button 
                            onClick={() => setIsCamOff(!isCamOff)}
                            disabled={activeCall.type === 'audio'}
                            className={`p-4 rounded-full transition ${isCamOff || activeCall.type === 'audio' ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20 text-white'} ${activeCall.type === 'audio' ? 'opacity-50 cursor-not-allowed' : ''}`}
                         >
                             {isCamOff ? <VideoOff className="w-8 h-8" /> : <Video className="w-8 h-8" />}
                         </button>
                     </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
