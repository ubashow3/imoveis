
import React, { useState, useEffect, useRef } from 'react';
import { Property, ViewState, PropertyType, SiteSettings, ThemeOption } from './types';
import { generatePropertyDescription } from './services/geminiService';
import { PropertyCard } from './components/PropertyCard';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Umbrella, 
  Building2, 
  ArrowLeft, 
  LogOut, 
  Sparkles,
  CheckCircle,
  Menu,
  X,
  MapPin,
  Bed,
  Bath,
  Expand,
  Waves,
  Settings,
  Instagram,
  Facebook,
  Phone,
  Clock,
  Mail,
  Palette,
  Save,
  Trash2,
  Image as ImageIcon,
  Edit,
  Users,
  Calendar,
  Upload,
  Camera,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';

// --- UTILS ---
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- CUSTOM LOGO COMPONENT ---
const UbatubaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="8" className="text-ocean-600" fill="white"/>
    {/* Roof */}
    <path d="M30 90 L100 40 L170 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-ocean-800"/>
    <path d="M55 72 L55 55 L65 55 L65 65" stroke="currentColor" strokeWidth="6" className="text-ocean-800"/>
    <rect x="60" y="90" width="20" height="20" fill="currentColor" className="text-ocean-800"/>
    <rect x="120" y="90" width="20" height="20" fill="currentColor" className="text-ocean-800"/>
    
    {/* Text */}
    <text x="100" y="135" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="black" letterSpacing="-1">ALUGA-SE</text>
    <text x="100" y="160" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" className="fill-ocean-600" letterSpacing="-1">UBATUBA</text>
    <text x="160" y="175" textAnchor="end" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" className="fill-ocean-600">.COM</text>
    
    {/* Waves */}
    <path d="M20 115 Q 50 105, 80 115 T 140 115 T 180 105" stroke="currentColor" strokeWidth="4" fill="none" className="text-ocean-400"/>
  </svg>
);

// --- MOCK DATA ---
const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Cobertura Praia Grande',
    description: 'Espetacular cobertura com vista total para o mar na Praia Grande. Prédio novo com piscina na sacada, churrasqueira e ar condicionado em todos os ambientes. Próximo aos melhores quiosques.',
    location: 'Praia Grande, Ubatuba',
    price: 1800000,
    type: 'sale',
    bedrooms: 3,
    bathrooms: 4,
    area: 140,
    images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Vista Mar', 'Piscina Privativa', 'Churrasqueira', 'Ar Condicionado'],
    views: 1240
  },
  {
    id: '2',
    title: 'Casa em Itamambuca',
    description: 'Casa rústica e aconchegante dentro do condomínio de Itamambuca. Cercada pela mata atlântica, a poucos metros da praia. Ideal para surfistas e amantes da natureza.',
    location: 'Itamambuca, Ubatuba',
    price: 1800,
    type: 'rent_seasonal',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    images: [
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1595867858492-5d149242062e?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Próximo ao Mar', 'Jardim Amplo', 'Wi-Fi Fibra', 'Redário'],
    views: 850
  },
  {
    id: '3',
    title: 'Apto Varanda Gourmet Tenório',
    description: 'Apartamento amplo com varanda gourmet envidraçada. Condomínio com lazer completo (piscina, sauna, salão de jogos). Excelente localização no Tenório.',
    location: 'Tenório, Ubatuba',
    price: 850000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Varanda Gourmet', 'Piscina no Condomínio', 'Portaria 24h'],
    views: 620
  },
  {
    id: '4',
    title: 'Refúgio no Prumirim',
    description: 'Casa de alto padrão com arquitetura moderna e vista para a Ilha do Prumirim. Privacidade total e acesso exclusivo à praia.',
    location: 'Prumirim, Ubatuba',
    price: 3500,
    type: 'rent_seasonal',
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    images: [
        'https://images.unsplash.com/photo-1600596542815-2250657d2f11?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Vista Panorâmica', 'Piscina Infinita', 'Design Moderno'],
    views: 2100
  },
   {
    id: '5',
    title: 'Flat Centro de Ubatuba',
    description: 'Praticidade e conforto no centro da cidade. Próximo a restaurantes, lojas e ao calçadão. Ótimo investimento para locação Airbnb.',
    location: 'Centro, Ubatuba',
    price: 450000,
    type: 'sale',
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    images: [
        'https://images.unsplash.com/photo-1502000206303-7e02c072cbf9?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Mobiliado', 'Elevador', 'Zeladoria'],
    views: 430
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Aluga-se Ubatuba',
  primaryColor: 'ocean',
  contact: {
    address: 'Av. Leovigildo Dias Vieira, 1000 - Itaguá',
    phone: '(12) 99999-9999',
    bookingPhone: '(12) 98888-8888', 
    email: 'contato@alugaseubatuba.com.br',
    hours: 'Seg a Sex: 09h - 18h | Sáb: 09h - 13h'
  },
  social: {
    instagram: '@alugaseubatuba',
    facebook: '/alugaseubatuba'
  }
};

// --- COMPONENTS ---

const PropertyDetails: React.FC<{
  property: Property;
  onBack: () => void;
  bookingPhone: string;
}> = ({ property, onBack, bookingPhone }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * property.price;
  };

  const handleBooking = () => {
    let message = '';
    let phone = bookingPhone || '5512999999999'; // Fallback
    
    if (property.type === 'rent_seasonal') {
      const total = calculateTotal();
      message = `Olá! Gostaria de reservar o imóvel "${property.title}" de ${startDate} a ${endDate}. Total estimado: R$ ${total}.`;
    } else {
      message = `Olá! Tenho interesse em comprar o imóvel "${property.title}" (ID: ${property.id}).`;
    }
    
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <button 
        onClick={onBack} 
        className="flex items-center text-muted hover:text-ocean-600 mb-4"
      >
        <ArrowLeft size={20} className="mr-2" /> Voltar
      </button>

      {/* Carousel / Slider */}
      <div className="relative h-[300px] md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden mb-8 group">
        <img 
          src={property.images[currentImageIndex] || 'https://via.placeholder.com/800x600'} 
          alt={property.title} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Navigation Buttons */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentImageIndex + 1} / {property.images.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <span className="text-ocean-600 font-bold text-sm uppercase tracking-wider">
              {property.type === 'sale' ? 'Venda' : 'Aluguel de Temporada'}
            </span>
            <h1 className="text-3xl font-bold text-main mt-1">{property.title}</h1>
            <div className="flex items-center text-muted mt-2">
              <MapPin size={18} className="mr-1" />
              {property.location}
            </div>
          </div>

          <div className="flex gap-6 border-y border-ocean-100 py-6 my-6">
            <div className="flex flex-col items-center">
              <Bed size={24} className="text-ocean-500 mb-1" />
              <span className="font-semibold text-main">{property.bedrooms}</span>
              <span className="text-xs text-muted">Quartos</span>
            </div>
            <div className="flex flex-col items-center">
              <Bath size={24} className="text-ocean-500 mb-1" />
              <span className="font-semibold text-main">{property.bathrooms}</span>
              <span className="text-xs text-muted">Banheiros</span>
            </div>
            <div className="flex flex-col items-center">
              <Expand size={24} className="text-ocean-500 mb-1" />
              <span className="font-semibold text-main">{property.area} m²</span>
              <span className="text-xs text-muted">Área</span>
            </div>
             <div className="flex flex-col items-center">
              <Users size={24} className="text-ocean-500 mb-1" />
              <span className="font-semibold text-main">{property.views}</span>
              <span className="text-xs text-muted">Visitas</span>
            </div>
          </div>

          <div className="prose max-w-none text-muted mb-8">
            <h3 className="text-lg font-bold text-main mb-2">Sobre o Imóvel</h3>
            <p>{property.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-main mb-3">O que este lugar oferece</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, idx) => (
                <span key={idx} className="bg-ocean-50 text-ocean-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <CheckCircle size={14} className="mr-1" /> {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Booking / Contact Widget (Below features on mobile due to grid order, side on desktop) */}
        <div className="lg:col-span-1">
           <div className="bg-card border border-ocean-200 rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <span className="text-3xl font-bold text-ocean-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                </span>
                {property.type === 'rent_seasonal' && <span className="text-muted font-normal"> /dia</span>}
              </div>

              {property.type === 'rent_seasonal' && (
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1 uppercase">Check-in</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-ocean-200 rounded-lg focus:border-ocean-500 outline-none text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1 uppercase">Check-out</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-ocean-200 rounded-lg focus:border-ocean-500 outline-none text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {startDate && endDate && (
                     <div className="bg-ocean-50 p-3 rounded-lg flex justify-between items-center text-sm">
                        <span>Total estimado:</span>
                        <span className="font-bold text-ocean-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                        </span>
                     </div>
                  )}
                </div>
              )}

              <button 
                onClick={handleBooking}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md mb-4"
              >
                 <Phone size={20} />
                 {property.type === 'rent_seasonal' ? 'Solicitar Reserva' : 'Tenho Interesse'}
              </button>
              
              <div className="text-center text-xs text-muted">
                Você será redirecionado para o WhatsApp.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminForm: React.FC<{
  property: Partial<Property>;
  onSave: (p: Property) => void;
  onCancel: () => void;
  onChange: (p: Partial<Property>) => void;
}> = ({ property, onSave, onCancel, onChange }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [tempFeature, setTempFeature] = useState('');

  const handleGenerateDescription = async () => {
    if (!property.features || !property.location || !property.type || !property.bedrooms) {
      alert("Preencha localização, tipo, quartos e características primeiro.");
      return;
    }
    setIsGeneratingAI(true);
    const desc = await generatePropertyDescription(
      property.features,
      property.location,
      property.type,
      property.bedrooms
    );
    onChange({ ...property, description: desc });
    setIsGeneratingAI(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        try {
            const newImages: string[] = [];
            for (let i = 0; i < e.target.files.length; i++) {
                const base64 = await fileToBase64(e.target.files[i]);
                newImages.push(base64);
            }
            onChange({
                ...property,
                images: [...(property.images || []), ...newImages]
            });
        } catch (error) {
            console.error("Error uploading images", error);
        }
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-ocean-100 p-6 max-w-4xl mx-auto">
       <div className="flex items-center mb-6">
         <button onClick={onCancel} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-main">
           <ArrowLeft size={20} />
         </button>
         <h2 className="text-xl font-bold text-main">{property.id ? 'Editar Imóvel' : 'Novo Imóvel'}</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="col-span-2 md:col-span-1">
           <label className="block text-sm font-medium mb-1 text-main">Título</label>
           <input 
             className="w-full p-2 border rounded-lg bg-white text-main"
             value={property.title || ''}
             onChange={e => onChange({...property, title: e.target.value})}
           />
         </div>
         <div>
            <label className="block text-sm font-medium mb-1 text-main">Tipo</label>
            <select 
              className="w-full p-2 border rounded-lg bg-white text-main"
              value={property.type || 'sale'}
              onChange={e => onChange({...property, type: e.target.value as PropertyType})}
            >
              <option value="sale">Venda</option>
              <option value="rent_seasonal">Temporada</option>
            </select>
         </div>
         <div>
            <label className="block text-sm font-medium mb-1 text-main">Preço (R$)</label>
            <input 
              type="number"
              className="w-full p-2 border rounded-lg bg-white text-main"
              value={property.price || ''}
              onChange={e => onChange({...property, price: Number(e.target.value)})}
            />
         </div>
         <div>
            <label className="block text-sm font-medium mb-1 text-main">Localização</label>
            <input 
              className="w-full p-2 border rounded-lg bg-white text-main"
              value={property.location || ''}
              onChange={e => onChange({...property, location: e.target.value})}
            />
         </div>

         <div className="grid grid-cols-3 gap-4 col-span-2">
            <div>
               <label className="block text-sm font-medium mb-1 text-main">Quartos</label>
               <input type="number" className="w-full p-2 border rounded-lg bg-white text-main" value={property.bedrooms || ''} onChange={e => onChange({...property, bedrooms: Number(e.target.value)})} />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1 text-main">Banheiros</label>
               <input type="number" className="w-full p-2 border rounded-lg bg-white text-main" value={property.bathrooms || ''} onChange={e => onChange({...property, bathrooms: Number(e.target.value)})} />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1 text-main">Área (m²)</label>
               <input type="number" className="w-full p-2 border rounded-lg bg-white text-main" value={property.area || ''} onChange={e => onChange({...property, area: Number(e.target.value)})} />
            </div>
         </div>

         <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-main">Características</label>
            <div className="flex gap-2 mb-2">
              <input 
                className="flex-1 p-2 border rounded-lg bg-white text-main"
                placeholder="Adicionar característica (ex: Vista Mar)"
                value={tempFeature}
                onChange={e => setTempFeature(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && tempFeature) {
                    onChange({ ...property, features: [...(property.features || []), tempFeature] });
                    setTempFeature('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (tempFeature) {
                    onChange({ ...property, features: [...(property.features || []), tempFeature] });
                    setTempFeature('');
                  }
                }}
                className="bg-gray-200 text-gray-800 px-4 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
               {property.features?.map((f, i) => (
                 <span key={i} className="bg-ocean-50 text-ocean-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                   {f} <X size={12} className="cursor-pointer" onClick={() => onChange({ ...property, features: property.features?.filter((_, idx) => idx !== i) })} />
                 </span>
               ))}
            </div>
         </div>

         <div className="col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-main">Descrição</label>
              <button 
                onClick={handleGenerateDescription}
                disabled={isGeneratingAI}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 disabled:opacity-50"
              >
                <Sparkles size={12} /> {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <textarea 
              className="w-full p-2 border rounded-lg h-32 bg-white text-main"
              value={property.description || ''}
              onChange={e => onChange({...property, description: e.target.value})}
            />
         </div>

         <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-main">Fotos</label>
            <div className="grid grid-cols-4 gap-4 mb-2">
               {property.images?.map((img, i) => (
                 <div key={i} className="relative h-24 rounded-lg overflow-hidden group bg-gray-100">
                    <img src={img} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      onClick={() => onChange({ ...property, images: property.images?.filter((_, idx) => idx !== i) })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                 </div>
               ))}
               <label className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-muted cursor-pointer hover:border-ocean-500 hover:text-ocean-500 transition bg-gray-50">
                 <Camera size={24} />
                 <span className="text-xs mt-1">Adicionar Foto</span>
                 <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
               </label>
            </div>
         </div>
       </div>

       <div className="mt-8 flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-main">Cancelar</button>
          <button 
            onClick={() => {
                if (!property.title || !property.price) {
                  alert("Título e Preço são obrigatórios");
                  return;
                }
                onSave({
                  ...property,
                  id: property.id || Date.now().toString(),
                  images: property.images || [],
                  features: property.features || [],
                  views: property.views || 0
                } as Property);
            }} 
            className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            Salvar Imóvel
          </button>
       </div>
    </div>
  );
};

const AdminSettings: React.FC<{
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
}> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update CSS vars when theme changes in preview
  const changeTheme = (theme: ThemeOption) => {
    setLocalSettings(prev => ({...prev, primaryColor: theme}));
    document.body.className = `bg-page text-main transition-colors duration-300 theme-${theme}`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setLocalSettings(prev => ({...prev, logoUrl: base64}));
      } catch (error) {
        console.error("Error uploading logo", error);
      }
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-ocean-100 p-6 max-w-2xl mx-auto">
       <h2 className="text-xl font-bold mb-6 text-main">Configurações do Site</h2>
       
       <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1 text-main">Nome do Site</label>
               <input 
                  className="w-full p-2 border rounded-lg bg-white text-main"
                  value={localSettings.siteName}
                  onChange={e => setLocalSettings({...localSettings, siteName: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-main">Logo</label>
               <div className="flex gap-2">
                  {localSettings.logoUrl && <img src={localSettings.logoUrl} className="h-10 w-10 object-contain bg-gray-100 rounded" />}
                  <label className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-muted border rounded-lg flex items-center justify-center gap-2 p-2 text-sm">
                     <Upload size={16} /> Upload
                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
               </div>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2 text-main">Cores do Tema</label>
             <div className="flex flex-wrap gap-3">
                <button 
                   onClick={() => changeTheme('ocean')}
                   className={`px-4 py-2 rounded-full border flex items-center gap-2 ${localSettings.primaryColor === 'ocean' ? 'ring-2 ring-ocean-500 border-transparent' : 'hover:bg-gray-50'}`}
                >
                   <div className="w-4 h-4 rounded-full bg-[#0ea5e9]"></div> Ocean
                </button>
                <button 
                   onClick={() => changeTheme('nature')}
                   className={`px-4 py-2 rounded-full border flex items-center gap-2 ${localSettings.primaryColor === 'nature' ? 'ring-2 ring-green-500 border-transparent' : 'hover:bg-gray-50'}`}
                >
                   <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div> Nature
                </button>
                 <button 
                   onClick={() => changeTheme('sunset')}
                   className={`px-4 py-2 rounded-full border flex items-center gap-2 ${localSettings.primaryColor === 'sunset' ? 'ring-2 ring-red-500 border-transparent' : 'hover:bg-gray-50'}`}
                >
                   <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div> Vermelho
                </button>
                <button 
                   onClick={() => changeTheme('dark')}
                   className={`px-4 py-2 rounded-full border flex items-center gap-2 ${localSettings.primaryColor === 'dark' ? 'ring-2 ring-gray-500 border-transparent' : 'hover:bg-gray-50'}`}
                >
                   <div className="w-4 h-4 rounded-full bg-[#64748b]"></div> Cinza/Preto
                </button>
             </div>
          </div>

          <div className="border-t border-ocean-100 pt-4">
            <h3 className="font-semibold mb-4 text-main">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1 text-main">Telefone Principal</label>
                  <input 
                    className="w-full p-2 border rounded-lg bg-white text-main"
                    value={localSettings.contact.phone}
                    onChange={e => setLocalSettings({...localSettings, contact: {...localSettings.contact, phone: maskPhone(e.target.value)}})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1 text-main">WhatsApp Reservas</label>
                  <input 
                    className="w-full p-2 border rounded-lg bg-white text-main"
                    value={localSettings.contact.bookingPhone || ''}
                    onChange={e => setLocalSettings({...localSettings, contact: {...localSettings.contact, bookingPhone: maskPhone(e.target.value)}})}
                  />
               </div>
            </div>
            <div className="mt-4">
               <label className="block text-sm font-medium mb-1 text-main">Email</label>
               <input 
                  className="w-full p-2 border rounded-lg bg-white text-main"
                  value={localSettings.contact.email}
                  onChange={e => setLocalSettings({...localSettings, contact: {...localSettings.contact, email: e.target.value}})}
               />
            </div>
             <div className="mt-4">
               <label className="block text-sm font-medium mb-1 text-main">Horário de Atendimento</label>
               <input 
                  className="w-full p-2 border rounded-lg bg-white text-main"
                  value={localSettings.contact.hours}
                  onChange={e => setLocalSettings({...localSettings, contact: {...localSettings.contact, hours: e.target.value}})}
               />
            </div>
            <div className="mt-4">
               <label className="block text-sm font-medium mb-1 text-main">Endereço</label>
               <input 
                  className="w-full p-2 border rounded-lg bg-white text-main"
                  value={localSettings.contact.address}
                  onChange={e => setLocalSettings({...localSettings, contact: {...localSettings.contact, address: e.target.value}})}
               />
            </div>
          </div>
          
          <div className="pt-4 border-t border-ocean-100">
             <button 
               onClick={() => onSave(localSettings)}
               className="w-full bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 font-bold"
             >
               Salvar Alterações
             </button>
          </div>
       </div>
    </div>
  );
};

const AdminProperties: React.FC<{
  properties: Property[];
  onEdit: (p: Property) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}> = ({ properties, onEdit, onDelete, onNew }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-ocean-100 p-6">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-main">Imóveis Cadastrados ({properties.length})</h2>
         <button 
           onClick={onNew}
           className="bg-ocean-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ocean-700"
         >
           <Plus size={18} /> Novo
         </button>
       </div>

       <div className="overflow-x-auto">
         <table className="w-full text-left">
           <thead>
             <tr className="border-b border-ocean-100 bg-ocean-50">
               <th className="p-4 text-ocean-900">Imóvel</th>
               <th className="p-4 text-ocean-900">Tipo</th>
               <th className="p-4 text-ocean-900">Preço</th>
               <th className="p-4 text-right text-ocean-900">Ações</th>
             </tr>
           </thead>
           <tbody>
             {properties.map(prop => (
               <tr key={prop.id} className="border-b border-ocean-100 hover:bg-ocean-50/50">
                 <td className="p-4 font-medium text-main">{prop.title}</td>
                 <td className="p-4">
                   <span className={`px-2 py-1 rounded text-xs ${prop.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                     {prop.type === 'sale' ? 'Venda' : 'Temporada'}
                   </span>
                 </td>
                 <td className="p-4 text-muted">R$ {prop.price.toLocaleString()}</td>
                 <td className="p-4 text-right">
                    <button 
                      onClick={() => onEdit(prop)}
                      className="text-blue-600 hover:text-blue-800 mx-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(prop.id)}
                      className="text-red-600 hover:text-red-800 mx-2"
                    >
                      <Trash2 size={18} />
                    </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterType, setFilterType] = useState<PropertyType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin State
  const [editingProperty, setEditingProperty] = useState<Partial<Property>>({});

  // Apply theme on init
  useEffect(() => {
    document.body.className = `bg-page text-main transition-colors duration-300 theme-${settings.primaryColor}`;
  }, [settings.primaryColor]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setView(ViewState.DETAILS);
    window.scrollTo(0, 0);
  };

  const handleSaveProperty = (propertyToSave: Property) => {
    if (editingProperty.id) {
      setProperties(prev => prev.map(p => p.id === propertyToSave.id ? propertyToSave : p));
    } else {
      setProperties(prev => [...prev, propertyToSave]);
    }
    setView(ViewState.ADMIN_PROPERTIES);
    setEditingProperty({});
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderHome = () => {
    const filteredProperties = properties.filter(p => {
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
    
    return (
      <div className="container mx-auto px-4 py-6">
        
        {/* Compact Search & Filter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-card p-4 rounded-xl border border-ocean-100 shadow-sm">
           {/* Search Bar */}
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por localização..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-ocean-300 bg-page text-main focus:outline-none focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* Filter Pills */}
           <div className="flex gap-2">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterType === 'all' ? 'bg-ocean-600 text-white' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'}`}
              >
                Todos
              </button>
              <button 
                 onClick={() => setFilterType('sale')}
                 className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterType === 'sale' ? 'bg-ocean-600 text-white' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'}`}
              >
                Venda
              </button>
              <button 
                 onClick={() => setFilterType('rent_seasonal')}
                 className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterType === 'rent_seasonal' ? 'bg-ocean-600 text-white' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'}`}
              >
                Temporada
              </button>
           </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} onClick={handlePropertyClick} />
          ))}
          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted">
              Nenhum imóvel encontrado com estes filtros.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold flex items-center gap-2 text-main">
           <LayoutDashboard className="text-ocean-600" /> Painel Administrativo
         </h1>
         <button 
           onClick={() => setView(ViewState.HOME)}
           className="flex items-center text-muted hover:text-ocean-600"
         >
           <LogOut size={18} className="mr-2" /> Sair
         </button>
      </div>

      {/* Admin Tabs (Desktop & Mobile) */}
      <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto">
        <button 
          onClick={() => setView(ViewState.ADMIN_PROPERTIES)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition ${view === ViewState.ADMIN_PROPERTIES || view === ViewState.ADMIN_FORM ? 'bg-ocean-600 text-white' : 'bg-card border border-ocean-100 hover:bg-ocean-50 text-main'}`}
        >
          Gerenciar Imóveis
        </button>
        <button 
          onClick={() => setView(ViewState.ADMIN_SETTINGS)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition ${view === ViewState.ADMIN_SETTINGS ? 'bg-ocean-600 text-white' : 'bg-card border border-ocean-100 hover:bg-ocean-50 text-main'}`}
        >
          Configurações
        </button>
      </div>

      {view === ViewState.ADMIN_PROPERTIES && (
        <AdminProperties 
          properties={properties}
          onEdit={(p) => { setEditingProperty(p); setView(ViewState.ADMIN_FORM); }}
          onDelete={handleDeleteProperty}
          onNew={() => { setEditingProperty({}); setView(ViewState.ADMIN_FORM); }}
        />
      )}

      {view === ViewState.ADMIN_FORM && (
        <AdminForm 
          property={editingProperty}
          onSave={handleSaveProperty}
          onCancel={() => setView(ViewState.ADMIN_PROPERTIES)}
          onChange={setEditingProperty}
        />
      )}
      
      {view === ViewState.ADMIN_SETTINGS && (
        <AdminSettings 
          settings={settings}
          onSave={(s) => { setSettings(s); alert("Configurações salvas!"); }}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-page font-sans text-main">
       {/* Header Common */}
       <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-ocean-100">
         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div 
             className="flex items-center gap-3 text-ocean-600 font-bold text-xl cursor-pointer"
             onClick={() => { setView(ViewState.HOME); setSelectedProperty(null); }}
           >
             {settings.logoUrl ? (
               <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
             ) : (
               <UbatubaLogo className="h-12 w-12" />
             )}
             <span className="text-ocean-800 hidden md:block">{settings.siteName}</span>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center text-sm text-muted gap-6 mr-4">
                 <span className="flex items-center gap-1 hover:text-ocean-600"><Phone size={14} /> {settings.contact.phone}</span>
                 <span className="flex items-center gap-1 hover:text-ocean-600"><Instagram size={14} /> {settings.social.instagram}</span>
              </div>
              <button 
                onClick={() => setView(view === ViewState.HOME || view === ViewState.DETAILS ? ViewState.ADMIN_PROPERTIES : ViewState.HOME)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full hover:bg-ocean-50 transition border border-ocean-100 text-ocean-700"
              >
                 {view === ViewState.HOME || view === ViewState.DETAILS ? (
                   <>
                     <UserCircle size={20} />
                     <span className="hidden sm:inline">Área Administrativa</span>
                   </>
                 ) : (
                   <>
                     <LogOut size={20} />
                     <span className="hidden sm:inline">Sair</span>
                   </>
                 )}
              </button>
           </div>
         </div>
       </header>

       <main>
          {(view === ViewState.HOME) && renderHome()}
          {(view === ViewState.DETAILS && selectedProperty) && (
             <PropertyDetails 
                property={selectedProperty} 
                onBack={() => setView(ViewState.HOME)} 
                bookingPhone={settings.contact.bookingPhone || settings.contact.phone}
             />
          )}
          {(view === ViewState.ADMIN_PROPERTIES || view === ViewState.ADMIN_FORM || view === ViewState.ADMIN_SETTINGS) && renderAdmin()}
       </main>

       <footer className="bg-ocean-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div>
               <div className="flex items-center gap-2 font-bold text-xl mb-4 text-white">
                 {/* Small logo in footer */}
                 <UbatubaLogo className="h-8 w-8 text-white" /> {settings.siteName}
               </div>
               <p className="text-sm mb-4 text-ocean-200">
                 Especialistas em imóveis no litoral norte de São Paulo. 
                 Encontre a casa dos seus sonhos ou o refúgio perfeito para suas férias.
               </p>
             </div>
             <div>
               <h4 className="text-white font-bold mb-4">Contato</h4>
               <ul className="space-y-2 text-sm text-ocean-100">
                 <li className="flex items-center gap-2"><MapPin size={16} /> {settings.contact.address}</li>
                 <li className="flex items-center gap-2"><Phone size={16} /> {settings.contact.phone}</li>
                 <li className="flex items-center gap-2"><Mail size={16} /> {settings.contact.email}</li>
                 <li className="flex items-center gap-2"><Clock size={16} /> {settings.contact.hours}</li>
               </ul>
             </div>
             <div>
               <h4 className="text-white font-bold mb-4">Redes Sociais</h4>
               <div className="flex gap-4 text-white">
                 <a href="#" className="hover:text-ocean-200 transition"><Instagram /></a>
                 <a href="#" className="hover:text-ocean-200 transition"><Facebook /></a>
               </div>
             </div>
          </div>
          <div className="container mx-auto px-4 mt-8 pt-8 border-t border-ocean-800 text-center text-xs text-ocean-300">
             &copy; 2024 {settings.siteName}. Todos os direitos reservados.
          </div>
       </footer>
    </div>
  );
};

export default App;
