var public_spreadsheet_url = "https://docs.google.com/spreadsheet/pub?key=0Aq7nL59nLsCMdDJxZUo4cFZaWGF5d0pSZU9XSE44NVE&output=html";

var set_class = function(state, map, css_class) {
    var svg = jQuery('#' + map + ' .' + state);
    svg.attr('class').baseVal = state + ' ' + css_class;
}

//make table header row with SVG maps
var set_map_classes = function(data) {
    for (i = 0; i < data.length; i++) {
        var state = data[i];
        if (!state.postal) {
            continue;
        }
        var svg = jQuery('#' + 'penalties_map' + ' .' + state.postal);
        if ( svg && svg.attr('class') && svg.attr('class').baseVal ) {
            set_class(state.postal, 'ballotMap', data[i].ballot_class);
            set_class(state.postal, 'courtMap', data[i].court_class);
            set_class(state.postal, 'legislatureMap', data[i].legislature_class);
        } else {
            console.log(state.postal);
            setTimeout(set_map_classes(data), 2000);
            break;
            return;
        }
    }
}

//make table cells with laws
var makeTable = function(data) {

//write a Dust.js template for data table
    var tableBody = '{#allStates}\
                        {! write conditional statement to add law labels every 10 rows !}\
                        {@if cond="( {$idx} == 10 || {$idx} == 20 || {$idx} == 30 || {$idx} == 40 )"}\
                            <tr class="mid_labels">\
                                <th> </th>\
                                <th>Ballot initiative</th>\
                                <th>Court decision</th>\
                                <th>Legislative action</th>\
                            </tr>\
                        {/if}\
                        <tr id={postal}_row>\
                            <th id=state_name>\
                                {state}\
                            </th>\
                            {#allLawTypes state=state}\
                                {#getLawDetails law=name state=state}\
                                {/getLawDetails}\
                            {/allLawTypes}\
                        </tr>\
                    {/allStates}';

    //compile above Dust template
    var compiledTableBody = dust.compile(tableBody, "tableRow");
    dust.loadSource(compiledTableBody);

    //grab Data
    var renderableData = {

        //write Dust.js helper to check if there's a 'yes' under each lawType, and if so return the details
        getLawDetails: function(chunk, context, bodies, params){
            var state = _.find(data, function(row) { 
                //return the first row where the state name of the row is the same as the param that we passed in for state
                return(row.state === params.state);
            });
            if (state[params.law]) return chunk.write('<th class="' + params.law + '"><p>' + state.details + '</p></th>');
            return chunk.write('<th><span class="inline_label">Not at the moment</span></th>');
        },

        //load state law data
        allStates: data,
        allLawTypes: [
            { name: "ballot" },
            { name: "court" },
            { name: "legislature" }
        ]
    };

    //render dust template as HTML
    dust.render("tableRow", renderableData, function(err, out) {
        //add dust template output into table as jQuery html
        $('#mapTable').append($(out));
    });

//build state drop down menu with Dust template
    var select = '<select>\
                    <option value=""> Jump to a state:</option>\
                    {#allStates}\
                        <option value="{postal}">\
                            {state}\
                        </option>\
                    {/allStates}\
                 </select>';

    //compile drop down menu Dust template
    var compiledSelect = dust.compile(select, "select");
    dust.loadSource(compiledSelect);

    //render dust template drop down as HTML
    dust.render("select", renderableData, function(err, out) {
        //add dust template output into select tag as jQuery html
        var selectEl = $(out);
        $('#jump_to_state').append(selectEl);
        selectEl.change(function() {
            window.location.hash = select.val() + '_row';
            return false;
        });
    });

    set_map_classes(data);

}

//REQUIRE A CALL BEFORE TABLETOP INIT STARTS
Tabletop.init( { 
    proxy : 'https://s3.amazonaws.com/mj-tabletop-proxy',
    key: public_spreadsheet_url, callback: makeTable, simpleSheet: true,
} )
