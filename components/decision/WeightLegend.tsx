"use client";

import { Badge } from "@/components/ui/badge";
import { WEIGHT_SCALE } from "@/lib/decision";
import ScaleLegend from "./ScaleLegend";

export default function WeightLegend() {
  return (
    <ScaleLegend
      title="How much does each criterion matter?"
      items={WEIGHT_SCALE.map((level) => ({
        key: level.value,
        badge: (
          <Badge variant="secondary" className="min-w-8 bg-primary/15 text-primary tabular-nums">
            {level.value}
          </Badge>
        ),
        label: level.label,
        description: level.description,
      }))}
    />
  );
}
