"use client";

import { useRef, type ReactNode } from "react";
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";

type VirtualItem = {
  index: number;
  start: number;
};

type VirtualizerApi = {
  getVirtualItems: () => VirtualItem[];
  getTotalSize: () => number;
  measureElement: (node: Element | null) => void;
};

type VirtualizedListProps<T> = {
  className?: string;
  estimateSize?: () => number;
  getKey?: (item: T, index: number) => string | number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
  items: T[];
  useWindowScroll?: boolean;
};

/**
 * Lista virtualizada de alta performance para renderizar grandes volumes de dados.
 * Renderiza apenas os itens visíveis no viewport (~10-15 nós DOM), independentemente do total.
 * 
 * @param className - Classes CSS para o contentor.
 * @param estimateSize - Função que retorna o tamanho estimado de cada item (padrão: 60px).
 * @param getKey - Função para fornecer chaves estáveis (estratégico para reordenação).
 * @param items - Lista de dados a processar.
 * @param renderItem - Função que define como cada item é desenhado.
 * @param useWindowScroll - Se true, utiliza o scroll da janela em vez de um contentor interno.
 * @param overscan - Número de itens extras a renderizar fora da área visível (suaviza o scroll).
 */
export function VirtualizedList<T>(props: Readonly<VirtualizedListProps<T>>) {
  return props.useWindowScroll ? (
    <WindowVirtualizedList {...props} />
  ) : (
    <ContainerVirtualizedList {...props} />
  );
}

function ContainerVirtualizedList<T>({
  className,
  estimateSize = () => 60,
  getKey,
  items,
  overscan = 5,
  renderItem,
}: Readonly<VirtualizedListProps<T>>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      role="list"
      className={cn("overflow-y-auto", className)}
      style={{ contain: "strict" }}
    >
      <VirtualizedItems
        getKey={getKey}
        items={items}
        renderItem={renderItem}
        virtualizer={virtualizer}
      />
    </div>
  );
}

function WindowVirtualizedList<T>({
  className,
  estimateSize = () => 60,
  getKey,
  items,
  overscan = 5,
  renderItem,
}: Readonly<VirtualizedListProps<T>>) {
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize,
    overscan,
  });

  return (
    <div role="list" className={cn("relative", className)} style={{ contain: "strict" }}>
      <VirtualizedItems
        getKey={getKey}
        items={items}
        renderItem={renderItem}
        virtualizer={virtualizer}
      />
    </div>
  );
}

function VirtualizedItems<T>({
  getKey,
  items,
  renderItem,
  virtualizer,
}: Readonly<{
  getKey?: (item: T, index: number) => string | number;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  virtualizer: VirtualizerApi;
}>) {
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {virtualItems.map((virtualRow) => {
        const item = items[virtualRow.index];
        const key = getKey ? getKey(item, virtualRow.index) : virtualRow.index;

        return (
          <div
            key={key}
            role="listitem"
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(item, virtualRow.index)}
          </div>
        );
      })}
    </div>
  );
}
