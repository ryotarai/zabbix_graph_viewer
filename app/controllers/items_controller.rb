class ItemsController < ApplicationController
  def index
    hostids = params[:hostids]
    raise unless hostids && hostids.present?
    items = Zabbix.items(hostids: hostids)
    render json: items
  end
end
