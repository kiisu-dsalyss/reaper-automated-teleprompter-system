import { decimalToHex } from "./decimalToHex";
import { OSCMessage } from "./interfaces/OSCMessage";
import { parseRegionResponse } from "./parseRegionResponse";
import { RegionsData } from "./interfaces/RegionsData";
import readline from 'readline';
import fetch from 'node-fetch'; // CommonJS import

const osc = require('osc'); // CommonJS module import for osc
const { serverIP, serverPort } = require('./secrets/config.json'); // Import the server IP from config

let beatPosition: string = "";
let timePosition: string = "";
let tempo: string = "";
let regionName: string = "";
let regionColor: string = ""; // Variable for region color
let regions: RegionsData = {}; // Stores the region data

// Function to start listening for specific OSC messages and process them as they arrive
export function startOSCStream(): void {
  const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
  });

  // Handle incoming OSC messages as they arrive
  simpleListener.on("message", (msg: OSCMessage) => {
    handleOSCMessage({ msg });
    updateConsoleDisplay();
  });

  simpleListener.on("error", (err: Error) => {
    console.error("Error: ", err);
  });

  simpleListener.open();
  fetchRegionsData(); // Fetch initial regions data
}

// Function to fetch region data from the server
async function fetchRegionsData(): Promise<void> {
  try {
    const currentURL = `http://${serverIP}:${serverPort}/_/REGION`; // Use server IP from config
    const response = await fetch(currentURL);
    const responseBody = await response.text(); // Assuming the response is a text format
    regions = parseRegionResponse({ responseBody }); // Parse the region response
    console.log("Regions data fetched successfully:", regions);
  } catch (error) {
    console.error("Error fetching regions data:", error);
  }
}

// Function to handle each OSC message as it arrives
function handleOSCMessage({ msg }: { msg: OSCMessage; }): void {
  const handlers: { [key: string]: (args: any[]) => void } = {
    "/beat/str": (args) => beatPosition = args[0],
    "/time": (args) => timePosition = args[0].toFixed(2), // format time with 2 decimal places
    "/tempo/raw": (args) => tempo = args[0].toFixed(2), // format tempo with 2 decimal places
    "/lastregion/name": (args) => {
      regionName = args[0];
      updateRegionColor({ regionName }); // Update region color based on region name
    }
  };

  if (handlers[msg.address]) {
    handlers[msg.address](msg.args);
  } else {
    // Unhandled messages can be logged for debugging if necessary
    // console.log("Unhandled message address: ", msg.address);
  }
}

// Function to update region color based on the region name
function updateRegionColor({ regionName }: { regionName: string; }): void {
  if (regions[regionName] && regions[regionName].Color) {
    regionColor = decimalToHex({ decimal: parseInt(regions[regionName].Color, 10) });
  } else {
    regionColor = "Unknown";
  }
}

// Function to update the console display without scrolling
function updateConsoleDisplay(): void {
  readline.cursorTo(process.stdout, 0, 0); // Move cursor to the top left
  readline.clearScreenDown(process.stdout); // Clear the screen from the cursor down
  const displayData = [
    `┌──────────────────────────────────────────────┐`,
    `  OSC Stream Live Update                       `,
    `├──────────────────────────────────────────────┤`,
    `  Beat Position: ${beatPosition}                      `,
    `  Time Position: ${timePosition} sec                  `,
    `  Tempo: ${tempo} BPM                                 `,
    `  Last Region: ${regionName}                          `,
    `  Region Color: #${regionColor}                          `, // Display the region color in hex
    `└──────────────────────────────────────────────┘`
  ];
  console.log(displayData.join('\n'));
}

// Clear the terminal and start listening
console.clear();
startOSCStream();
