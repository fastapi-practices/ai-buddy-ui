export function filterDefaultCandidates<
  T extends { id: number; status: number },
>(models: T[], candidateIds: number[]): T[] {
  const candidates = new Set(candidateIds);
  return models.filter(
    (model) => model.status === 1 && candidates.has(model.id),
  );
}
