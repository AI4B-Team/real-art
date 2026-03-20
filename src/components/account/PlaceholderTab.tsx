import { LucideIcon } from "lucide-react";

interface PlaceholderTabProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function PlaceholderTab({ title, description, icon: Icon }: PlaceholderTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <div className="border border-foreground/[0.08] rounded-xl p-12 text-center">
        <div className="w-14 h-14 rounded-xl bg-foreground/[0.05] flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-muted" />
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted max-w-sm mx-auto">{description} This feature is coming soon.</p>
      </div>
    </div>
  );
}
