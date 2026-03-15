import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  gradient?: string;
  pattern?: boolean;
  children?: React.ReactNode;
}

export default function PageHero({ title, subtitle, gradient, pattern = true, children }: PageHeroProps) {
  const bg = gradient || "linear-gradient(135deg, #D72638 0%, #FF8C00 50%, #D72638 100%)";

  return (
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: bg }}>
      {/* Decorative circles */}
      {pattern && (
        <>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
        </>
      )}

      {/* Colour dots decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["#FFD600","#06D6A0","#00B4D8","#7B2FBE","#FFD600"].map((c, i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full opacity-40"
            style={{ background: c, left: `${15 + i * 18}%`, top: `${20 + (i % 2) * 50}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
