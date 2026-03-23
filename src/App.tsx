import logoWhite from "./assets/icons/192x192/lend-white.png";
import WhiteButton from "./components/Button";
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('borrowers').select('*');
        if (error) {
          console.error("Supabase connection failed:", error.message);
        } else {
          console.log("Supabase connection successful! Data found:", data);
        }
      } catch (err) {
        console.error("Unexpected error connecting to Supabase:", err);
      }
    };
    testConnection();
  }, []);

  return (
    <main className="min-h-svh bg-main-blue text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <div className="mb-2 flex items-center justify-center sm:mb-1">
            <img
              src={logoWhite}
              alt="LEND logo"
              className="h-32 w-auto sm:h-36 lg:h-44"
            />
          </div>

          <p className="mt-2 text-sm font-small text-blue-100 sm:text-base sm:mt-1">
            Lending Efficiency through Networked Data
          </p>

          <h2 className="mt-8 max-w-2xl text-2xl font-semibold leading-tight sm:mt-8 sm:text-3xl lg:text-3xl">
            Because your lending business deserves better than a notebook.
          </h2>

          <WhiteButton>Get Started</WhiteButton>
        </div>
      </section>
    </main>
  );
}

export default App;
