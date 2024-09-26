const osc = require('osc');

const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
});

simpleListener.on("message", (msg: any) => {
    console.log("Message received: ", msg);
});

simpleListener.on("error", (err: Error) => {
    console.error("Error: ", err);
});

simpleListener.open();
