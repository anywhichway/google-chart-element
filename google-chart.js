class GoogleChart extends HTMLElement {
    constructor() {
        super();
        let script = document.querySelector('script[type="module"][src="https://www.gstatic.com/charts/loader.js"]');
        if(script) {
            this.googleLoaded = Promise.resolve();
        } else {
            script = document.createElement('script');
            script.src = 'https://www.gstatic.com/charts/loader.js';
            this.googleLoaded = new Promise(resolve => script.onload = resolve);
            document.head.append(script);
        }
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            </style>
        <div id="chart"></div>`
    }
    connectedCallback() {
        this.googleLoaded.then(() => {
            const config = JSON.parse(this.innerHTML),
                pckg  = config.package || this.getAttribute('package') || 'corechart';
            google.charts.load('current', {
                    packages:[pckg],
                    callback: () => this.drawChart(config)
            });
        });
    }
    async drawChart({type,title,legend,annotations,width,height,hAxis,vAxis,cols,rows,data}) {
        // set defaults
        type ||= this.getAttribute('type');
        title ||= this.getAttribute('title');
        legend ||= this.getAttribute('legend') || "none";
        rows ||= data;
        const rect = this.getBoundingClientRect();
        width ||= rect.width;
        height ||= rect.height || 250;
        cols = cols.map((col,i) => {
            if(typeof col === 'string') return {id: col.toLowerCase(),label: col, type: typeof(data[0][i])};
            if(!col.type) col.type = typeof(data[0][i]);
            col.label ||= col.id;
            if(!col.id && col.label) col.id = col.label.toLowerCase();
            return col;
        })
        rows = rows.map((row) => {
            if(Array.isArray(row)) return {c: row.map((v) => ({v}))};
            return row;
        })
        // Create the data table.
        const table = new google.visualization.DataTable({cols,rows});
        // Set chart options
        const options = {
            title,
            legend: typeof legend === "string" ? {position: legend} : legend,
            width,
            height,
            hAxis,
            vAxis
        };
        if(annotations) options.annotations = annotations;
        // Instantiate and draw our chart, passing in some options.
        const chart = new google.visualization[type](this.shadowRoot.getElementById('chart'));
        chart.draw(table, options);
    }
}
customElements.define('google-chart', GoogleChart);