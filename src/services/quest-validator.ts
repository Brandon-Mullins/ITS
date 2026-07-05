import type { StructuredQuestDefinition, StructuredQuestStep } from '../types/quest-data';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  stepId?: string;
  message: string;
}

export function validateQuest(quest: StructuredQuestDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!quest.id) issues.push({ severity: 'error', message: 'Missing quest id' });
  if (!quest.pageName) issues.push({ severity: 'error', message: 'Missing pageName' });
  if (quest.steps.length === 0) issues.push({ severity: 'error', message: 'Quest has no steps' });

  for (const step of quest.steps) {
    issues.push(...validateStep(step));
  }

  if (quest.itemBrain) {
    for (const item of quest.requiredItems) {
      const inBrain =
        quest.itemBrain.required?.includes(item) ||
        quest.itemBrain.geBuyable?.includes(item);
      if (!inBrain) {
        issues.push({
          severity: 'warning',
          message: `Required item "${item}" not in itemBrain`,
        });
      }
    }
  } else if (quest.requiredItems.length > 0) {
    issues.push({ severity: 'warning', message: 'Quest missing itemBrain metadata' });
  }

  return issues;
}

export function validateStep(step: StructuredQuestStep): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!step.instruction || step.instruction.length < 8) {
    issues.push({ severity: 'error', stepId: step.id, message: 'Step instruction too short' });
  }

  const hasChecks =
    (step.completionChecks.chatContains?.length ?? 0) > 0 ||
    (step.completionChecks.questJournalContains?.length ?? 0) > 0 ||
    (step.completionChecks.inventoryContains?.length ?? 0) > 0 ||
    (step.completionChecks.locationContains?.length ?? 0) > 0;

  if (!hasChecks) {
    issues.push({ severity: 'warning', stepId: step.id, message: 'No completion checks defined' });
  }

  if (step.location && (!step.travelRoutes || step.travelRoutes.length < 2)) {
    issues.push({
      severity: 'warning',
      stepId: step.id,
      message: 'Location step should have ≥2 travel routes',
    });
  }

  if (
    step.instruction.match(/fight|kill|defeat|combat/i) &&
    (!step.combatWarnings || step.combatWarnings.length === 0)
  ) {
    issues.push({ severity: 'warning', stepId: step.id, message: 'Combat step missing warnings' });
  }

  if (!step.markers.area && !step.markers.npc && !step.markers.object) {
    issues.push({ severity: 'warning', stepId: step.id, message: 'No marker metadata' });
  }

  return issues;
}

export function validateAllQuests(quests: StructuredQuestDefinition[]): ValidationIssue[] {
  return quests.flatMap(validateQuest);
}
