//
// These tests should ensure we can switch a socket to receive 'polling' mode only,
// so that we can choose when to pull messages off the socket.
//

var zmq = require('../')
  , should = require('should');

var push = zmq.socket('push')
  , pull = zmq.socket('pull');


var p = 0;

pull.poll_without_recv = true;
pull.on('message_ready', function(msg) {
    console.log("something is waiting!", msg);
    p++;

    pull.receiveOne();
});


var n = 0;

pull.on('message', function(msg){
  msg = msg.toString();
    console.log('received ', msg);
  switch (n++) {
    case 0:
      msg.should.equal('string');
      break;
    case 1:
      msg.should.equal('15.99');
      break;
    case 2:
      msg.should.equal('buffer');
      push.close();
      pull.close();
      break;
  }
});

pull.bind('inproc://stuff', function(){
  push.connect('inproc://stuff');
  push.send('string');
  push.send(15.99);
  push.send(new Buffer('buffer'));
});