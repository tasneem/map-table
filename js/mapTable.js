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

    //load Dust.js template
    var template = '{#allStates}\
                        {usstate=.}\
                        <tr>\
                            {#allLawTypes lawType=.}\
                                <td>{name}\
                                    {#isXinY x=name y=.}\
                                        {usstate.details}\
                                    {/isXinY}\
                                </td>\
                            {/allLawTypes}\
                        </tr>\
                    {/allStates}';

    var compiledTemplate = dust.compile(template, "tableRow");
    dust.loadSource(compiledTemplate);

    var renderableData = {
        //write Dust.js helper to check if there's a 'yes' under each lawType
        isXinY: function(chunk, context, bodies, params){
            if (params.x[params.y]) return chunk.write(params.y.details);
            console.log(params.x, params.y);
        },
        //load state law data
        allStates: data,
        allLawTypes: [
            { name: "ballot" },
            { name: "court" },
            { name: "legislature" }
        ]
    };

    dust.render("tableRow", renderableData, function(err, out) {
      console.log(out, err)
      //ul.append($(out));
    });

    var table = jQuery('#mapTable');
    var select = jQuery('#jump_to_state select');
    var empty_text = '<span class="inline_label">Not at the moment</span>';
    select.change(function() {
        window.location.hash = select.val() + '_row';
        return false;
    });

    for (i = 0; i < data.length; i++) {
        if (i === 10 || i === 20 || i === 30 || i === 40) {
            table.append(jQuery(' <tr class="mid_labels"> <th> </th> <th> Ballot initiative </th> <th> Court decision </th> <th> Legislature </th> </tr> '));
        };
        var state = data[i];
        var tr = jQuery('<tr id="' + state.postal + '_row"></tr>');
        select.append('<option value="' + state.postal + '">' + state.state + '</option>');

        //add state name
        tr.append(
                '<th class="state_name">' +
                    state.state +
                '</th>'
        );

        //add map view 1 aka legalization/bans ballot measure
        data[i].ballot_class = 'none';
        if (state.ballot === 'yes') {
            data[i].ballot_class = 'ballot';
        }

        tr.append(
                '<th class="' + data[i].ballot_class + '"><p>' +
                (state.details !== '' ? state.details : empty_text) +
                '</p></th>'
        )

        //add legalization/bans by court decision
        data[i].court_class = 'none';
        if (state.court === 'yes') {
            data[i].court_class = 'court';
        }

        tr.append(
                '<th class="' + data[i].court_class + '"><p>' +
                (state.details !== '' ? state.details :  empty_text) +
                '</p></th>'
        )

        //add legalization/bans by legislature
        data[i].legislature_class = 'none';
        if (state.legislature === 'yes') {
            data[i].legislature_class = 'legislature';
        }

      //  console.log(state.recdetails);
      //  console.log(state.recdetails.replace(/ /, '') !== '');
      //  console.log(state.recdetails.replace(/ /, '') !== '' ? state.recdetails : empty_text);

        tr.append(
                '<th class="' + data[i].legislature_class + '"><p>' +
                (state.details.replace(/ /, '') !== '' ? state.details : empty_text) +
                '</p></th>'
        )

        table.append(tr);
    }
    set_map_classes(data);

}

Tabletop.init( { 
    proxy : 'https://s3.amazonaws.com/mj-tabletop-proxy',
    key: public_spreadsheet_url, callback: makeTable, simpleSheet: true,
} )
