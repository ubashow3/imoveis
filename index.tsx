import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- VERCEL CRASH PROTECTION ---
// Este arquivo garante que o site não fique em tela branca se houver erro.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  // Se o React falhar ao iniciar (erro de importação, sintaxe, etc)
  // Remove a tela de carregamento e mostra o erro real
  const loader = document.getElementById('loading-screen');
  if (loader) loader.style.display = 'none';

  document.body.innerHTML = `
    <div style="padding: 20px; color: #dc2626; font-family: sans-serif;">
      <h1 style="font-size: 24px; margin-bottom: 10px;">Erro Fatal na Inicialização</h1>
      <p>O aplicativo encontrou um erro antes de carregar:</p>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; overflow: auto;">${error}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">Tentar Novamente</button>
    </div>
  `;
  console.error("ERRO FATAL:", error);
}