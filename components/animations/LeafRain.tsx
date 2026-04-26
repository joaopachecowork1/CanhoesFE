"use client";

import React, { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

interface LeafParticle {
  id: number;
  delay: number;
  x: number;
  duration: number;
}

const LeafRain: React.FC = () => {
  const [particles, setParticles] = useState<LeafParticle[]>([]);

  useEffect(() => {
    // Generate particles once on mount
    const newParticles = Array.from({ length: 16 }, (_, index) => ({
      id: index,
      delay: Math.random() * 4.5,
      x: Math.random() * 100,
      duration: 8 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute -top-8 text-[rgba(212,184,150,0.18)]"
          style={{
            animation: `leaf-fall ${particle.duration}s linear ${particle.delay}s infinite`,
            left: `${particle.x}%`,
          }}
        >
          <Leaf className="h-6 w-6" />
        </div>
      ))}
    </div>
  );
};

export default React.memo(LeafRain);
