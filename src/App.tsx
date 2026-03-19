import logoWhite from "./assets/icons/192x192/lend-white.png";

function App() {
  return (
    <main className="min-h-svh bg-main-blue text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <div className="mb-2 flex items-center justify-center sm:-mb-2">
            <img  
              src={logoWhite}
              alt="LEND logo"
              className="h-30 w-auto sm:h-30 lg:h-40"
            />
          </div>

      
          <p className="mt-2 text-sm font-small text-blue-100 sm:text-base sm:mt-2">
            Lending Efficiency through Networked Data
          </p>

          <h2 className="mt-8 max-w-2xl text-2xl font-semibold leading-tight sm:mt-8 sm:text-3xl lg:text-3xl">
            Because your lending business deserves better than a notebook.
          </h2>

          <button
            type="button"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-lg font-semibold text-main-blue transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-main-blue sm:mt-12 sm:px-10 sm:py-3.5 sm:text-1xl"
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
