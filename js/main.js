import d3functions from "./d3functions.js";

document.addEventListener('DOMContentLoaded', () => {
    // main scrips

    // Graph container
    const graphContainer = d3functions.createElement("main", "div");

    d3functions.setAttributes(graphContainer, {
        class: "container"
    });

    d3functions.setStyles(graphContainer, {
        
    });

    const title = d3functions.renderElement(graphContainer, "h2");

    d3functions.setAttributes(graphContainer, {
        id: "title"
    });
    
    d3functions.setTextContent(title, "doping in professional bicycle racing");

    // Svg element

    const svg = d3functions.renderElement(graphContainer, "svg");

    d3functions.setAttributes(svg, {
        width: 800,
        height: 600
    });

    d3functions.setStyles(svg, {
        display: "block",
        margin: "auto"
    });

    // Get Data
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    fetch(url).then(response => response.json())
              .then(data => {
                  console.log(data);
                  d3functions.renderScartterplot(svg, data);
                });
});