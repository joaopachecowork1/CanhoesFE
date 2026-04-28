import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SecretSantaLoadingState() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-44 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full rounded-[var(--radius-md-token)]" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </CardContent>
    </Card>
  );
}
