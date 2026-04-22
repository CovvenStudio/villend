import { Link } from 'react-router-dom';

// This route (/property/:id) is legacy — properties are accessible via /p/:slug

const PropertyPublic = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-display text-2xl font-bold mb-2">Imóvel não encontrado</h1>
      <Link to="/" className="text-accent hover:underline text-sm">Voltar ao início</Link>
    </div>
  </div>
);

export default PropertyPublic;
