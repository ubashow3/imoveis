import React, { useState, useEffect, useRef, Component } from 'react';
import { Property, ViewState, PropertyType, SiteSettings, ThemeOption } from './types';
import { generatePropertyDescription } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { PropertyCard } from './components/PropertyCard';
import { 
  LayoutDashboard, Plus, Search, Umbrella, Building2, ArrowLeft, LogOut, Sparkles,
  CheckCircle, Menu, X, MapPin, Bed, Bath, Expand, Waves, Settings, Instagram,
  Facebook, Phone, Clock, Mail, Palette, Save, Trash2, Image as ImageIcon, Edit,
  Users, Calendar, Upload, Camera, ChevronLeft, ChevronRight, UserCircle, Database,
  Copy, AlertTriangle, RefreshCw
} from 'lucide-react';

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps { children?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg">
            <AlertTriangle size={48} className="mx-auto text-red-600 mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Erro de Renderização</h1>
            <p className="text-gray-600 mb-4">Ocorreu um erro ao exibir a interface.</p>
            <pre className="bg-gray-100 p-2 rounded text-xs text-left overflow-auto mb-4">
              {this.state.error?.message}
            </pre>
            <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded">Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- UTILS ---
const maskPhone = (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

// --- SQL SETUP ---
const SQL_SETUP_CODE = `-- Criar tabela (seguro)
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  location text,
  price numeric,
  type text,
  bedrooms integer,
  bathrooms integer,
  area numeric,
  features text[],
  images text[],
  views integer default 0
);
alter table properties enable row level security;
drop policy if exists "Public Access" on properties;
create policy "Public Access" on properties for all using (true) with check (true);`;

const SAMPLE_PROPERTIES = [
  {
    title: "Casa de Alto Padrão em Itamambuca",
    description: "Espetacular casa pé na areia com piscina e área gourmet completa.",
    location: "Itamambuca, Ubatuba",
    price: 3500,
    type: "rent_seasonal",
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    features: ["Piscina", "Churrasqueira", "Ar Condicionado", "Wi-Fi", "Jardim"],
    images: ["https://images.unsplash.com/photo-1600596542815-60c37c6525fa?auto=format&fit=crop&w=800"],
    views: 120
  },
  {
    title: "Apartamento Vista Mar Praia Grande",
    description: "Apartamento moderno e recém reformado no melhor ponto da Praia Grande.",
    location: "Praia Grande, Ubatuba",
    price: 850000,
    type: "sale",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    features: ["Vista Mar", "Varanda Gourmet", "Mobiliado", "Elevador"],
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800"],
    views: 450
  }
];

const UbatubaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="8" className="text-ocean-600" fill="white"/>
    <path d="M30 90 L100 40 L170 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-ocean-800"/>
    <path d="M55 72 L55 55 L65 55 L65 65" stroke="currentColor" strokeWidth="6" className="text-ocean-800"/>
    <rect x="60" y="90" width="20" height="20" fill="currentColor" className="text-ocean-800"/>
    <rect x="120" y="90" width="20" height="20" fill="currentColor" className="text-ocean-800"/>
    <text x="100" y="135" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="black" letterSpacing="-1">ALUGA-SE</text>
    <text x="100" y="160" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" className="fill-ocean-600" letterSpacing="-1">UBATUBA</text>
    <text x="160" y="175" textAnchor="end" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" className="fill-ocean-600">.COM</text>
    <path d="M20 115 Q 50 105, 80 115 T 140 115 T 180 105" stroke="currentColor" strokeWidth="4" fill="none" className="text-ocean-400"/>
  </svg>
);

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Aluga-se Ubatuba',
  logoUrl: '/img/LOGO_LEGAL.png', 
  primaryColor: 'ocean',
  contact: {
    address: 'Av. Leovigildo Dias Vieira, 1000 - Itaguá',
    phone: '(12) 99999-9999',
    bookingPhone: '(12) 98888-8888', 
    email: 'contato@alugaseubatuba.com.br',
    hours: 'Seg a Sex: 09h - 18h | Sáb: 09h - 13h'
  },
  social: { instagram: '@alugaseubatuba', facebook: '/alugaseubatuba' }
};

// --- SUB-COMPONENTS ---
const DatabaseSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SETUP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6"><AlertTriangle size={48} /></div>
      <h1 className="text-2xl md:text-3xl font-bold text-main mb-4">Configuração do Banco de Dados</h1>
      <p className="text-muted max-w-2xl mb-8">A tabela de imóveis não existe ou está inacessível.</p>
      <div className="w-full max-w-3xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl text-left mb-6">
        <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
          <span className="text-gray-400 text-sm font-mono">SQL</span>
          <button onClick={handleCopy} className="text-white hover:text-ocean-300 text-sm font-medium">{copied ? 'Copiado!' : 'Copiar SQL'}</button>
        </div>
        <pre className="p-6 overflow-x-auto text-sm text-green-400 font-mono"><code>{SQL_SETUP_CODE}</code></pre>
      </div>
      <button onClick={() => window.location.reload()} className="bg-ocean-600 text-white px-8 py-3 rounded-full font-bold hover:bg-ocean-700 flex items-center gap-2"><RefreshCw size={20} /> Tentar Novamente</button>
    </div>
  );
};

const PropertyDetails: React.FC<{ property: Property; onBack: () => void; bookingPhone: string; }> = ({ property, onBack, bookingPhone }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const images = property.images?.length ? property.images : ['https://via.placeholder.com/800x600?text=Sem+Foto'];
  
  const calcTotal = () => {
    if (!start || !end) return 0;
    const diff = Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
    return diff * property.price;
  };

  const handleBook = () => {
    const msg = property.type === 'rent_seasonal' 
      ? `Olá! Gostaria de reservar "${property.title}" de ${start} a ${end}.` 
      : `Olá! Tenho interesse em comprar "${property.title}".`;
    window.open(`https://wa.me/${bookingPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <button onClick={onBack} className="flex items-center text-muted hover:text-ocean-600 mb-4"><ArrowLeft size={20} className="mr-2"/> Voltar</button>
      <div className="relative h-[300px] md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden mb-8 group">
        <img src={images[imgIdx]} alt={property.title} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"><ChevronLeft /></button>
            <button onClick={() => setImgIdx((prev) => (prev + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"><ChevronRight /></button>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">{imgIdx + 1} / {images.length}</div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-main">{property.title}</h1>
          <div className="flex items-center text-muted mt-2"><MapPin size={18} className="mr-1" /> {property.location}</div>
          <div className="flex gap-6 border-y border-ocean-100 py-6 my-6">
             <div className="text-center"><Bed className="mx-auto text-ocean-500"/> <b>{property.bedrooms}</b></div>
             <div className="text-center"><Bath className="mx-auto text-ocean-500"/> <b>{property.bathrooms}</b></div>
             <div className="text-center"><Expand className="mx-auto text-ocean-500"/> <b>{property.area} m²</b></div>
          </div>
          <p className="whitespace-pre-line text-muted mb-8">{property.description}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {property.features?.map((f, i) => <span key={i} className="bg-ocean-50 text-ocean-700 px-3 py-1 rounded-full text-sm flex items-center"><CheckCircle size={14} className="mr-1"/>{f}</span>)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card border border-ocean-200 rounded-2xl p-6 shadow-lg sticky top-24">
             <div className="mb-6 text-3xl font-bold text-ocean-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                {property.type === 'rent_seasonal' && <span className="text-sm text-muted font-normal"> /dia</span>}
             </div>
             {property.type === 'rent_seasonal' && (
               <div className="mb-6 space-y-4">
                 <input type="date" className="w-full p-2 border rounded" value={start} onChange={e => setStart(e.target.value)} />
                 <input type="date" className="w-full p-2 border rounded" value={end} onChange={e => setEnd(e.target.value)} />
                 {start && end && <div className="bg-ocean-50 p-3 rounded font-bold text-center">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcTotal())}</div>}
               </div>
             )}
             <button onClick={handleBook} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Phone size={20} /> Contatar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [showDbSetup, setShowDbSetup] = useState(false);
  const loadingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    console.log("App V.2.0 Started");
    const saved = localStorage.getItem('siteSettings');
    if (saved) setSettings(JSON.parse(saved));
    fetchProperties();
    return () => { if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current); };
  }, []);

  useEffect(() => {
    document.body.className = `bg-page text-main transition-colors duration-300 theme-${settings.primaryColor}`;
  }, [settings]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setDbError(null);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setDbError("O banco de dados demorou muito para responder. Verifique sua conexão.");
      }
    }, 8000);

    try {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) setShowDbSetup(true);
        else setDbError(error.message || JSON.stringify(error));
      } else if (data) {
        setProperties(data.map((p: any) => ({ ...p, images: p.images || [], features: p.features || [] })));
        setShowDbSetup(false);
      }
    } catch (err: any) {
      setDbError(err.message || "Erro de conexão.");
    }
    setIsLoading(false);
  };

  const handleSeed = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('properties').insert(SAMPLE_PROPERTIES);
    if (error) {
      alert("Erro ao criar dados: " + error.message);
      if (error.code === '42P01') setShowDbSetup(true);
    } else {
      alert("Dados de teste criados!");
      fetchProperties();
    }
    setIsLoading(false);
  };

  if (showDbSetup) return <DatabaseSetup />;

  return (
    <div className="min-h-screen bg-page font-sans text-main">
      <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-ocean-100 h-16 flex items-center justify-between px-4">
         <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            {settings.logoUrl && !logoFailed ? (
               <img src={settings.logoUrl} className="h-12 w-auto" onError={() => setLogoFailed(true)} />
            ) : <UbatubaLogo className="h-12 w-12" />}
            <span className="hidden md:block text-ocean-800">{settings.siteName}</span>
         </div>
         <button onClick={() => setView(view === ViewState.HOME ? ViewState.ADMIN_PROPERTIES : ViewState.HOME)} className="px-4 py-2 border rounded-full hover:bg-ocean-50 text-ocean-700 flex gap-2 text-sm font-medium">
            <UserCircle size={18}/> {view === ViewState.HOME ? "Área Admin" : "Voltar ao Site"}
         </button>
      </header>

      <main>
        {dbError && (
          <div className="container mx-auto p-4 mt-4">
             <div className="bg-red-100 text-red-800 p-4 rounded border border-red-200 flex justify-between items-center">
                <span><strong>Erro:</strong> {dbError}</span>
                <button onClick={fetchProperties} className="bg-red-200 px-3 py-1 rounded hover:bg-red-300 text-sm font-bold">Tentar Novamente</button>
             </div>
          </div>
        )}

        {view === ViewState.HOME && (
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(p => <PropertyCard key={p.id} property={p} onClick={() => { setSelectedProperty(p); setView(ViewState.DETAILS); }} />)}
            {properties.length === 0 && !isLoading && !dbError && (
               <div className="col-span-full text-center py-12 text-muted">
                  <p>Nenhum imóvel encontrado.</p>
                  <p className="text-sm mt-2">Vá para a Área Admin para gerar dados.</p>
               </div>
            )}
          </div>
        )}
        {view === ViewState.DETAILS && selectedProperty && <PropertyDetails property={selectedProperty} onBack={() => setView(ViewState.HOME)} bookingPhone={settings.contact.bookingPhone || settings.contact.phone} />}
        {view === ViewState.ADMIN_PROPERTIES && (
           <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin</h1>
                <button onClick={handleSeed} className="bg-purple-100 text-purple-700 px-4 py-2 rounded hover:bg-purple-200 flex items-center gap-2"><Database size={18}/> Gerar Teste</button>
              </div>
              <div className="bg-white p-6 rounded shadow text-center text-muted">
                <p>Funcionalidade Admin Simplificada para Debug.</p>
                <p>Use o botão "Gerar Teste" para popular o banco.</p>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => <ErrorBoundary><AppContent /></ErrorBoundary>;
export default App;