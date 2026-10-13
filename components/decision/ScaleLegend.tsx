"use client";

import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "@/lib/icons";

type ScaleLegendProps = {
  title: string;
  items: { key: number; badge: ReactNode; label: string; description: string }[];
};

// Explains a tap scale above the cards that use it
export default function ScaleLegend({ title, items }: ScaleLegendProps) {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {/* Two columns so every label starts at the same x, whatever the badge width */}
        <ul className="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
          {items.map((item) => (
            <li key={item.key} className="col-span-2 grid grid-cols-subgrid items-center">
              <span className="grid *:w-full">{item.badge}</span>
              <span className="min-w-0">
                <span className="font-medium text-foreground">{item.label}</span> · {item.description.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
