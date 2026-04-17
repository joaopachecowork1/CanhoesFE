import type { LucideIcon } from "lucide-react";

type AdminSectionDefinition<Id extends string, Context> = {
  count: (context: Readonly<Context>) => number;
  description: string;
  icon: LucideIcon;
  id: Id;
  label: string;
};

type AdminSectionMeta<Id extends string> = {
  icon: LucideIcon;
  id: Id;
  label: string;
};

type AdminSectionItem<Id extends string> = AdminSectionMeta<Id> & {
  count: number;
  description: string;
};

export function createAdminSectionRegistry<Id extends string, Context>(
  definitions: readonly AdminSectionDefinition<Id, Context>[]
) {
  const ids = definitions.map((definition) => definition.id) as readonly Id[];

  return {
    buildItems(context: Readonly<Context>): AdminSectionItem<Id>[] {
      return definitions.map((definition) => ({
        id: definition.id,
        label: definition.label,
        description: definition.description,
        icon: definition.icon,
        count: definition.count(context),
      }));
    },
    getItem(id: Id): AdminSectionDefinition<Id, Context> | null {
      return definitions.find((definition) => definition.id === id) ?? null;
    },
    getMeta(): AdminSectionMeta<Id>[] {
      return definitions.map((definition) => ({
        id: definition.id,
        label: definition.label,
        icon: definition.icon,
      }));
    },
    ids,
    isId(value: string): value is Id {
      return (ids as readonly string[]).includes(value);
    },
  };
}
