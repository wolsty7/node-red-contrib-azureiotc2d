/**
 * Azure IoT hub node to send C2D messages to devices
 **/
 
 module.exports = function(RED) {
 
	
	var Client = require('azure-iothub').Client;
	var Message = require('azure-iot-common').Message;

	//var serviceClient = Client.fromConnectionString(connectionString);
	
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
		
		this.status({fill:"red",shape:"ring",text:"waiting"});
		
		node.on("input", function(msg) {

		 if (serviceClient){
			 console.log(serviceClient);
			 
				serviceClient.removeAllListeners();
				serviceClient.close(printResultFor('close'));
                //serviceClient = null;
			 
		 }
		
		var serviceClient = Client.fromConnectionString(this.endpointConfig.connString);
		
		serviceClient.open(function (err) {
		if (err) {
			console.error('Could not connect: ' + err.message);
		} else {
		 console.log('Service client connected');
		 serviceClient.getFeedbackReceiver(receiveFeedback);
		 var message = new Message('Cloud to device message.');
		 message.ack = 'full';
		 console.log('Sending message: ' + msg.payload);
		 node.status({fill:"red",shape:"ring",text:"sending"});
		serviceClient.send(node.deviceid, msg.payload, printResultFor('send'));

   }
 });
	});
	
	this.on('close', function() {
   
	serviceClient.close(printResultFor('close'));
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
 

