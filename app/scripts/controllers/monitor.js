'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MonitorCtrl
 * @description
 * # MonitorCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MonitorCtrl', function ($scope) {

  	document.title = ' 节点监控 | FIBOS 导航';

  	var bp_status_rows = {};
  	var bp_status_change_logs_rows = [];
  	var producerjson_rows = {};
  	var st1, st2, st3;

	$scope.protocol = window.location.protocol;

  	get_bp_status();
  	bp_status_change_logs();
  	producerjson();

	function get_bp_status() {
	  	$.getJSON('https://api.fibos123.com/bp_status', function(data) {
	  		$scope.bp_status = data;
	  		if (!bp_status_rows || JSON.stringify(bp_status_rows) != JSON.stringify(data.rows2)) {
	  			$scope.bp_status_rows = data.rows2;
	  			bp_status_rows = data.rows2;
	  		}
	  		$scope.$apply();
			st1 = setTimeout(function (){
				get_bp_status()
			}, 1000)
	  	});
	}

	function bp_status_change_logs() {
	  	$.getJSON('https://api.fibos123.com/bp_status_change_logs', function(data) {
	  		$scope.bp_status_change_logs = data;
	  		if (!bp_status_change_logs_rows || bp_status_change_logs_rows.length != data.rows.length) {
	  			$scope.bp_status_change_logs_rows = data.rows;
	  			bp_status_change_logs_rows = data.rows;
	  		}
	  		$scope.$apply();
			st2 = setTimeout(function (){
				bp_status_change_logs()
			}, 1000)
	  	});
	}

	function producerjson() {
	  	$.post('https://rpc-mainnet.fibos123.com/v1/chain/get_table_rows',
	  		JSON.stringify({
	  			"json": "true",
		  		"code": "producerjson",
		  		"scope": "producerjson",
		  		"table": "producerjson",
		  		"limit": 1000
		  	})
	  	, function(data) {
	  		var list = {};
	  		for (var i = 0; i < data.rows.length; i++) {
	  			var json = JSON.parse(data.rows[i].json);
	  			list[i] = {
	  				owner: data.rows[i].owner,
	  				http_status: "unset",
	  				http_number: "",
	  				https_status: "unset",
	  				https_number: "",
	  				p2p_status: "unset"
	  			};

	  			if (!producerjson_rows[i]) {
		  			producerjson_rows[i] = {
		  				owner: data.rows[i].owner,
		  				http_status: "unset",
		  				http_number: "",
		  				http_msg: "",
		  				https_status: "unset",
		  				https_number: "",
		  				https_msg: "",
		  				p2p_status: "unset"
		  			};
	  			}

	  			for (var j = 0; j < json.nodes.length; j++) {
	  				// http
	  				var api_endpoint = json.nodes[j].api_endpoint || json.nodes[j].rpc_endpoint;
	  				if (api_endpoint) {
	  					if (producerjson_rows[i]['http_status']) {
							list[i]['http_status'] = producerjson_rows[i]['http_status'];
							list[i]['http_number'] = producerjson_rows[i]['http_number'];
							list[i]['http_msg'] = producerjson_rows[i]['http_msg'];
						}
						if (api_endpoint.indexOf("http://") === 0) {
		  					get_info(i, api_endpoint + '/v1/chain/get_info', function(i, url, info) {
		  						if (info.head_block_num) {
									list[i]['http_status'] = producerjson_rows[i]['http_status'] = "online";
									list[i]['http_number'] = producerjson_rows[i]['http_number'] = info.head_block_num;
		  						} else {
									list[i]['http_status'] = producerjson_rows[i]['http_status'] = "offline";
		  						}
		  					}, function(i, url, textStatus) {
		  						if (textStatus == "timeout") {
									list[i]['http_status'] = producerjson_rows[i]['http_status'] = "timeout";
		  						} else {
								    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
								    encodeURIComponent(url) + 
								    '&callback=?';
									get_info(i, url, function(i, url, info) {
				  						if (info.head_block_num) {
											list[i]['http_status'] = producerjson_rows[i]['http_status'] = "warning";
											list[i]['http_number'] = producerjson_rows[i]['http_number'] = info.head_block_num;
				  						} else {
											list[i]['http_status'] = producerjson_rows[i]['http_status'] = "offline";
				  						}
				  					}, function (i, url, textStatus){
										list[i]['http_status'] = producerjson_rows[i]['http_status'] = "error";
										list[i]['http_msg'] = producerjson_rows[i]['http_msg'] = "error";
				  					})
		  						}
		  					})
	  					} else {
							list[i]['http_status'] = producerjson_rows[i]['http_status'] = "error";
							list[i]['http_msg'] = producerjson_rows[i]['http_msg'] = "not http";
	  					}
						list[i]['http_endpoint'] = producerjson_rows[i]['http_endpoint'] = api_endpoint;
  					}
	  				// https
	  				var ssl_endpoint = json.nodes[j].ssl_endpoint;
	  				if (ssl_endpoint) {
	  					if (producerjson_rows[i]['https_status']) {
							list[i]['https_status'] = producerjson_rows[i]['https_status'];
							list[i]['https_number'] = producerjson_rows[i]['https_number'];
							list[i]['https_msg'] = producerjson_rows[i]['https_msg'];
						}
						if (ssl_endpoint.indexOf("https://") === 0) {
		  					get_info(i, ssl_endpoint + '/v1/chain/get_info', function(i, url, info) {
		  						if (info.head_block_num) {
									list[i]['https_status'] = producerjson_rows[i]['https_status'] = "online";
									list[i]['https_number'] = producerjson_rows[i]['https_number'] = info.head_block_num;
		  						} else {
									list[i]['https_status'] = producerjson_rows[i]['https_status'] = "offline";
		  						}
		  					}, function(i, url, textStatus) {
		  						if (textStatus == "timeout") {
									list[i]['https_status'] = producerjson_rows[i]['https_status'] = "timeout";
		  						} else {
								    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
								    encodeURIComponent(url) + 
								    '&callback=?';
									get_info(i, url, function(i, url, info) {
				  						if (info.head_block_num) {
											list[i]['https_status'] = producerjson_rows[i]['https_status'] = "warning";
											list[i]['https_number'] = producerjson_rows[i]['https_number'] = info.head_block_num;
				  						} else {
											list[i]['https_status'] = producerjson_rows[i]['https_status'] = "offline";
				  						}
				  					}, function (i, url, textStatus){
										list[i]['https_status'] = producerjson_rows[i]['https_status'] = "error";
										list[i]['https_msg'] = producerjson_rows[i]['https_msg'] = "error";
				  					})
		  						}
		  					})
	  					} else {
							list[i]['https_status'] = producerjson_rows[i]['https_status'] = "error";
							list[i]['https_msg'] = producerjson_rows[i]['https_msg'] = "not https";
	  					}
						list[i]['https_endpoint'] = producerjson_rows[i]['https_endpoint'] = ssl_endpoint;
  					}
	  				// p2p
	  				var p2p_endpoint = json.nodes[j].p2p_endpoint;
	  				if (p2p_endpoint) {
	  					if (producerjson_rows[i]['p2p_status'] && producerjson_rows[i]['p2p_status'] != 'unset') {
							list[i]['p2p_status'] = producerjson_rows[i]['p2p_status'];
						} else {
		  					var addr = p2p_endpoint.split(":");
		  					var host = addr[0];
		  					var port = addr[1];
		  					producerjson_rows[i]['p2p_status'] = 'connecting';
		  					check_p2p(i, host, port, function(i, host, port, info) {
		  						var status = info.msg.indexOf("open");
		  						if (status) {
									list[i]['p2p_status'] = producerjson_rows[i]['p2p_status'] = "open";
		  						} else {
									list[i]['p2p_status'] = producerjson_rows[i]['p2p_status'] = "blocked";
		  						}
		  					}, function(i){
								list[i]['p2p_status'] = producerjson_rows[i]['p2p_status'] = "timeout";
		  					})
						}
						list[i]['p2p_endpoint'] = producerjson_rows[i]['p2p_endpoint'] = p2p_endpoint;
  					}
	  			}
	  		}

	  		$scope.producerjson = list;
	  		$scope.$apply();
	  		$('[data-toggle="tooltip"]').tooltip();
			st3 = setTimeout(function (){
				producerjson();
			}, 1000)
	  	});

	  	function get_info(i, url, callback, errcallback) {
	  		$.ajax({
			    type: "GET",
			    // cache: false,
			    timeout: 1000,
			    url: url,
			    data: {},
			    dataType: "json",
			    success: function (data, textStatus){
			    	callback(i, url, data);
			    },
			    error: function (XMLHttpRequest, textStatus, errorThrown){
			    	errcallback(i, url, textStatus);
			    }
			})
	  	}

	  	function check_p2p(i, host, port, callback, errcallback) {
		    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
		    encodeURIComponent('https://networkappers.com/api/port.php?ip='+host+'&port='+port) + 
		    '&callback=?';
	  		$.ajax({
			    type: "GET",
			    // cache: false,
			    timeout: 2000,
			    url: url,
			    data: {},
			    dataType: "json",
			    success: function (data, textStatus){
			    	callback(i, host, port, data);
			    },
			    error: function (XMLHttpRequest, textStatus, errorThrown){
			    	errcallback(i, host, port, textStatus);
			    }
			})
	  	}
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
		clearTimeout(st2);
		clearTimeout(st3);
	})

	// 检查空对象
	function checkNullObj (obj) {
		for (var i in obj) {
		    return true
		}
		return false
	}


  });
