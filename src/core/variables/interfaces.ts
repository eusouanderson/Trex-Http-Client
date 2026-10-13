interface VariableScope {
  name: string;
  variables: Record<string, string>;
}

interface VariableResolutionResult {
  resolved: string;
  unresolvedKeys: string[];
}

interface IVariableResolverService {
  resolve(
    text: string,
    scopes: VariableScope[],
  ): VariableResolutionResult;
  resolveRecord(
    record: Record<string, string>,
    scopes: VariableScope[],
  ): { resolved: Record<string, string>; unresolvedKeys: string[] };
}

export type {
  VariableScope,
  VariableResolutionResult,
  IVariableResolverService,
};

