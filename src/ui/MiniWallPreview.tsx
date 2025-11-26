const COLORS = ["brickYellow", "brickBlue", "brickPink", "brickGreen", "brickOrange"];

export default function MiniWallPreview() {
  const rows = 6;
  const cols = 10;

  const colorClassMap: Record<string, string> = {
    brickYellow: "bg-brickYellow",
    brickBlue: "bg-brickBlue",
    brickPink: "bg-brickPink",
    brickGreen: "bg-brickGreen",
    brickOrange: "bg-brickOrange"
  };

  return (
    <div className="rounded-3xl bg-sky p-4 shadow-lg">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const colorKey = COLORS[(i + (i % 3)) % COLORS.length];
          const colorClass = colorClassMap[colorKey];
          return (
            <div
              key={i}
              className={`h-5 rounded-brick shadow-sm ${colorClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
