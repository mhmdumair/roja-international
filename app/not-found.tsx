import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🎨</div>
        <h1 className="font-display text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
