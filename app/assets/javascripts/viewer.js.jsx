var Viewer = React.createClass({
  getInitialState: function() {
    return {
      hosts: [],
      graphs: [],
      periodHour: 1,
    };
  },
  componentDidMount: function() {
    this.loadHostsFromServer();
  },
  loadHostsFromServer: function() {
    $.ajax({
      url: '/hosts',
      dataType: 'json',
      success: function(data) {
        this.setState({hosts: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  addGraph: function(items) {
    this.setState({
      graphs: [{items: items}].concat(this.state.graphs),
    });
  },
  handleUpdatedPeriod: function(period) {
    this.setState({
      periodHour: period,
    });
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-md-3">
          <TimeSelector onPeriodUpdated={this.handleUpdatedPeriod} />
          <hr />
          <ItemSelectorForm hosts={this.state.hosts} addGraph={this.addGraph} />
        </div>
        <div className="col-md-9">
          <Graphs graphs={this.state.graphs} zabbixUrl={this.props.zabbixUrl} periodHour={this.state.periodHour} />
        </div>
      </div>
    );
  }
});

var PermaLink = React.createClass({
  render: function() {
    var link = $.param({
      graphs: this.props.state.graphs,
      periodHour: this.props.state.periodHour,
    });
    return (
      <form className="form-inline">
        <input value={link} className="form-control" />
      </form>
    );
  },
});

var TimeSelector = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var period = parseInt(React.findDOMNode(this.refs.period).value);
    this.props.onPeriodUpdated(period);
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="form-group">
          <input type="number" placeholder="Period (default: 1 hour)" className="form-control" ref="period" />
        </div>
        <input type="submit" value="Update" className="btn btn-default" />
      </form>
    );
  },
});

var Graphs = React.createClass({
  render: function() {
    var graphs = this.props.graphs.map(function(graph) {
      return (
        <Graph graph={graph} zabbixUrl={this.props.zabbixUrl} periodHour={this.props.periodHour} />
      );
    }, this);
    return (
      <div>{graphs}</div>
    );
  },
});

var Graph = React.createClass({
  render: function() {
    var param = {
      action: 'batchgraph',
      graphtype: '0',
      period: this.props.periodHour * 3600,
      itemids: _.map(this.props.graph.items, function(item) { return item.itemid; }),
    };
    var src = this.props.zabbixUrl + "/chart.php?" + $.param(param);
    return (
      <div>
        <img src={src} />
      </div>
    );
  }
});

var ItemSelectorForm = React.createClass({
  getInitialState: function() {
    return {
      selectedItems: [],
      availableItems: []
    };
  },
  loadAvailableItems: function(hosts) {
    var hostids = _.map(hosts, function(host) {
      return host.hostid;
    });

    $.ajax({
      url: '/items',
      dataType: 'json',
      data: {hostids: hostids},
      success: function(items) {
        _.each(items, function(item) {
          item.host = _.findWhere(hosts, {hostid: item.hostid});
        });
        this.setState({
          availableItems: items,
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  onHostsSelected: function(hosts) {
    this.loadAvailableItems(hosts);
  },
  onItemsSelected: function(items) {
    this.setState({
      selectedItems: items,
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.addGraph(this.state.selectedItems);
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <HostSelector hosts={this.props.hosts} onHostsSelected={this.onHostsSelected} />
        <ItemSelector items={this.state.availableItems} onItemsSelected={this.onItemsSelected} />
        <input type="submit" value="Add Graph" className="btn btn-primary" />
      </form>
    );
  }
});

var TextFilter = React.createClass({
  handleChange: function(e) {
    this.props.onFilterChanged(e.target.value);
  },
  render: function() {
    return (
      <input onChange={this.handleChange} className="form-control" placeholder="Filter" />
    );
  }
});

var HostSelector = React.createClass({
  getInitialState: function() {
    return {
      filter: ''
    };
  },
  handleChange: function(e) {
    e.preventDefault();
    var hostids = _.map(e.target.selectedOptions, function(option) {
      return option.value;
    });
    var hosts = this.props.hosts.filter(function(host) {
      return _.contains(hostids, host.hostid)
    });

    this.props.onHostsSelected(hosts);
  },
  handleFilterChanged: function(query) {
    this.setState({
      filter: query,
    });
  },
  render: function() {
    var hosts = _.sortBy(this.props.hosts, function(host) {
      return host.host;
    });
    if (this.state.filter != '') {
      hosts = _.filter(hosts, function(host) {
        return host.host.includes(this.state.filter);
      }, this);
    }
    var hostOptions = _.map(hosts, function(host) {
      return (
        <option key={host.hostid} value={host.hostid}>{host.host}</option>
      );
    });
    return (
      <div className="form-group">
        <TextFilter onFilterChanged={this.handleFilterChanged} />
        <select size="10" onChange={this.handleChange} className="form-control" multiple>
          {hostOptions}
        </select>
      </div>
    );
  }
});

var ItemSelector = React.createClass({
  getInitialState: function() {
    return {
      filter: ''
    };
  },
  handleChange: function(e) {
    e.preventDefault();
    var itemids = _.map(e.target.selectedOptions, function(option) {
      return option.value;
    });
    var items = this.props.items.filter(function(item) {
      return _.contains(itemids, item.itemid)
    });
    this.props.onItemsSelected(items);
  },
  handleFilterChanged: function(query) {
    this.setState({
      filter: query,
    });
  },
  render: function() {
    var items = _.sortBy(this.props.items, function(item) {
      return item.name;
    });
    if (this.state.filter != '') {
      items = _.filter(items, function(item) {
        return item.name.includes(this.state.filter) ||
          item.key_.includes(this.state.filter);
      }, this);
    }
    var itemOptions = _.map(items, function(item) {
      return (
        <option key={item.itemid} value={item.itemid}>
          {`[${item.host.host}] ${item.name} (${item.key_})`}
        </option>
      );
    });
    return (
      <div className="form-group">
        <TextFilter onFilterChanged={this.handleFilterChanged} />
        <select size="10" multiple onChange={this.handleChange} className="form-control">
          {itemOptions}
        </select>
      </div>
    );
  }
});
