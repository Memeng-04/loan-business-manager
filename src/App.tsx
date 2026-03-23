import { useEffect } from 'react';
import { supabase } from './lib/supabase'; // Make sure this path matches your folder!

function App() {
  useEffect(() => {
    const testConnection = async () => {
      // This looks for the table we just made in Step 1
      const { data, error } = await supabase.from('borrowers').select('*');
      
      if (error) {
        console.error("Connection failed:", error.message);
      } else {
        console.log("Connection successful! Data found:", data);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Lending Manager: Backend Linked!</h1>
      <p>Check your browser console (F12) to see the data.</p>
    </div>
  );
}

export default App;
