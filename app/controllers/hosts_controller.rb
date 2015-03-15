class HostsController < ApplicationController
  def index
    hosts = Zabbix.hosts
    render json: hosts
  end
end
