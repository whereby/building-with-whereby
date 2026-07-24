import { useEffect, useState } from "react";

export type Orientation = "portrait" | "landscape";

function current(): Orientation {
  // Height >= width counts as portrait (also the sensible default on a square).
  return window.innerHeight >= window.innerWidth ? "portrait" : "landscape";
}

/** Tracks portrait/landscape, updating live on resize and device rotation. */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(current);

  useEffect(() => {
    const update = () => setOrientation(current());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return orientation;
}
