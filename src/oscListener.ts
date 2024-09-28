import { decimalToHex } from "./decimalToHex";
import { OSCMessage } from "./interfaces/OSCMessage";
import { parseRegionResponse } from "./parseRegionResponse";
import { RegionsData } from "./interfaces/RegionsData";
import readline from 'readline';
import fetch from 'node-fetch';

const osc = require('osc');
const { serverIP, serverPort } = require('./secrets/config.json');

let beatPosition = "";
let timePosition = "";
let tempo = "";
let regionName = "";
let regionColor = "";
let regions: RegionsData = {};

/**
 * Starts the OSC stream listener.
 */
export function startOSCStream(): void {
  const simpleListener = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9000
  });

  simpleListener.on("message", handleOSCMessage);
  simpleListener.on("error", handleError);

  simpleListener.open();
  fetchRegionsData();
}

/**
 * Fetches the regions data from the server.
 */
async function fetchRegionsData(): Promise<void> {
  try {
    const currentURL = `http://${serverIP}:${serverPort}/_/REGION`;
    const response = await fetch(currentURL);
    const responseBody = await response.text();
    regions = parseRegionResponse({ responseBody });
    console.log("Regions data fetched successfully:", regions);
  } catch (error) {
    console.error("Error fetching regions data:", error);
  }
}

/**
 * Handles incoming OSC messages.
 * @param msg - The OSC message.
 */
function handleOSCMessage(msg: OSCMessage): void {
  const handlers: { [key: string]: (args: any[]) => void } = {
    "/beat/str": (args) => beatPosition = args[0],
    "/time": (args) => timePosition = args[0].toFixed(2),
    "/tempo/raw": (args) => tempo = args[0].toFixed(2),
    "/lastregion/name": (args) => {
      regionName = args[0];
      updateRegionColor(regionName);
    }
  };

  if (handlers[msg.address]) {
    handlers[msg.address](msg.args);
    updateConsoleDisplay();
  }
}

/**
 * Handles errors from the OSC listener.
 * @param err - The error object.
 */
function handleError(err: Error): void {
  console.error("Error: ", err);
}

/**
 * Updates the region color based on the region name.
 * @param regionName - The name of the region.
 */
function updateRegionColor(regionName: string): void {
  if (regions[regionName] && regions[regionName].Color) {
    regionColor = decimalToHex({ decimal: parseInt(regions[regionName].Color, 10) });
  } else {
    regionColor = "Unknown";
  }
}

/**
 * Updates the console display with the latest data.
 */
function updateConsoleDisplay(): void {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  const displayData = [
    `┌──────────────────────────────────────────────┐`,
    `  OSC Stream Live Update                       `,
    `├──────────────────────────────────────────────┤`,
    `  Beat Position: ${beatPosition}                      `,
    `  Time Position: ${timePosition} sec                  `,
    `  Tempo: ${tempo} BPM                                 `,
    `  Last Region: ${regionName}                          `,
    `  Region Color: #${regionColor}                          `,
    `└──────────────────────────────────────────────┘`
  ];
  console.log(displayData.join('\n'));
}



console.clear();
startOSCStream();
