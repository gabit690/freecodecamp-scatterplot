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
        let padding = d3Element.attr("width") / 20;
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

const renderBars = (container = {}, dataset = [], xScale = {}, yScale = {}) => {
        // bind data with bars
        const width = container.attr("width");
        const height = container.attr("height");
        const padding = width / 20;
        let firstYear = parseInt(dataset[0][0]);
        let secondYear = firstYear + 1;
        let barWidth = (xScale(secondYear) - xScale(firstYear)) / 4;
        container.selectAll("rect")
                 .data(dataset)
                 .enter()
                 .append("rect")
                 .attr("class", "bar")
                 .attr("x", (d, i) => padding + (i * barWidth))
                 .attr("y", (d, i) => yScale(d[1]))
                 .attr("data-date", (d, i) => d[0])
                 .attr("data-gdp", (d, i) => d[1])
                 .attr("width", barWidth)
                 .attr("height", (d, i) => (height - padding) - (yScale(d[1])));
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
        const PADDING = WIDTH / 20;
        let xDomain = getCartesianDomain("x", dataset);
        xDomain[0] -= 1;
        xDomain[1] += 1;
        const xScale = createScaleLinear(xDomain, [PADDING, WIDTH - PADDING]);
        let yDomain = getCartesianDomain("y", dataset);
        // yDomain[1] += 120;
        const yScale = createScaleLinear(yDomain, [PADDING, HEIGHT - PADDING]);
        yScale.ticks(0, 100, 10);
        renderAxis(svgElement, xScale, yScale);
        
        // Bind Data
        // renderBars(svgElement, dataset, xScale, yScale);

        // tooltip
        // renderTooltip("main");
    }
};