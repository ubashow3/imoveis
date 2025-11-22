
import React from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Expand, Heart, Image as ImageIcon } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Use the first image or a placeholder
  const mainImage = property.images.length > 0 
    ? property.images[0] 
    : 'https://via.placeholder.com/800x600?text=Sem+Foto';

  return (
    <div 
      className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-ocean-100"
      onClick={() => onClick(property)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-ocean-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
          {property.type === 'sale' ? 'Venda' : 'Temporada'}
        </div>
        
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 backdrop-blur-sm">
           <ImageIcon size={12} /> {property.images.length}
        </div>

        <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-ocean-600 transition-colors">
            <Heart size={18} />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center text-muted text-sm mb-2">
          <MapPin size={14} className="mr-1" />
          {property.location}
        </div>
        
        <h3 className="text-xl font-bold text-main mb-2 truncate">{property.title}</h3>
        
        <div className="text-2xl font-bold text-ocean-600 mb-4">
          {formatPrice(property.price)}
          {property.type === 'rent_seasonal' && <span className="text-sm text-muted font-normal"> /dia</span>}
        </div>

        <div className="flex justify-between border-t border-ocean-100 pt-4 text-muted">
          <div className="flex items-center gap-1">
            <Bed size={18} />
            <span className="text-sm">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={18} />
            <span className="text-sm">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Expand size={18} />
            <span className="text-sm">{property.area} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};
