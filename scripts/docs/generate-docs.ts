import { DocOrchestratorService } from './doc-orchestrator.service';

const main = async (): Promise<void> => {
  const orchestrator = new DocOrchestratorService();
  try {
    const success = await orchestrator.run();
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[docs:generate] Erro: ${message}\n`);
    process.exit(1);
  }
};

void main();

export { main };

