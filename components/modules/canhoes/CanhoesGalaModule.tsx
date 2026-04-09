"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Medal, Trophy } from "lucide-react";

import {
  CanhoesMediaThumb,
  CanhoesModuleHeader,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InlineLoader } from "@/components/ui/inline-loader";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { cn } from "@/lib/utils";
import type { CanhoesCategoryResultDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function renderPlacementIcon(position: number) {
  return position === 0 ? (
    <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
  ) : (
    <Medal className="h-4 w-4 text-[var(--color-beige)]" />
  );
}

function NomineeRankCard({
  nominee,
  rank,
}: Readonly<{
  nominee: CanhoesCategoryResultDto["top"][number];
  rank: number;
}>) {
  const isWinner = rank === 0;

  return (
    <div
      className={cn(
        "canhoes-list-item flex items-center gap-3 rounded-[var(--radius-md-token)] border px-3 py-3 animate-[stagger-fade-in_0.3s_ease-out_both] transition-colors duration-200",
        isWinner
          ? "border-[rgba(0,255,136,0.3)] bg-[linear-gradient(180deg,rgba(0,255,136,0.06),transparent)] shadow-[0_0_12px_rgba(0,255,136,0.08)]"
          : "border-[rgba(212,184,150,0.1)] hover:border-[rgba(122,173,58,0.15)]"
      )}
      style={{ animationDelay: `${rank * 0.08}s` }}
    >
      <CanhoesMediaThumb alt={nominee.title} src={nominee.imageUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text-primary)]">
            {renderPlacementIcon(rank)} #{rank + 1}
          </span>
          <span className="truncate font-semibold text-[var(--color-text-primary)]">
            {nominee.title}
          </span>
        </div>
        <p className="body-small text-[var(--color-text-muted)]">{nominee.votes} votos</p>
      </div>

      <Badge variant={isWinner ? "default" : "outline"}>
        {isWinner ? "Winner" : "Top"}
      </Badge>
    </div>
  );
}

export function CanhoesGalaModule() {
  const [resultsByCategory, setResultsByCategory] = useState<CanhoesCategoryResultDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResults = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);

    return canhoesRepo
      .getResults()
      .then(setResultsByCategory)
      .catch((error: unknown) => {
        const message = getErrorMessage(
          error,
          "Nao foi possivel carregar os resultados da gala."
        );
        logFrontendError("CanhoesGala.loadResults", error);
        setResultsByCategory([]);
        setErrorMessage(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const totalVotes = useMemo(
    () => resultsByCategory.reduce((voteCount, categoryResult) => voteCount + (categoryResult.totalVotes ?? 0), 0),
    [resultsByCategory]
  );

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Trophy}
        title="Gala"
        description="Resultados finais por categoria, em formato legivel em mobile."
        badgeLabel={`Total votos: ${totalVotes}`}
      />

      {isLoading ? <InlineLoader label="A carregar resultados" /> : null}

      {!isLoading && errorMessage ? (
        <ErrorAlert
          title="Erro ao carregar resultados"
          description={errorMessage}
          actionLabel="Tentar novamente"
          onAction={() => void loadResults()}
        />
      ) : null}

      {!isLoading && !errorMessage && resultsByCategory.length === 0 ? (
        <p className="body-small text-[var(--color-text-muted)]">Sem resultados ainda.</p>
      ) : null}

      {!isLoading ? (
        <div className="space-y-4">
          {resultsByCategory.map((categoryResult) => (
            <Card key={categoryResult.categoryId}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span>{categoryResult.categoryName}</span>
                  <Badge variant="amber">{categoryResult.totalVotes} votos</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {categoryResult.top.length === 0 ? (
                    <p className="body-small text-[var(--color-text-muted)]">Sem nomeações aprovadas.</p>
                  ) : (
                    categoryResult.top.map((nominee, index) => (
                      <NomineeRankCard key={nominee.nomineeId} nominee={nominee} rank={index} />
                    ))
                  )}
                </div>

                <Separator />
                <p className="body-small text-[var(--color-text-muted)]">Só mostra o Top 3, com imagem quando existir.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}


