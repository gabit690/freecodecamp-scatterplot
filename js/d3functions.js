const createScaleLinear = (domain = [], range = []) => {
    return d3.scaleLinear()
             .domain(domain)
             .range(range);
}

const createCartesianAxis = (axisType = "x", axisScale) => {
    let formatMinutes = function(d) { 
        let minutes = Math.floor((d  / 60)),
            seconds = d - (minutes * 60);
        let output = ((minutes < 10) ? "0" + minutes: minutes) + ':' + ((seconds < 10) ? "0" + seconds: seconds);
        return output;
    };
    
    if (/^[xy]$/i.test(axisType)) {
        return (axisType === "x") ? 
                    d3.axisBottom(axisScale).tickFormat(d3.format(""))
                    :
                    d3.axisLeft(axisScale).tickFormat(formatMinutes);
    }
}

const applyCartesianAxis = (d3Element = {}, type = "x", cartesianAxis = null) => {
    if (cartesianAxis != null && /[xy]/i.test(type)) {
        let padding = d3Element.attr("width") / 15;
        let height = d3Element.attr("height");
        let axis = d3Element.append("g");
        axis.attr("id", (type == "x") ? "x-axis" : "y-axis");
        if (type == "x") {
            axis.attr("transform", "translate(0, " + (height - padding) + ")");
        } else if (type == "y") {
            axis.attr("transform", "translate(" + padding  + ", 0)")
        }
        axis.call(cartesianAxis);
    }
}

const getSeconds = (stringMinutes = "") => {
    let seconds = 0;
    if (/^(\d\d):(\d\d)$/.test(stringMinutes)) {
        seconds = (Number(stringMinutes.slice(0,2)) * 60) + Number(stringMinutes.slice(3,5));
    }
    return seconds;
}

const getCartesianDomain = (axisType = "x", dataset = []) => {
    const domainResult = [0, 0];
    if (/^[xy]$/i.test(axisType)) {
        switch (axisType) {
            case "x":
                domainResult[0] = d3.min(dataset, (d) => d["Year"]);
                domainResult[1] = d3.max(dataset, (d) => d["Year"]);
                break;
            case "y":
                domainResult[0] = d3.min(dataset, (d) => getSeconds(d["Time"]));
                domainResult[1] = d3.max(dataset, (d) => getSeconds(d["Time"]));
                break;
        }
    }
    return domainResult;
}

const renderAxis = (container = {}, xScale = {}, yScale = {}) => {
    const xAxis = createCartesianAxis("x", xScale);
    applyCartesianAxis(container, "x", xAxis);
    const yAxis = createCartesianAxis("y", yScale);
 
    applyCartesianAxis(container, "y", yAxis);
}

const renderDots = (container = {}, dataset = [], xScale = {}, yScale = {}) => {
        // bind data with Dots
        const WIDTH = container.attr("width");
        const HEIGHT = container.attr("height");
        console.log("Width: " + WIDTH);
        console.log("height: " + HEIGHT);
        let dotWidth = 7;

        container.selectAll("circle")
                 .data(dataset)
                 .enter()
                 .append("circle")
                 .attr("class", "dot")
                 .attr("cx", (d, i) => xScale((d["Year"])))
                 .attr("cy", (d, i) => yScale(getSeconds(d["Time"])))
                 .attr("r", dotWidth)
                 .attr("data-xvalue", (d, i) => d["Year"])
                 .attr("data-yvalue", (d, i) => new Date(d["Year"]  + " 00:" + d["Time"]));
                //  .attr("width", dotWidth)
                //  .attr("height", (d, i) => (HEIGHT - PADDING) - (yScale(d[1])));
}

const renderTooltip = (container = "body") => {
    // tooltip
    d3.select(container)
      .append("div")
      .attr("id", "tooltip");

    const tooltip = document.getElementById("tooltip");

    const bars = document.getElementsByTagName("rect");

    bars.forEach(bar => {
        bar.addEventListener("mouseover", () => {
            tooltip.style.display = "block";
            let date = bar.getAttribute("data-date");
            let amount = bar.getAttribute("data-gdp");
            tooltip.setAttribute("data-date", date);
            tooltip.innerHTML = `<p>${date}</p><br><p>$${amount} Billion</p>`;
        });
        bar.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
        });
    });
}

export default {
    // PUBLIC FUNCTIONS
    existsElement: (elementName = "") => {
        return d3.select(elementName)["_groups"][0][0] != null;
    },
    createElement: (parentName = "body", elementName = "") => {     
        return d3.select(parentName).append(elementName);
    },
    renderElement: (d3Element = {}, elementName = "") => { 
        return d3Element.append(elementName);
    },
    setTextContent: (d3Element = null, text = "TITLE") => {
        d3Element.text(text);
    },
    setAttributes: (d3Element, attributes = {}) => {
        const elementProperties = Object.keys(d3Element).length;
        const attributesProperties = Object.keys(attributes).length;
        if (elementProperties > 0 && attributesProperties > 0) {
            const keys = (Object.keys(attributes)).map(key => key.replace(/_/g, "-"));
            keys.forEach((key, index) => {
                d3Element.attr(keys[index], attributes[key.replace(/-/g, "_")]);
            });
        }
    },
    setStyles: (d3Element = {}, styles = {}) => {
        const elementProperties = Object.keys(d3Element).length;
        const stylesProperties = Object.keys(styles).length;
        if (elementProperties > 0 && stylesProperties > 0) {
            const keys = (Object.keys(styles)).map(key => key.replace(/_/g, "-"));
            keys.forEach((key, index) => {
                d3Element.style(keys[index], styles[key.replace(/-/g, "_")]);
            });
        }
    },
    renderScartterplot: (svgElement = {}, dataset = []) => {

        // Axis
        const WIDTH = svgElement.attr("width");
        const HEIGHT = svgElement.attr("height");
        const PADDING = WIDTH / 15;
        let xDomain = getCartesianDomain("x", dataset);
        xDomain[0] -= 1;
        xDomain[1] += 1;
        const xScale = createScaleLinear(xDomain, [PADDING, WIDTH - PADDING]);
        let yDomain = getCartesianDomain("y", dataset);
        const yScale = createScaleLinear(yDomain, [PADDING, HEIGHT - PADDING]);
     
        renderAxis(svgElement, xScale, yScale);
        
        // Bind Data
        renderDots(svgElement, dataset, xScale, yScale);

        svgElement.append("text")
                  .attr("id", "legend")
                  .attr("x", -300)
                  .attr("y", 13)
                  .style("transform", "rotate(-90deg)")
                  .text("Time in minutes");
        // tooltip
        // renderTooltip("main");
    }
};