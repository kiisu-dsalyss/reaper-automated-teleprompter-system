const osc = require('osc');
const readline = require('readline');
const fetch = require('node-fetch');

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

let beatPosition = "";
let timePosition = "";
let tempo = "";
let regionName = "";
let regionColor = "";
let regions: { [key: string]: { Start: number; End: number; Color: string } } = {};

function parseRegionResponse(responseBody: string): { [key: string]: { Start: number; End: number; Color: string } } {
    const lines = responseBody.split('\n');
    const regions: Region[] = [];
    let counter = 1;
    for (let i = 1; i < lines.length - 1; i++) {
        const values = lines[i].split('\t');
        if (values[0] === 'REGION') {
            let regionName = values[1] || '-';
            if (regions.find(region => region.name === regionName)) {
                regionName += ` ${counter++}`;
            }
            regions.push({
                name: regionName,
                start: parseInt(values[3], 10),
                end: parseInt(values[4], 10),
                color: values[5]
            });
        }
    }
    return regions.sort((a, b) => a.start - b.start).reduce((result: { [key: string]: { Start: number; End: number; Color: string } }, region) => {
        if (region.name !== '-') {
            result[region.name] = { Start: region.start, End: region.end, Color: region.color };
        }
        return result;
    }, {} as { [key: string]: { Start: number; End: number; Color: string } });
}

export function startOSCStream() {
    const simpleListener = new osc.UDPPort({ localAddress: "0.0.0.0", localPort: 9000 });

    simpleListener.on("message", (msg: any) => {
        handleOSCMessage(msg);
        updateConsoleDisplay();
    });

    simpleListener.on("error", (err: Error) => console.error("Error: ", err));
    simpleListener.open();
    fetchRegionsData();
}

async function fetchRegionsData() {
    try {
        const response = await fetch("http://192.168.68.59:8080/_/REGION");
        const responseBody = await response.text();
        regions = parseRegionResponse(responseBody);
        console.log("Regions data fetched successfully:", regions);
    } catch (error) {
        console.error("Error fetching regions data:", error);
    }
}

function handleOSCMessage(msg: any) {
    switch (msg.address) {
        case "/beat/str":
            beatPosition = msg.args[0];
            break;
        case "/time":
            timePosition = msg.args[0].toFixed(2);
            break;
        case "/tempo/raw":
            tempo = msg.args[0].toFixed(2);
            break;
        case "/lastregion/name":
            regionName = msg.args[0];
            updateRegionColor(regionName);
            break;
    }
}

function updateRegionColor(regionName: string) {
    regionColor = regions[regionName]?.Color ? decimalToHex(parseInt(regions[regionName].Color, 10)) : "Unknown";
}

function decimalToHex(decimal: number): string {
    return decimal.toString(16).padStart(6, '0').toUpperCase();
}

function updateConsoleDisplay() {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    console.log(`┌──────────────────────────────────────────────┐`);
    console.log(`  OSC Stream Live Update                       `);
    console.log(`├──────────────────────────────────────────────┤`);
    console.log(`  Beat Position: ${beatPosition}                      `);
    console.log(`  Time Position: ${timePosition} sec                  `);
    console.log(`  Tempo: ${tempo} BPM                                 `);
    console.log(`  Last Region: ${regionName}                          `);
    console.log(`  Region Color: #${regionColor}                          `);
    console.log(`└──────────────────────────────────────────────┘`);
}

console.clear();
startOSCStream();
