/**
 * Azure IoT hub node to send C2D messages to devices
 **/
 
 module.exports = function(RED) {
 
	
	var Client = require('azure-iothub').Client;
	var Message = require('azure-iot-common').Message;

	var serviceClient = null;
	
	/* Node for configuring Azure IoT  */
	
	function iothubendpointnode(n) {
		
		RED.nodes.createNode(this, n);
		this.connString = n.connString;
		
	}
	

	RED.nodes.registerType("iothub-endpoint", iothubendpointnode);

	
	/* Node for sending C2D message */
	

	function azureiotc2d(n) {
		
		RED.nodes.createNode(this, n);
		
		this.endpoint = n.endpoint;
		this.endpointConfig = RED.nodes.getNode(this.endpoint); 
		
		var node = this;
		
		
		if (node.endpointConfig) {
			
			
			node.deviceid = n.deviceid;
						
			
			
		} else {
			console.log("Missing Endpoint");
		}
		
		
		
		this.status({fill:"blue",shape:"ring",text:"waiting"});
		
		node.on("input", function(msg) {
		
		if (serviceClient){
				serviceClient.removeAllListeners();
				serviceClient.close(printResultFor('close'));
				serviceClient = null;
		}
				 

		
		var serviceClient = Client.fromConnectionString(this.endpointConfig.connString);
		if (msg.deviceid != null){
				node.deviceid = msg.deviceid;
		}
		
		serviceClient.open(function (err) {
			if (err) {
				console.error('Could not connect: ' + err.message);
			} else {
				
				serviceClient.getFeedbackReceiver(receiveFeedback);
				var message = new Message('Cloud to device message.');
				message.ack = 'full';
				msg.ack = 'full';
				 
				console.log('Sending message: ' + msg.payload);
				
				node.status({fill:"red",shape:"ring",text:"sending"});
				serviceClient.send(node.deviceid, msg.payload, printResultFor('send'));
				node.status({fill:"red",shape:"ring",text:"sent"});
			}
		});
	
 
 
 
 
	});
	
	this.on('close', function() {
		if (serviceClient){
				serviceClient.removeAllListeners();
				serviceClient.close(printResultFor('close'));
				serviceClient = null;
		}
});
			
	};

	RED.nodes.registerType("azureiotc2d", azureiotc2d);

	function printResultFor(op) {
   return function printResult(err, res) {
     if (err) console.log(op + ' error: ' + err.toString());
     if (res) console.log(op + ' status: ' + res.constructor.name);
   };
 }
 
 function receiveFeedback(err, receiver){
   receiver.on('message', function (msg) {
     console.log('Feedback message:')
     console.log(msg.getData().toString('utf-8'));
   });
 }
	
	}
 

