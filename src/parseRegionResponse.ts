import { Region } from "./interfaces/Region";
import { RegionsData } from "./interfaces/RegionsData";

// Function to parse the region response
export function parseRegionResponse({ responseBody }: { responseBody: string; }): RegionsData {
  const regions: Region[] = responseBody.split('\n')
    .slice(1, -1)
    .map(line => line.split('\t'))
    .filter(values => values[0] === 'REGION')
    .map((values, index, arr) => {
      let regionName = values[1] || '-';
      if (arr.slice(0, index).some(region => region[1] === regionName)) {
        regionName += ` ${index + 1}`;
      }
      return {
        name: regionName,
        start: parseInt(values[3], 10),
        end: parseInt(values[4], 10),
        color: values[5]
      };
    });

  return regions
    .sort((a, b) => a.start - b.start)
    .reduce((result: RegionsData, { name, start, end, color }) => {
      if (name !== '-') {
        result[name] = { Start: start, End: end, Color: color };
      }
      return result;
    }, {});
}
