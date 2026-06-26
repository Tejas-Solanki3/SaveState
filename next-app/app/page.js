export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Navigation Bar */}
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div 
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          SaveState<sup className="text-xs">®</sup>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm text-foreground transition-colors">Home</a>
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</a>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Logs</a>
        </div>

        <a href="/signup" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer">
          Begin Journey
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px]">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground animate-fade-rise"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where <em className="not-italic text-muted-foreground">identity</em> meets <em className="not-italic text-muted-foreground">automation.</em>
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Say goodbye to ID cards. Our edge-optimized AI engine instantly verifies students through high-speed facial detection, securely logging them into the database in milliseconds.
        </p>
        
        <a href="/signup" className="inline-block liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2">
          Begin Journey
        </a>
      </section>
    </main>
  );
}
