var public_spreadsheet_url = "https://docs.google.com/spreadsheet/pub?key=0Aq7nL59nLsCMdDJxZUo4cFZaWGF5d0pSZU9XSE44NVE&single=true&gid=0&output=html";

var set_class = function(state, map, css_class) {
    var svg = jQuery('#' + map + ' .' + state);
    svg.attr('class').baseVal = state + ' ' + css_class;
}

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
            set_class(state.postal, 'legislationMap', data[i].legislation_class);
        } else {
            console.log(state.postal);
            setTimeout(set_map_classes(data), 2000);
            break;
            return;
        }
    }
}

var makeTable = function(data) {
    var table = jQuery('#mapTable');
    var select = jQuery('#jump_to_state select');
    var empty_text = '<span class="inline_label">Not at the moment</span>';
    select.change(function() {
        window.location.hash = select.val() + '_row';
        return false;
    });

    for (i = 0; i < data.length; i++) {
        if (i === 10 || i === 20 || i === 30 || i === 40) {
            table.append(jQuery(' <tr class="mid_labels"> <th> </th> <th> Ballot initiative </th> <th> Court decision </th> <th> Legislation </th> </tr> '));
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

        //add map view 1 aka ballot ** NEED TO REWRITE THIS through line 91 **
        data[i].ballot_class = 'none';
        if (state.ballot === 'yes') {
            data[i].ballot_class = 'yes';
        }

        tr.append(
                '<th class="' + data[i].penalties_class + '"><p>' +
                (state.decrimdetails !== '' ? state.decrimdetails : empty_text) +
                '</p></th>'
        )

        //add medicinal
        data[i].medicinal_class = 'not_good';
        if (state.medicinalstatus === 'Possible') {
            data[i].medicinal_class = 'kinda_good';
        } else if (state.medicinalstatus === 'Yes') {
            data[i].medicinal_class = 'good';
        }
        tr.append(
                '<th class="' + data[i].medicinal_class + '"><p>' +
                (state.medicinaldetails !== '' ? state.medicinaldetails :  empty_text) +
                '</p></th>'
        )

        //add recreational
        data[i].recreational_class = 'not_good';
        if (state.recstatus === 'Possible') {
            data[i].recreational_class = 'kinda_good';
        } else if (state.recstatus === 'Yes') {
            data[i].recreational_class = 'good';
        }
        console.log(state.recdetails);
        console.log(state.recdetails.replace(/ /, '') !== '');
        console.log(state.recdetails.replace(/ /, '') !== '' ? state.recdetails : empty_text);
        tr.append(
                '<th class="' + data[i].recreational_class + '"><p>' +
                (state.recdetails.replace(/ /, '') !== '' ? state.recdetails : empty_text) +
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
