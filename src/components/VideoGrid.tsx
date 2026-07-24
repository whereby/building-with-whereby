import type { Orientation } from "../hooks/useOrientation";
import VideoTile, { type TileData } from "./VideoTile";

/**
 * Choose the number of columns from participant count and screen orientation.
 *
 * Portrait:  1–2 → 1 column, 3+ → 2 columns.
 * Landscape: 1 → full size, 2–4 → 2 columns, 5–9 → 3 columns, 10+ → 4 columns.
 */
export function columnsFor(count: number, orientation: Orientation): number {
  if (orientation === "portrait") {
    return count <= 2 ? 1 : 2;
  }
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

interface Props {
  tiles: TileData[];
  orientation: Orientation;
}

export default function VideoGrid({ tiles, orientation }: Props) {
  const columns = columnsFor(tiles.length, orientation);

  return (
    <div
      className="grid h-full w-full gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: "1fr",
      }}
    >
      {tiles.map((tile) => (
        <VideoTile key={tile.id} tile={tile} />
      ))}
    </div>
  );
}
