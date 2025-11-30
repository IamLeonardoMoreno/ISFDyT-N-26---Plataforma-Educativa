
import React, { useState, useRef } from 'react';
import { User, UserRole, AppTheme } from '../types';
import { User as UserIcon, Lock, Shield, Save, CheckCircle, Bell, Upload, Palette, Phone, MapPin } from 'lucide-react';
import { updateUser } from '../services/mockDatabase';

interface SettingsViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(currentUser.preferences?.emailNotifications ?? true);
  const [darkMode, setDarkMode] = useState(currentUser.preferences?.darkMode ?? false);
  const [theme, setTheme] = useState<AppTheme>(currentUser.preferences?.theme || 'indigo');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Simple validation: Max 1MB
        if (file.size > 1024 * 1024) {
            alert("La imagen es demasiado grande. El tamaño máximo es 1MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUser(currentUser.id, { 
        name, 
        email, 
        phone, 
        address, 
        avatar: avatarPreview 
    });
    if (updated) {
        onUpdateUser(updated);
        showSuccess('Perfil actualizado correctamente.');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }
    if (newPassword.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres");
        return;
    }
    
    // In a real app we would verify currentPassword against DB
    const updated = updateUser(currentUser.id, { password: newPassword });
    if (updated) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showSuccess('Contraseña modificada con éxito.');
    }
  };

  const handlePreferenceUpdate = (key: keyof typeof currentUser.preferences, value: any) => {
      const newPrefs = { 
        emailNotifications: key === 'emailNotifications' ? value : emailNotifications,
        darkMode: key === 'darkMode' ? value : darkMode,
        theme: key === 'theme' ? value : theme
      };
      
      if (key === 'emailNotifications') setEmailNotifications(value);
      if (key === 'darkMode') setDarkMode(value);
      if (key === 'theme') setTheme(value);

      const updated = updateUser(currentUser.id, { preferences: newPrefs });
      if (updated) {
          onUpdateUser(updated);
      }
  };

  const themeOptions: { id: AppTheme; name: string; color: string }[] = [
      { id: 'indigo', name: 'Indigo (Original)', color: 'bg-indigo-600' },
      { id: 'teal', name: 'Verde Azulado', color: 'bg-teal-600' },
      { id: 'blue', name: 'Azul Clásico', color: 'bg-blue-600' },
      { id: 'rose', name: 'Rosa Intenso', color: 'bg-rose-600' },
      { id: 'violet', name: 'Violeta', color: 'bg-violet-600' },
      { id: 'amber', name: 'Ambar', color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
            <p className="text-gray-500 text-sm">Administra tu cuenta y preferencias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
            <nav className="flex flex-col">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-3 text-left flex items-center space-x-3 text-sm font-medium transition ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <UserIcon className="w-5 h-5" />
                    <span>Perfil</span>
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-3 text-left flex items-center space-x-3 text-sm font-medium transition ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Lock className="w-5 h-5" />
                    <span>Seguridad</span>
                </button>
                 <button 
                    onClick={() => setActiveTab('preferences')}
                    className={`px-4 py-3 text-left flex items-center space-x-3 text-sm font-medium transition ${activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Palette className="w-5 h-5" />
                    <span>Preferencias</span>
                </button>
            </nav>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3">
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center animate-fade-in-down">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {successMessage}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Información Personal</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="flex items-center mb-6">
                            <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-indigo-100 mr-4 object-cover" />
                            <div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageSelect} 
                                    accept="image/png, image/jpeg, image/gif" 
                                    className="hidden" 
                                />
                                <button 
                                    type="button" 
                                    onClick={triggerFileInput}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 flex items-center"
                                >
                                    <Upload className="w-3 h-3 mr-1.5" /> Cambiar Foto
                                </button>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG o GIF. Max 1MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-9 border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                            placeholder="Cod. Área + Número"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Localidad</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-9 border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                            placeholder="Calle y Altura"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol de Usuario</label>
                                <input 
                                    type="text" 
                                    disabled
                                    value={currentUser.role}
                                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Seguridad y Contraseña</h3>
                    
                    <form onSubmit={handleSavePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> Actualizar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'preferences' && (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Preferencias del Sistema</h3>
                    
                    <div className="space-y-6">
                         {/* Color Theme Selection */}
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center">
                                    <Palette className="w-4 h-4 mr-2 text-indigo-600" /> Tema de Color
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">Personaliza la apariencia de la plataforma.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {themeOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handlePreferenceUpdate('theme', option.id)}
                                        className={`flex items-center p-3 rounded-lg border transition-all ${
                                            theme === option.id 
                                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-100 shadow-sm' 
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${option.color} mr-3 border border-black/10`}></div>
                                        <span className={`text-sm font-medium ${theme === option.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {option.name}
                                        </span>
                                        {theme === option.id && (
                                            <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-gray-500 mr-3" />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Notificaciones por Email</h4>
                                    <p className="text-xs text-gray-500">Recibir correos cuando se publiquen notas.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={emailNotifications} 
                                    onChange={(e) => handlePreferenceUpdate('emailNotifications', e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-5 h-5 bg-gray-800 rounded-full mr-3 border border-gray-600"></div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Tema Oscuro (Beta)</h4>
                                    <p className="text-xs text-gray-500">Cambiar la interfaz a modo nocturno.</p>
                                </div>
                            </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={darkMode}
                                    onChange={(e) => handlePreferenceUpdate('darkMode', e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
