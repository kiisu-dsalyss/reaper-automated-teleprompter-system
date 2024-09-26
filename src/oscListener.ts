const osc = require('osc');
const readline = require('readline');

interface OSCMessage {
  address: string;
  args: any[];
  timestamp: Date;
}

let beatPosition = "";
let timePosition = "";
let tempo = "";
let regionName = "";

// Function to start listening for specific OSC messages and process them as they arrive
export function startOSCStream() {
  const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
  });

  // Handle incoming OSC messages as they arrive
  simpleListener.on("message", (msg: any) => {
    handleOSCMessage(msg);
    updateConsoleDisplay();
  });

  simpleListener.on("error", (err: Error) => {
    console.error("Error: ", err);
  });

  simpleListener.open();
}

// Function to handle each OSC message as it arrives
function handleOSCMessage(msg: any) {
  switch (msg.address) {
    case "/beat/str":
      beatPosition = msg.args[0];
      break;
    case "/time":
      timePosition = msg.args[0].toFixed(2); // format time with 2 decimal places
      break;
    case "/tempo/raw":
      tempo = msg.args[0].toFixed(2); // format tempo with 2 decimal places
      break;
    case "/lastregion/name":
      regionName = msg.args[0];
      break;
    default:
      // Unhandled messages can be logged for debugging if necessary
      // console.log("Unhandled message address: ", msg.address);
  }
}

// Function to update the console display without scrolling
function updateConsoleDisplay() {
    readline.cursorTo(process.stdout, 0, 0); // Move cursor to the top left
    readline.clearScreenDown(process.stdout); // Clear the screen from the cursor down
    console.log(`┌──────────────────────────────────────────────┐`);
    console.log(`  OSC Stream Live Update                       `);
    console.log(`├──────────────────────────────────────────────┤`);
    console.log(`  Beat Position: ${beatPosition}                      `);
    console.log(`  Time Position: ${timePosition} sec                  `);
    console.log(`  Tempo: ${tempo} BPM                                 `);
    console.log(`  Last Region: ${regionName}                          `);
    console.log(`└──────────────────────────────────────────────┘`);
}

// Clear the terminal and start listening
console.clear();
startOSCStream();
