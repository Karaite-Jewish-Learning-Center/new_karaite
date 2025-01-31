$(document).ready(function ($) {
    $('<div id="show-filters" style="float: right;"><a href="#">Show filter</a></p>').prependTo('div.actions');
    $('#show-filters').hide();
    $('#changelist-filter h2').html('<a style="color: white;text-transform:none" id="hide-filters" href="#">Hide filter</a>');

    $('#show-filters').click(function () {
        $('#changelist-filter').show();
        $('#changelist').addClass('filtered');
        $('#show-filters').hide();
    });

    $('#hide-filters').click(function () {
        $('#changelist-filter').hide();
        $('#show-filters').show();
        $('#changelist').removeClass('filtered');
    });
});
