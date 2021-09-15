import d3functions from "./d3functions.js";

document.addEventListener('DOMContentLoaded', () => {
    // main scrips

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
    
    d3functions.setTextContent(title);

    // Get Data
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    fetch(url).then(response => response.json())
              .then(data => console.log(data));
});