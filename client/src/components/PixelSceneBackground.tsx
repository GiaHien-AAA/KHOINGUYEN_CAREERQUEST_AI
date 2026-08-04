interface PixelSceneBackgroundProps {
  accent?: string;
  scene?: 'office' | 'client' | 'qa' | 'deadline' | 'team' | 'mentor';
}

const sceneGlow = {
  office: 'radial-gradient(circle at 18% 24%, rgba(139,233,253,0.18), transparent 28%), radial-gradient(circle at 70% 16%, rgba(124,58,237,0.18), transparent 34%)',
  client: 'radial-gradient(circle at 20% 24%, rgba(255,154,170,0.18), transparent 30%), radial-gradient(circle at 74% 20%, rgba(255,224,102,0.14), transparent 34%)',
  qa: 'radial-gradient(circle at 18% 24%, rgba(99,230,168,0.16), transparent 30%), radial-gradient(circle at 78% 18%, rgba(255,92,122,0.12), transparent 34%)',
  deadline: 'radial-gradient(circle at 18% 24%, rgba(255,184,77,0.18), transparent 30%), radial-gradient(circle at 76% 15%, rgba(255,92,122,0.13), transparent 34%)',
  team: 'radial-gradient(circle at 18% 24%, rgba(139,233,253,0.16), transparent 30%), radial-gradient(circle at 76% 18%, rgba(99,230,168,0.13), transparent 34%)',
  mentor: 'radial-gradient(circle at 18% 24%, rgba(255,224,102,0.16), transparent 30%), radial-gradient(circle at 76% 18%, rgba(139,233,253,0.14), transparent 34%)',
};

export function PixelSceneBackground({ accent = '#8be9fd', scene = 'office' }: PixelSceneBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `${sceneGlow[scene]}, linear-gradient(180deg, #11162f 0%, #0d1024 48%, #070a17 100%)`,
        }}
      />
      <div className="absolute inset-0 opacity-[0.16] pixel-grid" />
      <div className="absolute left-0 right-0 top-[18%] h-px" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-[linear-gradient(180deg,transparent,#050711)]" />
      <div className="absolute inset-0 crt-scanline" />
    </div>
  );
}
