// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = Math.max(MAX_WIDTH / 2.5, 540), graph_1_height = 250;
let graph_2_width = MAX_WIDTH / 2, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 350;

var graph1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width+margin.left+margin.right)
    .attr("height", graph_1_height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", `translate(${2*margin.left}, ${1.5*margin.top})`);

d3.csv("data/video_games.csv").then(function(data) {
    var data1 = cleanData1(data, function(a,b){
        return parseFloat(b['Global_Sales']) - parseFloat(a['Global_Sales'])
    }, 10);

    var x1 = d3.scaleLinear()
        .domain([0,d3.max(data1, function(d){
            return d['Global_Sales']
        })])
        .range([0,graph_1_width - margin.left - margin.right]);

    graph1.append("g")
        .attr("transform", `translate(0, ${graph_1_height-margin.top-margin.bottom})`)
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .attr("transform", `translate(-10,0)rotate(-45)`)
        .style("text-anchor", "end")

    var y1 = d3.scaleBand()
        .domain(data1.map(function(d) {return d['Name']}))
        .range([0,graph_1_height - margin.top - margin.bottom])
        .padding(1)

    graph1.append("g")
        .call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

    graph1.selectAll("myline")
        .data(data1)
        .enter()
        .append("line")
        .attr("x1", x1(0))
        .attr("x2", x1(0))
        .attr("y1", function(d) { return y1(d['Name']) })
        .attr("y2", function(d) { return y1(d['Name']) })
        .attr("stroke", "grey");

    graph1.selectAll("mycircle")
        .data(data1)
        .enter()
        .append("circle")
        .attr("cx", x1(0))
        .attr("cy", function(d) { return y1(d['Name']) })
        .attr("r", "5")
        .style("fill", "#69b3a2")
        .attr("stroke", "black");

    graph1.selectAll("circle")
        .transition()
        .duration(2000)
        .attr("cx", function(d) {return x1(parseFloat(d['Global_Sales']))});

    graph1.selectAll("line")
        .transition()
        .duration(2000)
        .attr("x1", function(d){return x1(parseFloat(d['Global_Sales']))})


    // x-axis label
    graph1.append("text")
        .attr("transform", `translate(${margin.left}, ${graph_1_height-margin.bottom})`)
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .text("Global Sales (millions)");

    // y-axis label
    graph1.append("text")
        .attr("transform", `translate(${-margin.left}, ${graph_1_height/3})`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .text("Name")
        .style("font-size", 12)

    // chart title
    graph1.append("text")
        .attr("transform", `translate(${margin.left}, ${-margin.top/2})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .style("font-weight", "bold")
        .text("Top 10 Video Games of All Time");    
});

var graph2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width+margin.left+margin.right)
    .attr("height", graph_2_height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", `translate(${2*margin.left}, ${1.5*margin.top})`);

var title2 = graph2.append("text")
    .attr("transform", `translate(${margin.left/1.5}, ${-margin.top/2})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)

var color = d3.scaleOrdinal()
    .domain(['Action', 'Adventure', 'Fighting', 'Misc', 'Platform', 'Puzzle', 'Racing', 'Role-Playing', 'Shooter', 'Simulation', 'Sports', 'Strategy'])
    .range(d3.schemeDark2)

var radius = Math.min(graph_2_width, graph_2_height) / 2

var tooltip = d3.select("#graph2")
    .append('div')
    .attr('class', 'tooltip')

tooltip.append('div')
    .attr('class', 'genre')

tooltip.append('div')
    .attr('class', 'sales')

tooltip.append('div')
    .attr('class', 'percent')

function setData2(display, attr) {
    d3.csv("data/video_games.csv").then(function(data) {

        var data2 = cleanData2(data, attr);

        var pie = d3.pie()
            .value(function(d) {return d.value;})
            .sort(function(a,b) {return d3.ascending(a.key, b.key);})
        
        var data_ready = pie(d3.entries(data2))

        var u = graph2.selectAll("path")
            .data(data_ready)
        var total = d3.sum(data_ready, d => d.data.value)

        u
            .enter()
            .append('path')
            .merge(u)
            .attr("transform", `translate(${margin.left/1.5}, ${3.5*margin.top})`)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
                .innerRadius(radius-65)
                .outerRadius(radius))
            .attr('fill', function(d) {return (color(d.data.key))})
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .style('opacity', 1)

        
        u.on('mouseover', function(d) {
                var percent = (d.data.value / total * 100).toFixed(2)
                console.log("mouseover event triggered")
                tooltip.select('.genre').html(d.data.key)
                tooltip.select('.sales').html(`Sales: ${d.data.value.toFixed(2)}M`)
                tooltip.select('.percent').html(`Percent: ${percent}%`)
                tooltip.style('display', 'block')
                tooltip.style('opacity', 2)
            })
            .on('mousemove', function(d) {
                tooltip.style('top', (d3.event.layerY+340) + 'px')
                .style('left', (d3.event.layerX+195) + 'px');
            })
            .on('mouseout', function() {
                console.log("mouseout event triggered")
                tooltip.style('display', 'none')
            })

        var legendRectSize = 18;
        var legendSpacing = 4;
        var legend = graph2.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              var height = legendRectSize + legendSpacing;
              var horz = 320;
              var vert = i * height;
              return `translate(${horz}, ${vert})`;
            });

          legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)                                   
            .style('fill', color)
            .style('stroke', color);
            
          legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) { return d; });
        
        // chart title
        title2.text(`Genre Sales Break-down in ${display}`);
    });
}

var graph3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width+margin.left+margin.right)
    .attr("height", graph_3_height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", `translate(${2*margin.left}, ${1.5*margin.top})`);

var title3 = graph3.append("text")
    .attr("transform", `translate(${margin.left}, ${-margin.top/2})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)

var x3 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

var y3 = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom])
    .padding(0.5);

var x_axis = graph3.append("g")
    .attr("transform", `translate(0, ${graph_3_height-margin.top-margin.bottom})`)

var y_axis_label = graph3.append("g");

function setData3(genre) {
    d3.csv("data/video_games.csv").then(function(data) {
        var data3 = cleanData3(data, genre);

        x3.domain([0,d3.max(data3, function(d){ return d[1] })])
        
        x_axis.transition()
            .duration(1000)
            .call(d3.axisBottom(x3))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        y3.domain(data3.map(function(d) {return d[0]}))

        y_axis_label.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

        var bars = graph3.selectAll("rect")
            .data(data3)
        
        bars
            .enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", x3(0))
            .attr("y", function(d) { return y3(d[0]) })
            .attr("width", function(d) { return x3(d[1]) })
            .attr("height", y3.bandwidth())

        graph3.append("text")
            .attr("transform", `translate(${margin.left}, ${graph_3_height-margin.bottom})`)
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .text("Global Sales (millions)");

        graph3.append("text")
            .attr("transform", `translate(${-margin.left*1.3}, ${graph_3_height/2.5})`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier
            .style("text-anchor", "middle")
            .text("Name")
            .style("font-size", 12)

        title3.text(`Top Publishers for ${genre} Games`);
    })
}

function cleanData1(data, comparator, numExamples) {
    data.sort(comparator)
    return data.slice(0, numExamples)
}

function cleanData2(data, region) {
    let genre_map = {}
    for (let i = 0; i < data.length; i++) {
        if (genre_map.hasOwnProperty(data[i]['Genre'])) {
            genre_map[data[i]['Genre']] += parseFloat(data[i][region])
        } else {
            genre_map = {...genre_map, [data[i]['Genre']]: parseFloat(data[i][region])}
        }
    }
    return genre_map
}


function cleanData3(data, genre) {
    data = data.filter(function(d) {
        return d['Genre'] == genre
    })
    let publisher_map = {}
    for (let i = 0; i < data.length; i++) {
        if (publisher_map.hasOwnProperty(data[i]['Publisher'])) {
            publisher_map[data[i]['Publisher']] += parseFloat(data[i]['Global_Sales'])
        } else {
            publisher_map = {...publisher_map, [data[i]['Publisher']]: parseFloat(data[i]['Global_Sales'])}
        }
    }
    var sorted_publishers = []
    for (var p in publisher_map) {
        sorted_publishers.push([p, publisher_map[p]])
    }
    sorted_publishers.sort(function(a,b){
        return b[1] - a[1]
    })
    return sorted_publishers.slice(0, 10)
}


setData2('the Globe', "Global_Sales")
setData2('the Globe', "Global_Sales")
setData3('Action')