export const callOdoo = async (model, method, args = [], kwargs = {}) => {
  try {
    const response = await fetch('/web/dataset/call_kw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'true', // Envoie le cookie de session Odoo
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: model,
          method: method,
          args: args,
          kwargs: kwargs,
          context: { bin_size: true } 
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.data.message);
    return data.result;
    
  } catch (error) {
    console.error("Erreur avec Odoo:", error);
    return null; // Retourne null en cas d'erreur pour éviter de casser l'interface
  }
};