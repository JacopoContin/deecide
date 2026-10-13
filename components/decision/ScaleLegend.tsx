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
        <ul className="mt-1 flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              {item.badge}
              <span>
                <span className="font-medium text-foreground">{item.label}</span> · {item.description.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
