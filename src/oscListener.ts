const osc = require('osc'); // CommonJS module import for osc
const readline = require('readline');
const fetch = require('node-fetch'); // CommonJS import
const { serverIP } = require('./secrets/config.json'); // Import the server IP from config

interface OSCMessage {
  address: string;
  args: any[];
  timestamp: Date;
}

interface Region {
  name: string;
  start: number;
  end: number;
  color: string;
}

interface RegionsData {
  [key: string]: { Start: number; End: number; Color: string };
}

let beatPosition: string = "";
let timePosition: string = "";
let tempo: string = "";
let regionName: string = "";
let regionColor: string = ""; // Variable for region color
let regions: RegionsData = {}; // Stores the region data

// Function to parse the region response
function parseRegionResponse(responseBody: string): RegionsData {
  const lines = responseBody.split('\n');
  const regions: Region[] = [];
  let counter = 1;
  for (let i = 1; i < lines.length - 1; i++) {
    const values = lines[i].split('\t');
    if (values[0] === 'REGION') {
      let regionName = values[1] || '-';
      if (regions.find(region => region.name === regionName)) {
        regionName += ` ${counter}`;
        counter++;
      }
      regions.push({
        name: regionName,
        start: parseInt(values[3], 10),
        end: parseInt(values[4], 10),
        color: values[5]
      });
    }
  }
  regions.sort((a, b) => a.start - b.start);
  const result: RegionsData = regions.reduce((result: RegionsData, region) => {
    if (region.name !== '-') {
      result[region.name] = {
        Start: region.start,
        End: region.end,
        Color: region.color
      };
    }
    return result;
  }, {});
  return result;
}

// Function to start listening for specific OSC messages and process them as they arrive
export function startOSCStream(): void {
  const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
  });

  // Handle incoming OSC messages as they arrive
  simpleListener.on("message", (msg: OSCMessage) => {
    handleOSCMessage(msg);
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
    const currentURL = `http://${serverIP}:8080/_/REGION`; // Use server IP from config
    const response = await fetch(currentURL);
    const responseBody = await response.text(); // Assuming the response is a text format
    regions = parseRegionResponse(responseBody); // Parse the region response
    console.log("Regions data fetched successfully:", regions);
  } catch (error) {
    console.error("Error fetching regions data:", error);
  }
}

// Function to handle each OSC message as it arrives
function handleOSCMessage(msg: OSCMessage): void {
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
      updateRegionColor(regionName); // Update region color based on region name
      break;
    default:
      // Unhandled messages can be logged for debugging if necessary
      // console.log("Unhandled message address: ", msg.address);
  }
}

// Function to update region color based on the region name
function updateRegionColor(regionName: string): void {
  if (regions[regionName] && regions[regionName].Color) {
    regionColor = decimalToHex(parseInt(regions[regionName].Color, 10));
  } else {
    regionColor = "Unknown";
  }
}

// Function to convert decimal to hex
function decimalToHex(decimal: number): string {
  let hex = decimal.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return hex.toUpperCase(); // Ensure it's uppercase
}

// Function to update the console display without scrolling
function updateConsoleDisplay(): void {
  readline.cursorTo(process.stdout, 0, 0); // Move cursor to the top left
  readline.clearScreenDown(process.stdout); // Clear the screen from the cursor down
  console.log(`┌──────────────────────────────────────────────┐`);
  console.log(`  OSC Stream Live Update                       `);
  console.log(`├──────────────────────────────────────────────┤`);
  console.log(`  Beat Position: ${beatPosition}                      `);
  console.log(`  Time Position: ${timePosition} sec                  `);
  console.log(`  Tempo: ${tempo} BPM                                 `);
  console.log(`  Last Region: ${regionName}                          `);
  console.log(`  Region Color: #${regionColor}                          `); // Display the region color in hex
  console.log(`└──────────────────────────────────────────────┘`);
}

// Clear the terminal and start listening
console.clear();
startOSCStream();
