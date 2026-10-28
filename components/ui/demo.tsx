import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export default function FloatingPathsBackgroundExample() {
  return (
    <FloatingPathsBackground
      className="flex aspect-16/9 items-center justify-center overflow-hidden"
      position={-1}
    >
      <div className="rounded-2xl border border-border bg-background/80 px-8 py-6 text-center text-foreground backdrop-blur-xl">
        <p className="text-lg font-semibold">Comfort, in motion.</p>
      </div>
    </FloatingPathsBackground>
  );
}
