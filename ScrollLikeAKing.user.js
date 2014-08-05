// ==UserScript==
// @name           ScrollLikeAKing
// @namespace      TooDrunkToCode
// @description    Скроллим комментарии без мыши и тачпада
// @include        https://*leprosorium.ru/comments/*
// ==/UserScript==

function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

function initTotalComments() {
    var nice_quality = 0.85;
    var $ = window.jQ;
    var original_poster_username = $('.post .ddi a.c_user').html();
    var username = $('.b-header_tagline a').html();
    var comment_nodes = $('.comment');
    var comments = new Array();
    var comments_new = new Array();
    var comments_nice = new Array();
    var comments_to_iterate = comments;
    var last_active_comment;
    var last_pressed_key, recently_pressed_key;
    var rating_sum = 0;
    var rating_square_sum = 0;
    var counter = {
        abovenull: 0,
        nice: 0
    }
    var keys = {
        'j': 74,
        'k': 75,
        'n': 78,
        'v': 86,
        'c': 67,
        'a': 65,
        'i': 73,
        'l': 76,
        'space':32
    };
    var comment_pointer = 0;

    for (i=0; i<comment_nodes.length; i++) {
        var node = comment_nodes[i];

        comment = {
            dom: node,
            text: $('.c_body', node).html(),
            rating: 1 * $('.vote_result', node).html(),
            author_username: $('.ddi a.c_user', node).html(),
            allall: 1
        };

        if (comment.rating >= 0) {
            counter.abovenull++;
            rating_sum += comment.rating;
            rating_square_sum += Math.pow(comment.rating, 2);
        }
        comments.push(comment);
        if ($(node).hasClass('new')) comments_new.push(comment);
    }

    var standard_deviation = Math.sqrt(( rating_square_sum - (Math.pow(rating_sum,2)/counter.abovenull) )/(counter.abovenull - 1));

    for (i=0; i<comments.length; i++) {
        var comment = comments[i];

        if ( (comment.rating / standard_deviation) >= nice_quality) {
            counter.nice++;
            comment.is_nice = 1;
            comments_nice.push(comment);
        }
    }

    $(document).keydown(function( event ) {

        if ($(e.target).is('input, textarea')) return;

        var handle_key = 0;
        for (var key_name in keys) {
            if (keys[key_name] == event.which)
               handle_key = 1;
        }

        if (!handle_key) return;

        if ( event.which == keys.j ) {
            scrollToNext();
        }
        else if ( event.which == keys.k ) {
            scrollToPrev();
        }
        else if ( event.which == keys.l ) {
            var button_expand = $('a.c_expand', last_active_comment)
            var button_collapse = $('a.c_collapse', last_active_comment)
            var button = ($(button_expand).hasClass('hidden')) ? button_collapse : button_expand;
            if (button) $(button).click();
        }
        else if ( event.which == keys.space ) {
            var comment_body = $('.c_body', last_active_comment);
            var first_link = $('a', comment_body);
            first_link = first_link[0] || first_link;
            if ($(first_link).html()) {
              event.preventDefault();
              $(first_link).css('border', '2px solid green');
              $(first_link).focus();
            };
        }
        else if ( event.which == keys.n ) {
            comments_to_iterate = comments_new;
            comment_pointer = -1;
        }
        else if ( event.which == keys.c ) {
            comments_to_iterate = comments_nice;
            comment_pointer = -1;
        }
        else if ( event.which == keys.a ) {
            comments_to_iterate = comments;
        }
        else if ( event.which == keys.i ) {
            if (!last_active_comment) return;
            var parent_comment_id = $(last_active_comment).data('parent_comment_id');
            if (!parent_comment_id) return;
            if (last_pressed_key != event.which ) comment_pointer--;
            scrollToComment('#' + parent_comment_id);
        } else {
            //alert(event.which);
        }
        last_pressed_key = event.which;
    });

    function scrollToNext() {
        comment_pointer++;
        if (comment_pointer >= (comments_to_iterate.length)) {
            scrollToComment($('#js-footer'));
            comment_pointer = comments_to_iterate.length;
        };
        var next_comment = comments_to_iterate[comment_pointer];
        if (next_comment) {
            scrollToComment(next_comment.dom);
        }
    }

    function scrollToPrev() {
        comment_pointer--;
        if (comment_pointer < 0) {
            scrollToComment($('body'));
            comment_pointer = -1;
            return;
        }
        var prev_comment = comments_to_iterate[comment_pointer];
        if (prev_comment) {
            scrollToComment(prev_comment.dom);
        }
    }

    function scrollToComment (comment_node) {
        if (!comment_node) return;
        last_active_comment = comment_node;
        $('html, body').animate({
            scrollTop: ($(comment_node).offset().top) - 10
        }, 150);
    }

}

if(window.jQ) initTotalComments();
else addJQuery(initTotalComments);