var Viewer = React.createClass({
  getInitialState: function() {
    return {
      hosts: []
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
  render: function() {
    return (
      <div>
        <h1>Viewer</h1>
        <ItemSelectorForm hosts={this.state.hosts} />
      </div>
    );
  }
});

var ItemSelectorForm = React.createClass({
  getInitialState: function() {
    return {
      selectedHosts: [],
      availableItems: []
    };
  },
  loadAvailableItems: function() {
    // this.state.selectedHosts;
    this.setState({
      availableItems: [{name: "cpu"}]
    });
  },
  onHostsSelected: function(hosts) {
    this.setState({
      selectedHosts: hosts,
    });

    this.loadAvailableItems();
  },
  render: function() {
    return (
      <form>
        <HostSelector hosts={this.props.hosts} onHostsSelected={this.onHostsSelected} />
        <ItemSelector items={this.state.availableItems} />
      </form>
    );
  }
});

var HostSelector = React.createClass({
  handleChange: function(e) {
    e.preventDefault();
    var hostname = React.findDOMNode(this.refs.host).selectedOptions[0].value; // TODO: support multiple hosts
    var hosts = this.props.hosts.filter(function(host) {
      return host.host == hostname;
    });

    this.props.onHostsSelected(hosts);
  },
  render: function() {
    var hostOptions = this.props.hosts.map(function(host) {
      return (
        <option key={host.hostid}>{host.host}</option>
      );
    });
    return (
      <select size="10" onChange={this.handleChange} ref="host">
        {hostOptions}
      </select>
    );
  }
});

var ItemSelector = React.createClass({
  handleChange: function(e) {
    e.preventDefault();
  },
  render: function() {
    var itemOptions = this.props.items.map(function(item) {
      return (
        <option key={item.name}>{item.name}</option>
      );
    });
    return (
      <select size="10" onChange={this.handleChange} ref="item">
        {itemOptions}
      </select>
    );
  }
});
