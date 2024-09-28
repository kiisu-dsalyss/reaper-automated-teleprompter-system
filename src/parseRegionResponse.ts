import { Region } from "./interfaces/Region";
import { RegionsData } from "./interfaces/RegionsData";

// Function to parse the region response
export function parseRegionResponse({ responseBody }: { responseBody: string; }): RegionsData {
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
