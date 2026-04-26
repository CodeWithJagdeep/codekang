export const SERVICES = {
  AUTH: 'AUTH_SERVICE',
  AI_AGENT: 'AI_AGENT_SERVICE',
  REPOS: 'REPOS_SERVICE',
} as const;

export const MESSAGE_PATTERNS = {
  // Auth
  AUTH_VALIDATE_TOKEN: 'auth.validate_token',
  AUTH_GET_USER: 'auth.get_user',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REFRESH_TOKEN: 'auth.refresh_token',
  AUTH_GET_SUBSCRIPTION: 'auth.get_subscription',
  AUTH_CHECK_CREDITS: 'auth.check_credits',
  AUTH_CONSUME_CREDITS: 'auth.consume_credits',
  AUTH_FIREBASE_LOGIN: 'auth.firebase_login',
  AUTH_COMPLETE_ONBOARDING: 'auth.complete_onboarding',
  AUTH_LINK_VCS: 'auth.link_vcs',
  AUTH_UPDATE_PLAN: 'auth.update_plan',
  AUTH_SEND_OTP: 'auth.send_otp',
  AUTH_VERIFY_OTP: 'auth.verify_otp',
  AUTH_GITHUB_EXCHANGE: 'auth.github_exchange',
  AUTH_CREATE_SUBSCRIPTION: 'auth.create_subscription',
  AUTH_CANCEL_SUBSCRIPTION: 'auth.cancel_subscription',
  AUTH_GET_SESSIONS: 'auth.get_sessions',
  AUTH_REVOKE_SESSION: 'auth.revoke_session',

  // AI Agent
  AGENT_CREATE_CONVERSATION: 'agent.create_conversation',
  AGENT_SEND_MESSAGE: 'agent.send_message',
  AGENT_GET_CONVERSATIONS: 'agent.get_conversations',
  AGENT_GET_CONVERSATION: 'agent.get_conversation',
  AGENT_DELETE_CONVERSATION: 'agent.delete_conversation',
  AGENT_STREAM_MESSAGE: 'agent.stream_message',
  AGENT_FIX_ISSUE: 'agent.fix_issue',
  AGENT_GET_USAGE: 'agent.get_usage',

  // Repos
  REPOS_LIST: 'repos.list',
  REPOS_CONNECT: 'repos.connect',
  REPOS_DISCONNECT: 'repos.disconnect',
  REPOS_GET_ISSUES: 'repos.get_issues',
  REPOS_GET_PRS: 'repos.get_prs',
  REPOS_GET_ISSUE: 'repos.get_issue',
  REPOS_GET_PR: 'repos.get_pr',
  REPOS_LIST_CONNECTED: 'repos.list_connected',
  REPOS_SYNC: 'repos.sync',
  ORG_ENSURE_DEFAULT: 'org.ensure_default',
  ORG_LIST_MEMBERS: 'org.list_members',
  ORG_INVITE_MEMBER: 'org.invite_member',
  ORG_REMOVE_MEMBER: 'org.remove_member',
  ORG_UPDATE_MEMBER_ROLE: 'org.update_member_role',

  // Integrations
  INTEGRATION_LIST: 'integration.list',
  INTEGRATION_CONNECT: 'integration.connect',
  INTEGRATION_DISCONNECT: 'integration.disconnect',
  INTEGRATION_UPDATE_STATUS: 'integration.update_status',
  INTEGRATION_UPDATE_CONFIG: 'integration.update_config',

  // Notifications
  NOTIF_LIST: 'notif.list',
  NOTIF_READ: 'notif.read',
  NOTIF_UNREAD_COUNT: 'notif.unread_count',

  // Support
  SUPPORT_CREATE: 'support.create',
  SUPPORT_LIST: 'support.list',

  // Audit
  AUDIT_LIST: 'audit.list',
} as const;
