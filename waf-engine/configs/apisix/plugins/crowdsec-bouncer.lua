-- CrowdSec Bouncer Plugin for APISIX
-- This plugin checks requests against CrowdSec decisions

local http = require("resty.http")
local core = require("apisix.core")
local ngx = ngx

local plugin_name = "crowdsec-bouncer"

local schema = {
    type = "object",
    properties = {
        api_url = {
            type = "string",
            default = "http://crowdsec:8080"
        },
        api_key = {
            type = "string"
        },
        ban_response_code = {
            type = "integer",
            default = 403
        },
        ban_response_msg = {
            type = "string",
            default = "Access Denied by CrowdSec"
        },
        captcha_response_code = {
            type = "integer",
            default = 401
        },
        cache_ttl = {
            type = "integer",
            default = 60
        }
    },
    required = {"api_key"}
}

local _M = {
    version = 0.1,
    priority = 2500,  -- Run before other plugins
    name = plugin_name,
    schema = schema
}

function _M.check_schema(conf)
    return core.schema.check(schema, conf)
end

-- Check IP against CrowdSec decisions
local function check_ip(conf, ip)
    local httpc = http.new()
    httpc:set_timeout(1000)
    
    local res, err = httpc:request_uri(conf.api_url .. "/v1/decisions?ip=" .. ip, {
        method = "GET",
        headers = {
            ["X-Api-Key"] = conf.api_key
        }
    })
    
    if not res then
        core.log.error("CrowdSec API error: ", err)
        return nil, err
    end
    
    if res.status == 200 then
        local decisions = core.json.decode(res.body)
        if decisions and #decisions > 0 then
            return decisions[1].type  -- "ban", "captcha", etc.
        end
    end
    
    return nil
end

function _M.access(conf, ctx)
    local ip = core.request.get_remote_client_ip(ctx)
    
    -- Check cache first
    local cache_key = "crowdsec:" .. ip
    local cached = ngx.shared.crowdsec_cache:get(cache_key)
    
    local decision
    if cached then
        decision = cached
    else
        decision = check_ip(conf, ip)
        if decision then
            ngx.shared.crowdsec_cache:set(cache_key, decision, conf.cache_ttl)
        else
            ngx.shared.crowdsec_cache:set(cache_key, "ok", conf.cache_ttl)
        end
    end
    
    if decision == "ban" then
        return conf.ban_response_code, { message = conf.ban_response_msg }
    elseif decision == "captcha" then
        return conf.captcha_response_code, { message = "Captcha required", captcha = true }
    end
end

return _M
