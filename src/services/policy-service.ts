// WAF Policy Service
// Manages policies that sync to Coraza WAF rules

export interface WAFPolicy {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    mode: 'block' | 'detect' | 'off';
    priority: number;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export interface PolicyCondition {
    field: 'uri' | 'method' | 'ip' | 'country' | 'user-agent' | 'header' | 'cookie' | 'body';
    operator: 'equals' | 'contains' | 'matches' | 'starts_with' | 'ends_with' | 'in_list';
    value: string;
    negate?: boolean;
}

export interface PolicyAction {
    type: 'block' | 'allow' | 'log' | 'rate_limit' | 'challenge' | 'redirect';
    statusCode?: number;
    message?: string;
    redirectUrl?: string;
    rateLimit?: {
        requests: number;
        period: string;
    };
}

export interface PolicyRule {
    id: string;
    policyId: string;
    ruleId: number;
    corazaRule: string;
    enabled: boolean;
}

// Convert policy to Coraza SecRule format
export function policyToCorazaRule(policy: WAFPolicy): string {
    if (!policy.enabled || policy.mode === 'off') {
        return `# Policy: ${policy.name} (disabled)`;
    }

    const rules: string[] = [];
    const ruleId = 100000 + parseInt(policy.id.replace(/\D/g, '').slice(0, 6) || '0');

    // Build variable string based on conditions
    const variables: string[] = [];
    const operators: string[] = [];

    for (const condition of policy.conditions) {
        const varName = conditionFieldToVariable(condition.field);
        variables.push(varName);
        operators.push(buildOperator(condition));
    }

    // Build action string
    const actions: string[] = [];
    actions.push(`id:${ruleId}`);
    actions.push(`phase:2`);

    if (policy.mode === 'block') {
        actions.push('deny');
        actions.push('status:403');
    } else {
        actions.push('log');
        actions.push('pass');
    }

    actions.push(`msg:'${policy.name}'`);
    actions.push(`severity:WARNING`);
    actions.push(`tag:'montara-policy'`);

    // Generate the rule
    const varString = variables.join('|');
    const opString = operators.join(' ');

    rules.push(`# Policy: ${policy.name}`);
    rules.push(`# Description: ${policy.description || 'No description'}`);
    rules.push(`SecRule ${varString} "${opString}" "${actions.join(',')}"`);
    rules.push('');

    return rules.join('\n');
}

function conditionFieldToVariable(field: PolicyCondition['field']): string {
    const mapping: Record<string, string> = {
        'uri': 'REQUEST_URI',
        'method': 'REQUEST_METHOD',
        'ip': 'REMOTE_ADDR',
        'country': 'GEO:COUNTRY_CODE',
        'user-agent': 'REQUEST_HEADERS:User-Agent',
        'header': 'REQUEST_HEADERS',
        'cookie': 'REQUEST_COOKIES',
        'body': 'REQUEST_BODY',
    };
    return mapping[field] || 'REQUEST_URI';
}

function buildOperator(condition: PolicyCondition): string {
    const neg = condition.negate ? '!' : '';

    switch (condition.operator) {
        case 'equals':
            return `${neg}@streq ${condition.value}`;
        case 'contains':
            return `${neg}@contains ${condition.value}`;
        case 'matches':
            return `${neg}@rx ${condition.value}`;
        case 'starts_with':
            return `${neg}@beginsWith ${condition.value}`;
        case 'ends_with':
            return `${neg}@endsWith ${condition.value}`;
        case 'in_list':
            return `${neg}@pmFromFile ${condition.value}`;
        default:
            return `@contains ${condition.value}`;
    }
}

// Convert multiple policies to a complete rules file
export function policiesToCorazaConfig(policies: WAFPolicy[]): string {
    const header = `# Montara WAF Custom Policies
# Auto-generated - Do not edit manually
# Generated: ${new Date().toISOString()}

`;

    const sortedPolicies = [...policies].sort((a, b) => a.priority - b.priority);
    const rules = sortedPolicies.map(policyToCorazaRule).join('\n');

    return header + rules;
}

// Validate policy before saving
export function validatePolicy(policy: Partial<WAFPolicy>): string[] {
    const errors: string[] = [];

    if (!policy.name || policy.name.trim().length === 0) {
        errors.push('Policy name is required');
    }

    if (!policy.conditions || policy.conditions.length === 0) {
        errors.push('At least one condition is required');
    }

    if (policy.conditions) {
        for (const condition of policy.conditions) {
            if (!condition.field) {
                errors.push('Condition field is required');
            }
            if (!condition.operator) {
                errors.push('Condition operator is required');
            }
            if (!condition.value || condition.value.trim().length === 0) {
                errors.push('Condition value is required');
            }
        }
    }

    return errors;
}
