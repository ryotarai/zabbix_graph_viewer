class Zabbix
  class << self
    def hosts
      client.hosts.get({})
    end

    def client
      @zbx ||= ZabbixApi.connect(
        :url => URI.join(Rails.application.secrets.zabbix_url, 'api_jsonrpc.php').to_s,
        :user => Rails.application.secrets.zabbix_user,
        :password => Rails.application.secrets.zabbix_password,
      )
    end
  end
end
