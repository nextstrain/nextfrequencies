import queryString from "query-string";
import { makeColourScale } from "./colours";




export const makeProps = (DATA) => {

  const grouping = getGroupingFromURL(DATA.traits)
  console.log("grouping", grouping)
  const matrix = getFrequenciesFor(DATA, grouping);

  return {
    nodes: [{tipCount: "TODO - tipCount", fullTipCount: "TODO - fullTipCount"}],
    normalizeFrequencies: false,
    width: window.innerWidth-50,
    height: 600,
    matrix,
    colorBy: grouping.join("+"),
    colorScale: {legendValues: [], scale: makeColourScale(Object.keys(matrix)), continuous: false},
    colorOptions: undefined,
    pivots: DATA.pivots,
    projection_pivot: null,
    version: 1,
    data: false,
  }
}


function getFrequenciesFor(DATA, names) {
  const indicies = names.map((name) => DATA.traits.indexOf(name))
  console.log("getFrequenciesFor", names, indicies);
  const summedFrequencies = {};
  

  DATA.samples.forEach((sample, sampleIdx) => {
    const haplotype = indicies.map((idx) => sample[idx]).join("+");
    // console.log(sampleIdx, sample, haplotype);
    if (!Object.keys(summedFrequencies).includes(haplotype)) {
      summedFrequencies[haplotype] = DATA.pivots.map(() => 0);
    }
    const frequency = DATA["frequencies"][sampleIdx];
    frequency.forEach((fraction, pivotIdx) => {
      summedFrequencies[haplotype][pivotIdx] += fraction;
    });
  })

  return summedFrequencies
}


function getGroupingFromURL(available) {
  console.log("AA", queryString.parse(window.location.search).group)
  let groups = queryString.parse(window.location.search).group;
  if (!Array.isArray(groups)) groups = [groups];
  console.log(groups)
  groups = groups.filter((g) => {
    if (!available.includes(g)) {
      console.log(`WARNING - ignoring group ${g} as it's not in ${available.join(", ")}.`)
      return false;
    }
    return true;
  })
  if (groups.length===0) return ["clade"]; // DEFAULT
  return groups;
}