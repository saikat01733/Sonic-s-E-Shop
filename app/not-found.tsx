import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Gamepad2, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md p-8 text-center space-y-5 border-white/20">
        <div className="w-16 h-16 rounded-3xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto shadow-xl font-mono text-2xl font-black">
          404
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Page Not Found</h2>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/games"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>All Games</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
