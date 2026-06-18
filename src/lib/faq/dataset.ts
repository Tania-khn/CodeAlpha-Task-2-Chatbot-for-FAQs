import type { FaqEntry } from '@/lib/nlp';

/**
 * FAQ dataset for the fictional SaaS product "CloudTask" — a cloud-based
 * project & task management tool. These FAQs cover pricing, billing,
 * features, security, integrations, and support.
 *
 * Each entry has:
 *   - id           unique slug
 *   - question     canonical question (also used as the matching document)
 *   - answer       the answer text the chatbot will surface
 *   - category     used by the FAQ browser panel
 *   - keywords     optional anchor terms — boost matching for surface forms
 *                  that don't share stems with the canonical question
 */
export const FAQ_DATASET: FaqEntry[] = [
  // ---- Pricing & Plans ----
  {
    id: 'free-trial',
    category: 'Pricing & Plans',
    question: 'Does CloudTask offer a free trial?',
    answer:
      'Yes. Every paid plan starts with a 14-day free trial — no credit card required. You can cancel any time during the trial and you will not be charged. At the end of the trial, your workspace is automatically downgraded to the Free plan, so your data is never lost.',
    keywords: ['trial', 'try', 'evaluate', 'no credit card', 'free plan'],
  },
  {
    id: 'pricing-tiers',
    category: 'Pricing & Plans',
    question: 'What are the available pricing plans?',
    answer:
      'CloudTask has four plans: Free (up to 3 users, 5 projects), Starter ($9/user/month, unlimited projects), Business ($19/user/month, advanced automation & analytics), and Enterprise (custom pricing, SSO/SAML, dedicated support). All paid plans are billed per active user per month.',
    keywords: ['price', 'cost', 'plan', 'subscription', 'tier', 'how much'],
  },
  {
    id: 'cancel-subscription',
    category: 'Pricing & Plans',
    question: 'How do I cancel my subscription?',
    answer:
      'To cancel: open Settings → Billing → Manage Subscription → Cancel Plan. Your plan stays active until the end of the current billing cycle, after which the workspace downgrades to the Free plan. Refunds for partial months are issued only for annual plans cancelled within the first 30 days.',
    keywords: ['cancel', 'unsubscribe', 'stop', 'refund', 'end subscription'],
  },
  {
    id: 'change-plan',
    category: 'Pricing & Plans',
    question: 'Can I upgrade or downgrade my plan later?',
    answer:
      'Yes — you can change your plan at any time from Settings → Billing. Upgrades take effect immediately and you are billed a prorated amount for the remainder of the billing cycle. Downgrades take effect at the start of the next cycle.',
    keywords: ['upgrade', 'downgrade', 'change plan', 'switch plan'],
  },
  {
    id: 'annual-discount',
    category: 'Pricing & Plans',
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes. Annual billing gives you two months free per year — effectively a ~17% discount versus monthly billing. You can switch between monthly and annual at any time from Settings → Billing.',
    keywords: ['annual', 'yearly', 'discount', 'save', 'year'],
  },

  // ---- Account & Onboarding ----
  {
    id: 'create-account',
    category: 'Account & Onboarding',
    question: 'How do I create a CloudTask account?',
    answer:
      'Go to cloudtask.io/signup, enter your work email, and choose a password. You can also sign up with Google or Microsoft SSO. After verifying your email, you will be guided through a 60-second onboarding that creates your first workspace and project.',
    keywords: ['sign up', 'register', 'create account', 'new account'],
  },
  {
    id: 'invite-team',
    category: 'Account & Onboarding',
    question: 'How do I invite team members to my workspace?',
    answer:
      'From the sidebar, click your workspace name → Invite Members. Enter email addresses (one per line or comma-separated) and pick a role: Admin, Member, or Guest. Invitees receive an email with a join link that expires after 7 days.',
    keywords: ['invite', 'team', 'members', 'add people', 'collaborate'],
  },
  {
    id: 'roles-permissions',
    category: 'Account & Onboarding',
    question: 'What roles and permissions are available?',
    answer:
      'CloudTask has three roles. Admin: full control of workspace settings, billing, and members. Member: create/edit projects and tasks, comment, and upload files. Guest: read-only access to specific projects they are invited to. Custom roles are available on the Business and Enterprise plans.',
    keywords: ['role', 'permission', 'access', 'admin', 'member', 'guest'],
  },
  {
    id: 'delete-account',
    category: 'Account & Onboarding',
    question: 'How do I delete my account and all my data?',
    answer:
      'Workspace owners can delete the workspace from Settings → General → Danger Zone → Delete Workspace. This permanently deletes all projects, tasks, files, and members after a 30-day grace period. To delete only your personal account (without deleting the workspace), contact support@cloudtask.io.',
    keywords: ['delete', 'remove', 'erase', 'gdpr', 'close account'],
  },
  {
    id: 'password-reset',
    category: 'Account & Onboarding',
    question: 'I forgot my password — how do I reset it?',
    answer:
      'Go to cloudtask.io/forgot-password and enter your work email. A reset link will arrive within 2 minutes (check spam if not). The link is valid for 1 hour. If you use SSO (Google/Microsoft), you do not need a CloudTask password — reset through your identity provider instead.',
    keywords: ['password', 'forgot', 'reset', 'login', 'sign in'],
  },

  // ---- Features ----
  {
    id: 'automation-rules',
    category: 'Features',
    question: 'Can I automate repetitive tasks with rules?',
    answer:
      'Yes. CloudTask Automations let you build if-this-then-that rules with triggers (e.g. task created, status changed, due date reached) and actions (assign user, move to project, send notification, set due date). The Free plan allows 3 automations per workspace; Business and Enterprise allow unlimited automations and multi-step rules.',
    keywords: ['automation', 'rule', 'trigger', 'workflow', 'no-code'],
  },
  {
    id: 'gantt-chart',
    category: 'Features',
    question: 'Does CloudTask have Gantt charts or timeline views?',
    answer:
      'Yes. Every project has a Timeline view (interactive Gantt) available on Starter and above. You can drag task bars to adjust dates, draw dependencies between tasks, and group by assignee or status. Critical-path highlighting is available on the Business plan.',
    keywords: ['gantt', 'timeline', 'schedule', 'dependency', 'roadmap'],
  },
  {
    id: 'time-tracking',
    category: 'Features',
    question: 'Is there built-in time tracking?',
    answer:
      'Yes. Each task has a Start Timer button in the right panel. Logged time is attributed to the task, project, and assignee, and rolls up into the Time Reports dashboard. You can also log time manually after the fact. Time tracking is available on Business and Enterprise plans.',
    keywords: ['time tracking', 'timer', 'hours', 'timesheet', 'log time'],
  },
  {
    id: 'custom-fields',
    category: 'Features',
    question: 'Can I add custom fields to tasks?',
    answer:
      'Yes. Workspace Admins can create custom fields (text, number, date, dropdown, currency, formula) from Settings → Custom Fields. Once created, a field can be added to any project and used for filtering, grouping, and reporting. Custom fields are available on Starter and above; formula fields require Business or above.',
    keywords: ['custom field', 'column', 'attribute', 'metadata'],
  },
  {
    id: 'mobile-app',
    category: 'Features',
    question: 'Is there a mobile app for iOS and Android?',
    answer:
      'Yes. CloudTask has native apps for iOS (15+) and Android (10+), available on the App Store and Google Play. The mobile apps support offline mode — your changes sync automatically once you are back online. Push notifications can be configured per-workspace.',
    keywords: ['mobile', 'app', 'ios', 'android', 'phone', 'tablet'],
  },

  // ---- Integrations ----
  {
    id: 'slack-integration',
    category: 'Integrations',
    question: 'Does CloudTask integrate with Slack?',
    answer:
      'Yes. Install the CloudTask Slack app from the Slack App Directory. Once connected, you can turn Slack messages into tasks with one click, receive task updates in a channel, and use the /cloudtask slash command to create tasks from anywhere in Slack.',
    keywords: ['slack', 'notification', 'message', 'channel'],
  },
  {
    id: 'github-integration',
    category: 'Integrations',
    question: 'Can I link CloudTask with GitHub?',
    answer:
      'Yes. Connect a GitHub repository from Project → Integrations → GitHub. Once linked, you can attach commit SHAs and PR URLs to tasks, and CloudTask auto-syncs task status when referenced commits or PRs are merged. Branch names like `cloudtask-123-...` will automatically link to task #123.',
    keywords: ['github', 'git', 'commit', 'pull request', 'pr', 'repository'],
  },
  {
    id: 'google-calendar',
    category: 'Integrations',
    question: 'Can I sync tasks with Google Calendar?',
    answer:
      'Yes. From Settings → Integrations → Google Calendar, connect your Google account and pick which projects to sync. Task due dates appear as all-day events on your calendar, and any edits sync both ways within 5 minutes. Two-way sync requires the Business plan; one-way (CloudTask → Calendar) is available on all paid plans.',
    keywords: ['google calendar', 'calendar', 'sync', 'outlook', 'ical'],
  },
  {
    id: 'zapier-integration',
    category: 'Integrations',
    question: 'Does CloudTask work with Zapier or Make?',
    answer:
      'Yes. CloudTask is an official Zapier and Make.com partner. You can trigger Zaps/scenarios on task events (created, updated, completed) and create/update tasks as an action. Native webhooks are also available on Business and above for custom integrations.',
    keywords: ['zapier', 'make', 'integromat', 'webhook', 'no-code', 'connect'],
  },

  // ---- Security & Privacy ----
  {
    id: 'data-encryption',
    category: 'Security & Privacy',
    question: 'Is my data encrypted at rest and in transit?',
    answer:
      'Yes. All traffic between clients and CloudTask uses TLS 1.2+. Data at rest is encrypted with AES-256 in AWS-managed KMS. Database backups are also encrypted and stored in a separate region. Encryption keys are rotated every 90 days.',
    keywords: ['encryption', 'tls', 'ssl', 'aes', 'security', 'encrypted'],
  },
  {
    id: 'gdpr-compliance',
    category: 'Security & Privacy',
    question: 'Is CloudTask GDPR compliant?',
    answer:
      'Yes. CloudTask is GDPR compliant and acts as a Data Processor for customer data. We sign DPAs with all paid customers, support data subject access requests (DSAR), and provide one-click data export and account deletion. Our EU data residency option (Frankfurt) is available on Enterprise plans.',
    keywords: ['gdpr', 'privacy', 'eu', 'dpa', 'data protection'],
  },
  {
    id: 'sso-saml',
    category: 'Security & Privacy',
    question: 'Does CloudTask support SSO / SAML?',
    answer:
      'Yes. SAML 2.0 single sign-on is available on the Enterprise plan. We support Okta, Azure AD, Google Workspace, OneLogin, and any SAML 2.0-compliant IdP. SCIM provisioning for automated user lifecycle management is included. Optional MFA enforcement is available on Business and Enterprise.',
    keywords: ['sso', 'saml', 'okta', 'azure', 'single sign on', 'mfa', '2fa'],
  },
  {
    id: 'data-backup',
    category: 'Security & Privacy',
    question: 'How often is my data backed up?',
    answer:
      'CloudTask takes continuous incremental backups every 5 minutes and a full snapshot every 24 hours. Backups are retained for 35 days and stored in a geographically separated region. Self-service point-in-time restore is available on the Business plan; Enterprise plans get 1-year retention and dedicated restore SLAs.',
    keywords: ['backup', 'restore', 'snapshot', 'disaster recovery'],
  },

  // ---- Support ----
  {
    id: 'support-channels',
    category: 'Support',
    question: 'How can I contact CloudTask support?',
    answer:
      'Free and Starter plans get email support (support@cloudtask.io) with a 24-hour response target on business days. Business plans get priority email + in-app chat with a 4-hour response SLA. Enterprise plans get a dedicated CSM, 24/7 phone support, and a 1-hour response SLA for critical issues.',
    keywords: ['support', 'help', 'contact', 'email', 'phone', 'ticket'],
  },
  {
    id: 'status-uptime',
    category: 'Support',
    question: 'Where can I check the CloudTask system status?',
    answer:
      'Live system status, historical uptime, and incident history are published at status.cloudtask.io. You can subscribe to status updates via email, SMS, RSS, or webhook. Our uptime SLA is 99.9% for Business plans and 99.99% for Enterprise plans, with service credits issued automatically if we miss it.',
    keywords: ['status', 'uptime', 'downtime', 'incident', 'outage', 'sla'],
  },
  {
    id: 'data-export',
    category: 'Support',
    question: 'Can I export all my CloudTask data?',
    answer:
      'Yes. From Settings → General → Export Data, you can request a full workspace export. We package projects, tasks, comments, attachments, time logs, and audit logs into a ZIP containing JSON and CSV files. Exports are ready within 30 minutes and a download link is emailed to the requester. The link is valid for 7 days.',
    keywords: ['export', 'download', 'backup', 'json', 'csv', 'data'],
  },
];
