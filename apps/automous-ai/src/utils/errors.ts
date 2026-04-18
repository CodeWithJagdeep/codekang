// ─── Custom Error Hierarchy ───────────────────────────────────────────────────

export class CodeKangError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'CodeKangError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class GitError extends CodeKangError {
  constructor(message: string) {
    super(message, 'GIT_ERROR');
    this.name = 'GitError';
  }
}

export class DockerError extends CodeKangError {
  constructor(message: string) {
    super(message, 'DOCKER_ERROR');
    this.name = 'DockerError';
  }
}

export class AgentError extends CodeKangError {
  constructor(message: string) {
    super(message, 'AGENT_ERROR');
    this.name = 'AgentError';
  }
}

export class GitHubAPIError extends CodeKangError {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message, 'GITHUB_API_ERROR');
    this.name = 'GitHubAPIError';
  }
}

export class IndexingError extends CodeKangError {
  constructor(message: string) {
    super(message, 'INDEXING_ERROR');
    this.name = 'IndexingError';
  }
}

export class WebhookError extends CodeKangError {
  constructor(message: string) {
    super(message, 'WEBHOOK_ERROR');
    this.name = 'WebhookError';
  }
}
