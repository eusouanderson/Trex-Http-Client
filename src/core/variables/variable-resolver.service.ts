import type {
  IVariableResolverService,
  VariableResolutionResult,
  VariableScope,
} from './interfaces';

class VariableResolverService implements IVariableResolverService {
  private readonly VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  private readonly MAX_RECURSION_DEPTH = 10;

  public resolve(
    text: string,
    scopes: VariableScope[],
  ): VariableResolutionResult {
    if (text.length === 0) {
      return { resolved: text, unresolvedKeys: [] };
    }

    const mergedVariables = this.buildMergedVariables(scopes);
    const unresolvedKeys = new Set<string>();

    let currentText = text;
    let iteration = 0;
    const visitedInChain = new Set<string>();

    while (iteration < this.MAX_RECURSION_DEPTH) {
      iteration++;
      let replacementCount = 0;

      currentText = currentText.replace(
        this.VARIABLE_REGEX,
        (match: string, key: string): string => {
          if (visitedInChain.has(key)) {
            unresolvedKeys.add(key);
            return match;
          }

          if (Object.prototype.hasOwnProperty.call(mergedVariables, key)) {
            replacementCount++;
            visitedInChain.add(key);
            return mergedVariables[key] ?? match;
          }

          unresolvedKeys.add(key);
          return match;
        },
      );

      if (replacementCount === 0) {
        break;
      }
    }

    if (iteration >= this.MAX_RECURSION_DEPTH) {
      const remainingMatches = currentText.match(this.VARIABLE_REGEX);
      if (remainingMatches !== null) {
        for (const m of remainingMatches) {
          const key = m.replace(/[{}\\s]/g, '');
          unresolvedKeys.add(key);
        }
      }
    }

    return {
      resolved: currentText,
      unresolvedKeys: Array.from(unresolvedKeys),
    };
  }

  public resolveRecord(
    record: Record<string, string>,
    scopes: VariableScope[],
  ): { resolved: Record<string, string>; unresolvedKeys: string[] } {
    const resolvedRecord: Record<string, string> = {};
    const allUnresolvedKeys = new Set<string>();

    for (const [key, value] of Object.entries(record)) {
      const resolvedKeyResult = this.resolve(key, scopes);
      const resolvedValResult = this.resolve(value, scopes);

      for (const uk of resolvedKeyResult.unresolvedKeys) {
        allUnresolvedKeys.add(uk);
      }
      for (const uv of resolvedValResult.unresolvedKeys) {
        allUnresolvedKeys.add(uv);
      }

      resolvedRecord[resolvedKeyResult.resolved] = resolvedValResult.resolved;
    }

    return {
      resolved: resolvedRecord,
      unresolvedKeys: Array.from(allUnresolvedKeys),
    };
  }

  private buildMergedVariables(scopes: VariableScope[]): Record<string, string> {
    const merged: Record<string, string> = {};
    for (let i = scopes.length - 1; i >= 0; i--) {
      const scope = scopes[i];
      if (scope) {
        Object.assign(merged, scope.variables);
      }
    }
    return merged;
  }
}

export { VariableResolverService };

