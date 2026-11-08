// Contract for provider-specific native harness adapters.
export class BaseAdapter {
  constructor(id, label) {
    this.id = id;
    this.label = label;
  }

  // Probe CLI version, configuration, entitlement, and parent environment.
  async probe(def, opts = {}) {
    throw new Error(`${this.id}: probe() not implemented`);
  }

  // Build CLI arguments and invocation details for Mode B (headless).
  buildHeadless(spec) {
    throw new Error(`${this.id}: buildHeadless() not implemented`);
  }

  // Build CLI arguments and invocation details for Mode A (interactive TTY).
  buildInteractive(spec) {
    throw new Error(`${this.id}: buildInteractive() not implemented`);
  }

  // Parse a single streaming line into a normalized event.
  parseStreamLine(line) {
    return null;
  }

  // Extract final JSON or answer payload from stdout and/or answer file.
  extractFinalResult(rawStdout, answerFile) {
    return null;
  }
}
