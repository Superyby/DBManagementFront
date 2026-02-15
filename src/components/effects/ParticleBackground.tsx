import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

interface ParticleBackgroundProps {
  className?: string;
}

export function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.5,
          },
        },
        push: {
          quantity: 3,
        },
      },
    },
    particles: {
      color: {
        value: ['#00fff2', '#bf00ff', '#00ff88'],
      },
      links: {
        color: '#00fff2',
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 0.8,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 60,
      },
      opacity: {
        value: 0.4,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      className={`fixed inset-0 -z-10 ${className}`}
      options={options}
    />
  );
}
