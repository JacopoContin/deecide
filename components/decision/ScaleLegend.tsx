"use client";

import type { ReactNode } from "react";

type ScaleLegendProps = {
  title: string;
  items: { key: number; badge: ReactNode; label: string; description: string }[];
};

// Explains a tap scale; shown in the How it works panel of the step that uses it
export default function ScaleLegend({ title, items }: ScaleLegendProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {/* Two columns so every label starts at the same x, whatever the badge width */}
      <ul className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.key} className="col-span-2 grid grid-cols-subgrid items-center">
            <span className="grid *:w-full">{item.badge}</span>
            <span className="min-w-0">
              <span className="font-medium text-foreground">{item.label}</span> · {item.description.toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
