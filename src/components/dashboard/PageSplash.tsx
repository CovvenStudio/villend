import { motion } from 'framer-motion';

export default function PageSplash({ label = 'A carregar' }: { label?: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1115]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),linear-gradient(135deg,#151922_0%,#0f1115_55%,#0b0d11_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative flex h-40 w-40 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#d4a24c] shadow-[0_0_18px_rgba(212,162,76,0.7)]" />
            </motion.div>
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,162,76,0.12),transparent_62%)]" />
            <div className="relative text-center">
              <div className="font-display text-4xl font-700 tracking-tight text-white">
                vyllad<span className="text-[#d4a24c]">.</span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-white text-sm font-semibold tracking-[0.24em] uppercase">{label}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
