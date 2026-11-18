export function mediaCategoryKey(category?: string) {
  return category?.trim().toLowerCase() ?? "";
}

export function mediaCategories(items: ReadonlyArray<{ category?: string }>) {
  const categories = new Map<string, string>();
  for (const item of items) {
    const label = item.category?.trim();
    const key = mediaCategoryKey(label);
    if (label && !categories.has(key)) categories.set(key, label);
  }
  return [...categories].map(([key, label]) => ({ key, label }));
}
