import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { ChevronRight, Sparkles, Heart, Activity } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

function OrbitalCore() {
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={1.5}>
      <group>
        <mesh>
          <sphereGeometry args={[1.4, 96, 96]} />
          <meshStandardMaterial
            color="#fb7185"
            transparent
            opacity={0.82}
            roughness={0.18}
            metalness={0.7}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.95, 0.08, 20, 120]} />
          <meshStandardMaterial
            color="#fda4af"
            emissive="#fda4af"
            emissiveIntensity={0.35}
            transparent
            opacity={0.56}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-[#FFF5F7] text-rose-950"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.18),transparent_24%),radial-gradient(circle_at_75%_20%,rgba(244,63,94,0.12),transparent_20%),linear-gradient(180deg,#fff3f5_0%,#ffeef2_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.98)_100%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-rose-800 shadow-lg shadow-rose-200/70 backdrop-blur">
              <Heart className="w-5 h-5 text-rose-500" />
              PREMIUM WOMEN’S HEALTH INTELLIGENCE
            </div>

            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight text-rose-950">
                OVULINE
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-9 text-rose-700/90">
                The system that traces the rhythm of your cycle with premium AI wellness guidance, clinical confidence, and emotionally supportive healthcare intelligence.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-8 py-4 text-sm font-semibold text-white shadow-[0_24px_60px_-30px_rgba(244,63,94,0.85)] transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-40px_rgba(244,63,94,0.95)]"
              >
                START YOUR JOURNEY
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/90 px-6 py-4 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Discover AI Wellness
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-3xl bg-white/85 border border-rose-100 shadow-sm p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500 font-semibold">Trust</p>
                <p className="mt-3 text-sm font-semibold text-rose-900">Clinical-grade clarity</p>
              </div>
              <div className="rounded-3xl bg-white/85 border border-rose-100 shadow-sm p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500 font-semibold">Care</p>
                <p className="mt-3 text-sm font-semibold text-rose-900">Human-first guidance</p>
              </div>
              <div className="rounded-3xl bg-white/85 border border-rose-100 shadow-sm p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500 font-semibold">Intelligence</p>
                <p className="mt-3 text-sm font-semibold text-rose-900">AI-powered insights</p>
              </div>
              <div className="rounded-3xl bg-white/85 border border-rose-100 shadow-sm p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500 font-semibold">Innovation</p>
                <p className="mt-3 text-sm font-semibold text-rose-900">Futuristic wellness visuals</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative h-[620px] sm:h-[720px] rounded-[3rem] border border-white/80 bg-white/75 shadow-[0_40px_80px_-35px_rgba(244,63,94,0.2)] backdrop-blur-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.16),transparent_28%)]" />
            <Canvas camera={{ position: [0, 0, 5], fov: 38 }} className="h-full w-full">
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 3, 3]} intensity={1.1} />
              <pointLight position={[-4, 1, -2]} intensity={0.8} color="#fb7185" />
              <OrbitalCore />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.45} enablePan={false} />
            </Canvas>
            <div className="absolute bottom-5 left-5 right-5 rounded-[2rem] bg-white/90 border border-rose-100/70 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500 font-semibold">Cycle Phase</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-rose-950">Luteal Harmony</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_8px_rgba(251,146,60,0.08)]" />
                  72% complete
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
