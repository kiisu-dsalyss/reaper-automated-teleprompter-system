const osc = require('osc');

interface OSCMessage {
  address: string;
  args: any[];
  timestamp: Date;
}

// Function to start listening for specific OSC messages and process them as they arrive
export function startOSCStream() {
  const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
  });

  // Handle incoming OSC messages as they arrive
  simpleListener.on("message", (msg: any) => {
    handleOSCMessage(msg);
  });

  simpleListener.on("error", (err: Error) => {
    console.error("Error: ", err);
  });

  simpleListener.open();
}

// Function to handle each OSC message as it arrives
function handleOSCMessage(msg: any) {
//   console.log("Processing OSC message: ", msg);

  switch (msg.address) {
    case "/beat/str":
      handleBeatPosition(msg.args);
      break;
    case "/time":
      handleTimePosition(msg.args);
      break;
    case "/lastregion/name":
      handleLastRegionName(msg.args);
      break;
    default:
    //   console.log("Unhandled message address: ", msg.address);
  }
}

// Function to handle beat position updates
function handleBeatPosition(args: any[]) {
  const beatPosition = args[0];
  console.log(`Received beat position: ${beatPosition}`);
  updateBeat(beatPosition);
  populateLyrics(beatPosition);
}

// Function to handle time position updates
function handleTimePosition(args: any[]) {
  const timePosition = args[0];
  console.log(`Received time position: ${timePosition}`);
  // You can update a global variable or call a function to handle time position
  // For now, let's just log it
}

// Function to handle the last region name update
function handleLastRegionName(args: any[]) {
  const regionName = args[0];
  console.log(`Received last region name: ${regionName}`);
  updateActiveRegion(regionName);
}

// Example function to update the active region based on the received region name
function updateActiveRegion(regionName: string) {
  // Call your logic here to update the active region
  console.log(`Updating active region to: ${regionName}`);
}

// Example function to update the beat
function updateBeat(beatPosition: string) {
  console.log(`Updating beat position display to: ${beatPosition}`);
  // Update UI or other logic here
}

// Example function to populate lyrics based on the beat position
function populateLyrics(beatPosition: string) {
  console.log(`Populating lyrics based on beat position: ${beatPosition}`);
  // Your logic for updating lyrics goes here
}
