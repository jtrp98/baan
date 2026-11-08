import path from "node:path";
import { matches } from "./snapshot.mjs";

export function isSafePathRead(filePath, allowedDirs = []) {
  if (!filePath || !allowedDirs.length) return false;
  const resolved = path.resolve(filePath);
  return allowedDirs.some((dir) => {
    const parent = path.resolve(dir);
    const rel = path.relative(parent, resolved);
    return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  });
}

export function isSafeFileWrite(filePath, repoPath, ownsGlobs = []) {
  if (!filePath || !repoPath || !ownsGlobs.length) return false;
  const rel = path.relative(path.resolve(repoPath), path.resolve(filePath)).replaceAll("\\", "/");
  if (rel.startsWith("..") || path.isAbsolute(rel)) return false;
  return ownsGlobs.some((glob) => matches(rel, glob));
}

export function isWhitelistedCommand(cmdStr, packetCommands = {}) {
  if (!cmdStr) return false;
  const normalized = cmdStr.trim();
  const whitelisted = Object.values(packetCommands).filter(Boolean).map((c) => c.trim());
  return whitelisted.includes(normalized);
}

export function evaluateApprovalRequest(request, packet, allowedDirs = []) {
  const { type, action, path: targetPath, command } = request;

  // File Read inspection
  if (type === "read" || action === "read_file" || action === "view_file") {
    if (isSafePathRead(targetPath, allowedDirs)) {
      return { decision: "allow", reason: "safe read within allowed workspace/knowledge boundaries" };
    }
  }

  // File Write mutation
  if (type === "write" || action === "write_file" || action === "edit_file") {
    if (isSafeFileWrite(targetPath, packet?.repo?.path, packet?.owns ?? [])) {
      return { decision: "allow", reason: "safe file write within packet owns globs" };
    }
  }

  // Shell Command Execution
  if (type === "command" || action === "execute_command" || action === "run_command") {
    if (isWhitelistedCommand(command, packet?.commands ?? {})) {
      return { decision: "allow", reason: "command matches whitelisted packet commands" };
    }
  }

  return {
    decision: "escalate",
    reason: `action requires human confirmation: ${JSON.stringify(request)}`,
  };
}

export function createApprovalBridge(policy = "auto-safe", packet = null, allowedDirs = []) {
  const requests = [];

  return {
    policy,
    getRequests: () => [...requests],
    handleRequest: async (req) => {
      requests.push({ ...req, at: new Date().toISOString() });
      if (policy === "bypass") {
        return { decision: "allow", reason: "permission_policy: bypass active" };
      }
      const evaluated = evaluateApprovalRequest(req, packet, allowedDirs);
      if (evaluated.decision === "allow") return evaluated;

      if (policy === "auto-safe") {
        return { decision: "deny", reason: `auto-safe policy denied non-whitelisted action: ${evaluated.reason}` };
      }

      return { decision: "pause", reason: evaluated.reason };
    },
  };
}
