"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, Inbox, Link as LinkIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  CanhoesFileTrigger,
  CanhoesMediaThumb,
  CanhoesModuleHeader,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { CompactSegmentTabs } from "@/components/modules/canhoes/CompactSegmentTabs";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { PublicUserDto, EventWishlistItemDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { VirtualizedList } from "@/components/ui/virtualized-list";

function WishlistLoadingState() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div className="space-y-2 rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(22,28,15,0.72)] p-4">
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.1)] p-3">
              <Skeleton className="h-14 w-14 rounded-[var(--radius-md-token)]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function groupWishlistItemsByUser(items: EventWishlistItemDto[]) {
  const wishlistByUser = new Map<string, EventWishlistItemDto[]>();

  for (const wishlistItem of items) {
    const itemsForUser = wishlistByUser.get(wishlistItem.userId) ?? [];
    itemsForUser.push(wishlistItem);
    wishlistByUser.set(wishlistItem.userId, itemsForUser);
  }

  for (const itemsForUser of wishlistByUser.values()) {
    itemsForUser.sort((leftItem, rightItem) =>
      (rightItem.updatedAt || "").localeCompare(leftItem.updatedAt || "")
    );
  }

  return wishlistByUser;
}

export function CanhoesWishlistModule() {
  const { user } = useAuth();
  const { event } = useEventOverview();
  const eventId = event?.id ?? null;

  const [memberList, setMemberList] = useState<PublicUserDto[]>([]);
  const [wishlistItems, setWishlistItems] = useState<EventWishlistItemDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    title: "",
    link: "",
    notes: "",
    selectedFile: null as File | null,
  });

  const canSubmit = formState.title.trim().length >= 2;
  const wishlistByUser = useMemo(() => groupWishlistItemsByUser(wishlistItems), [wishlistItems]);

  useEffect(() => {
    if (memberList.length === 0) {
      setSelectedMemberId(null);
      return;
    }

    setSelectedMemberId((current) => {
      if (current && memberList.some((member) => member.id === current)) return current;
      if (user?.id && memberList.some((member) => member.id === user.id)) return user.id;
      return memberList[0].id;
    });
  }, [memberList, user?.id]);

  const selectedMember = memberList.find((member) => member.id === selectedMemberId) ?? null;
  const selectedMemberItems = selectedMember ? wishlistByUser.get(selectedMember.id) ?? [] : [];

  const loadWishlist = useCallback(async (currentEventId: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextMembers, nextWishlistItems] = await Promise.all([
        canhoesEventsRepo.getMembers(currentEventId),
        canhoesEventsRepo.getWishlist(currentEventId),
      ]);

      setMemberList(Array.isArray(nextMembers) ? nextMembers : []);
      setWishlistItems(Array.isArray(nextWishlistItems) ? nextWishlistItems : []);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar a wishlist desta edicao."
      );
      logFrontendError("CanhoesWishlist.loadWishlist", error, { eventId: currentEventId });
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMemberList([]);
    setWishlistItems([]);
    setErrorMessage(null);
    setSelectedMemberId(null);
    setFormState({ title: "", link: "", notes: "", selectedFile: null });

    if (!eventId) {
      setIsLoading(false);
      return;
    }

    void loadWishlist(eventId);
  }, [eventId, loadWishlist]);

  const handleCreate = async () => {
    if (!canSubmit || !eventId) return;

    setIsSaving(true);
    try {
      const createdItem = await canhoesEventsRepo.createWishlistItem(eventId, {
        notes: formState.notes.trim() || null,
        title: formState.title.trim(),
        link: formState.link.trim() || null,
      });

      if (formState.selectedFile) {
        await canhoesEventsRepo.uploadWishlistImage(eventId, createdItem.id, formState.selectedFile);
      }

      setFormState({ title: "", link: "", notes: "", selectedFile: null });
      await loadWishlist(eventId);
      toast.success("Item adicionado");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel guardar este item da wishlist."
      );
      logFrontendError("CanhoesWishlist.handleCreate", error);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (wishlistItemId: string) => {
    if (!eventId) return;
    setDeletingItemId(wishlistItemId);

    try {
      await canhoesEventsRepo.deleteWishlistItem(eventId, wishlistItemId);
      setWishlistItems((currentItems) =>
        currentItems.filter((wishlistItem) => wishlistItem.id !== wishlistItemId)
      );
      toast.success("Item removido");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel remover este item da wishlist."
      );
      logFrontendError("CanhoesWishlist.handleDelete", error, { wishlistItemId });
      toast.error(message);
    } finally {
      setDeletingItemId(null);
    }
  };

  const isInitialLoading = isLoading && memberList.length === 0;

  let wishlistContent: JSX.Element | null = null;
  if (!errorMessage) {
    if (memberList.length === 0 && !isInitialLoading) {
      wishlistContent = (
        <EmptyState icon={Inbox} title="Sem membros" description="Ainda nao ha membros na wishlist." />
      );
    } else if (memberList.length > 0) {
      wishlistContent = (
        <div className="space-y-3">
          <CompactSegmentTabs
            activeId={selectedMember?.id ?? ""}
            items={memberList.map((member) => ({
              id: member.id,
              label: member.displayName || member.email || member.name,
              badge: String((wishlistByUser.get(member.id) ?? []).length),
            }))}
            onSelect={setSelectedMemberId}
          />

          {selectedMember ? (
            <WishlistMemberPanel
              deletingItemId={deletingItemId}
              items={selectedMemberItems}
              member={selectedMember}
              onDelete={handleDelete}
              userId={user?.id ?? null}
            />
          ) : null}
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Gift}
        title="Wishlist"
        description="Toda a gente ve a wishlist de toda a gente. So tu ves o teu amigo secreto."
        badgeLabel={`${wishlistItems.length} itens`}
        badgeVariant="secondary"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Adicionar item à tua wishlist</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="wishlist-title-input" className="canhoes-field-label">Título</label>
              <Input
                id="wishlist-title-input"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Ex.: Mouse sem fios"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="wishlist-url-input" className="canhoes-field-label">URL</label>
              <Input
                id="wishlist-url-input"
                value={formState.link}
                onChange={(event) => setFormState((prev) => ({ ...prev, link: event.target.value }))}
                placeholder="URL opcional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="wishlist-notes-input" className="canhoes-field-label">Notas</label>
            <Textarea
              id="wishlist-notes-input"
              value={formState.notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Notas opcionais"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CanhoesFileTrigger
              accept="image/png,image/jpeg"
              fileName={formState.selectedFile?.name}
              onChange={(file) => setFormState((prev) => ({ ...prev, selectedFile: file }))}
              placeholder="Adicionar imagem (opcional)"
            />

            <Button disabled={!canSubmit || isSaving} onClick={() => void handleCreate()}>
              {isSaving ? "A guardar..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage ? (
        <ErrorAlert
          title="Erro ao carregar wishlist"
          description={errorMessage}
          actionLabel="Tentar novamente"
          onAction={() => void (eventId ? loadWishlist(eventId) : Promise.resolve())}
        />
      ) : null}

      {isInitialLoading ? <WishlistLoadingState /> : null}

      {wishlistContent}
    </div>
  );
}

function WishlistMemberPanel({
  deletingItemId,
  items,
  member,
  onDelete,
  userId,
}: Readonly<{
  deletingItemId: string | null;
  items: EventWishlistItemDto[];
  member: PublicUserDto;
  onDelete: (wishlistItemId: string) => Promise<void>;
  userId: string | null;
}>) {
  const isCurrentUser = member.id === userId;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="truncate">{member.displayName || member.email}</span>
          {isCurrentUser ? <Badge variant="outline">tu</Badge> : null}
          {member.isAdmin && !isCurrentUser ? <Badge variant="outline">admin</Badge> : null}
          <span className="body-small ml-auto text-[var(--color-text-muted)]">{items.length} itens</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-4">Sem itens nesta wishlist.</p>
        ) : (
          <VirtualizedList
            items={items}
            getKey={(wishlistItem) => wishlistItem.id}
            estimateSize={() => 108}
            className="max-h-[50svh]"
            renderItem={(wishlistItem) => (
              <div className="canhoes-list-item flex gap-3 p-2.5">
                <CanhoesMediaThumb alt={wishlistItem.title} src={wishlistItem.imageUrl} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{wishlistItem.title}</p>
                  {wishlistItem.notes ? (
                    <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{wishlistItem.notes}</p>
                  ) : null}
                  {wishlistItem.link ? (
                    <a href={wishlistItem.link} target="_blank" rel="noreferrer" className="canhoes-link mt-1.5 inline-flex items-center gap-1 text-xs">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Abrir link
                    </a>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {new Date(wishlistItem.updatedAt ?? wishlistItem.updatedAtUtc).toLocaleDateString()}
                  </p>

                  {isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() => void onDelete(wishlistItem.id)}
                      disabled={deletingItemId === wishlistItem.id}
                      className="canhoes-tap rounded-full border border-transparent p-2 text-[var(--color-text-muted)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)] disabled:opacity-50"
                      aria-label="Apagar item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
