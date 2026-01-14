// APISIX Sync Service
// Syncs WAF policies from UI to APISIX configuration

interface WAFPolicy {
    id: string;
    name: string;
    enabled: boolean;
    mode: 'block' | 'detect' | 'off';
    conditions: PolicyCondition[];
    action: 'block' | 'allow' | 'challenge' | 'log';
    priority: number;
}

interface PolicyCondition {
    field: 'uri' | 'args' | 'headers' | 'body' | 'method' | 'ip' | 'user-agent';
    operator: 'contains' | 'equals' | 'regex' | 'not_contains';
    value: string;
}

const APISIX_ADMIN_URL = process.env.APISIX_ADMIN_URL || 'http://localhost:9180';
const APISIX_ADMIN_KEY = process.env.APISIX_ADMIN_KEY || 'montara-admin-key';

export class APISIXSyncService {
    private adminUrl: string;
    private adminKey: string;

    constructor() {
        this.adminUrl = APISIX_ADMIN_URL;
        this.adminKey = APISIX_ADMIN_KEY;
    }

    // Convert UI policy to Lua WAF pattern
    private policyToLuaPattern(policy: WAFPolicy): string {
        const patterns: string[] = [];

        for (const condition of policy.conditions) {
            let luaPattern = '';

            switch (condition.operator) {
                case 'contains':
                    luaPattern = condition.value.toLowerCase();
                    break;
                case 'regex':
                    luaPattern = condition.value;
                    break;
                case 'equals':
                    luaPattern = `^${condition.value}$`;
                    break;
                default:
                    luaPattern = condition.value;
            }

            patterns.push(`"${luaPattern}"`);
        }

        return patterns.join(', ');
    }

    // Generate serverless function code for custom policies
    private generatePolicyLuaCode(policies: WAFPolicy[]): string {
        const enabledPolicies = policies.filter(p => p.enabled && p.mode !== 'off');

        if (enabledPolicies.length === 0) {
            return '';
        }

        let luaCode = `
-- Custom WAF Policies from UI
local custom_policies = {
`;

        for (const policy of enabledPolicies) {
            luaCode += `  {
    name = "${policy.name}",
    mode = "${policy.mode}",
    action = "${policy.action}",
    patterns = {${this.policyToLuaPattern(policy)}}
  },
`;
        }

        luaCode += `}

for _, policy in ipairs(custom_policies) do
  for _, pattern in ipairs(policy.patterns) do
    if string.match(check_string, pattern) then
      if policy.action == "block" then
        ngx.status = 403
        ngx.header["Content-Type"] = "application/json"
        ngx.say('{"error": "Blocked by policy: ' .. policy.name .. '", "code": 403}')
        return ngx.exit(403)
      elseif policy.action == "log" then
        ngx.log(ngx.WARN, "Policy triggered: " .. policy.name .. " - Pattern: " .. pattern)
      end
    end
  end
end
`;

        return luaCode;
    }

    // Reload APISIX configuration
    async reloadConfig(): Promise<boolean> {
        try {
            const response = await fetch(`${this.adminUrl}/apisix/admin/plugins/reload`, {
                method: 'PUT',
                headers: {
                    'X-API-KEY': this.adminKey,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('APISIX reload error:', error);
            return false;
        }
    }

    // Update route with new WAF configuration
    async updateRouteWAF(routeId: string, policies: WAFPolicy[]): Promise<boolean> {
        try {
            // Get current route
            const getResponse = await fetch(`${this.adminUrl}/apisix/admin/routes/${routeId}`, {
                headers: {
                    'X-API-KEY': this.adminKey,
                },
            });

            if (!getResponse.ok) {
                console.error('Failed to get route');
                return false;
            }

            const routeData = await getResponse.json();
            const route = routeData.value || routeData;

            // Generate custom policy code
            const policyCode = this.generatePolicyLuaCode(policies);

            // Update serverless-pre-function if policies exist
            if (policyCode) {
                if (!route.plugins) route.plugins = {};
                if (!route.plugins['serverless-pre-function']) {
                    route.plugins['serverless-pre-function'] = {
                        phase: 'rewrite',
                        functions: [],
                    };
                }

                // Add policy function
                const existingFunctions = route.plugins['serverless-pre-function'].functions || [];
                route.plugins['serverless-pre-function'].functions = [
                    ...existingFunctions.filter((f: string) => !f.includes('Custom WAF Policies')),
                    `return function(conf, ctx)\n${policyCode}\nend`,
                ];
            }

            // Update route
            const updateResponse = await fetch(`${this.adminUrl}/apisix/admin/routes/${routeId}`, {
                method: 'PUT',
                headers: {
                    'X-API-KEY': this.adminKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(route),
            });

            return updateResponse.ok;
        } catch (error) {
            console.error('APISIX update error:', error);
            return false;
        }
    }

    // Add IP to blacklist
    async addIPToBlacklist(ip: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.adminUrl}/apisix/admin/routes/1`, {
                headers: {
                    'X-API-KEY': this.adminKey,
                },
            });

            if (!response.ok) return false;

            const routeData = await response.json();
            const route = routeData.value || routeData;

            // Add IP to ip-restriction blacklist
            if (!route.plugins) route.plugins = {};
            if (!route.plugins['ip-restriction']) {
                route.plugins['ip-restriction'] = { blacklist: [] };
            }

            const blacklist = route.plugins['ip-restriction'].blacklist || [];
            if (!blacklist.includes(ip)) {
                blacklist.push(ip);
                route.plugins['ip-restriction'].blacklist = blacklist;

                const updateResponse = await fetch(`${this.adminUrl}/apisix/admin/routes/1`, {
                    method: 'PUT',
                    headers: {
                        'X-API-KEY': this.adminKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(route),
                });

                return updateResponse.ok;
            }

            return true;
        } catch (error) {
            console.error('Add IP error:', error);
            return false;
        }
    }

    // Remove IP from blacklist
    async removeIPFromBlacklist(ip: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.adminUrl}/apisix/admin/routes/1`, {
                headers: {
                    'X-API-KEY': this.adminKey,
                },
            });

            if (!response.ok) return false;

            const routeData = await response.json();
            const route = routeData.value || routeData;

            if (route.plugins?.['ip-restriction']?.blacklist) {
                route.plugins['ip-restriction'].blacklist =
                    route.plugins['ip-restriction'].blacklist.filter((i: string) => i !== ip);

                const updateResponse = await fetch(`${this.adminUrl}/apisix/admin/routes/1`, {
                    method: 'PUT',
                    headers: {
                        'X-API-KEY': this.adminKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(route),
                });

                return updateResponse.ok;
            }

            return true;
        } catch (error) {
            console.error('Remove IP error:', error);
            return false;
        }
    }
}

export const apisixSync = new APISIXSyncService();
