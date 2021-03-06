document.THREE = document.THREE || {};

function render_board() {
  var tiles = Session.get("tiles");
  for (var i = 0; i <= 3; i++) {
    for (var j = 0; j <= 3; j++) {
      var t = tiles[i][j];

      if (tiles[i][j] != 0) {

        // var block = Template.tile({row: i, col: j, tile: t});
        var block = Blaze.toHTMLWithData(Template.tile, {row: i, col: j, tile: t});
        block = $(block).addClass(document.THREE.util.tile_class(t));

        //(Here there be magic numbers)
        if (t >= 1536 && t < 12288) {
          block = $(block).css({
            left: 22 + (j * 92),
            top: 22 + (i * 130),
            'font-size': 32
          });
        } else if ( t >= 12288) {
          block = $(block).css({
            left: 22 + (j * 92),
            top: 22 + (i * 130),
            'font-size': 25
          });
        } else {
          block = $(block).css({
            left: 22 + (j * 92),
            top: 22 + (i * 130)
          });
        }


        $(".board").append(block);
      }
    }
  }
}

function render_score(score) {
  $('#score').text(score);
}

function render_bestscore(score) {
  $('#bestscore').text(score);
}

function render_next() {
  var next_tile = Session.get("next_tile");
  $(".next .tile").removeClass("red")
                  .removeClass("blue")
                  .removeClass("number")
                  .removeClass("bonus");
  $(".next .tile").addClass(document.THREE.util.tile_class(next_tile));
}

function render_lost(total) {
  var tweet = "I scored " + total + " on %23threes-AI!";

  var overlay = $("<div/>", {class: "overlay"});
  // var endgame = Template.endgame({score: total});
  var endgame = Blaze.toHTMLWithData(Template.endgame, {score: total});
  overlay.append(endgame);

  $("body").append(overlay);
  overlay.fadeIn(200);

  $("#again-game").click(function(e) {
    overlay.remove();
    document.THREE.game.new_game()
  });

  // Close modal
  $("body").click(function(e) {
    if (!$(e.target).closest(".endgame").length) {
      overlay.remove();
    }
  });

  $(window).on("keydown", function(e) {
    if (e.keyCode === 13) { // Enter
      overlay.remove();
    }
    if (e.keyCode === REPLAY)  {
      overlay.remove();
      document.THREE.game.new_game()
    }
  });
}

function animate_move(obj, direction) {
  var board = obj.board;
  var moved = obj.moved;

  var movement;

  switch(direction) {
    case LEFT:
      movement = function(c) {
        return {top: c.top, left: c.left - 92};
      }
      coords = function(i, j) {
        return String(i) + String(j - 1);
      }
    break;

    case RIGHT:
      movement = function(c) {
        return {top: c.top, left: c.left + 92};
      }
      coords = function(i, j) {
        return String(i) + String(j + 1);
      }
    break;

    case UP:
      movement = function(c) {
        return {top: c.top - 130, left: c.left};
      }
      coords = function(i, j) {
        return String(i - 1) + String(j);
      }
    break;

    case DOWN:
      movement = function(c) {
        return {top: c.top + 130, left: c.left};
      }
      coords = function(i, j) {
        return String(i + 1) + String(j);
      }
    break;
  }

  $(".tile").css("zIndex", 10);

  _.each(moved, function(t) {
    var el = $("[data-coords=" + String(t.i) + String(t.j) + "]");

    var old_coords = {top: parseInt(el.css("top")), left: parseInt(el.css("left"))};
    var new_coords = movement(old_coords);

    if (t.t >= 1536 && t.t < 12288) {
      el.css({
        'font-size': 32
      });
    }
    if (t.t >= 12288) {
      el.css({
        'font-size': 25
      });
    }

    el.css("zIndex", 100);
    el.animate({
      top: new_coords.top,
      left: new_coords.left
    }, 150, "easeOutQuart", function() {
      $("[data-coords=" + coords(t.i, t.j) + "]").remove();
      el.attr("data-coords", coords(t.i, t.j));
      el.removeClass("blue");
      el.removeClass("red");
      el.removeClass("number");
      el.addClass(document.THREE.util.tile_class(t.t));
      el.html(t.t);

      // 跳跃的动画
      //el.effect("bounce", {distance: 30, times: 3});
    });
  });
}

function animate_new_tile(coords, direction) {
  var next_tile = Session.get("next_tile");
  var origin;

  switch(direction) {
    case LEFT:
      origin = function(top, left) {
        return {top: top, left: left + 92};
      }
    break;

    case RIGHT:
      origin = function(top, left) {
        return {top: top, left: left - 92};
      }
    break;

    case UP:
      origin = function(top, left) {
        return {top: top + 130, left: left};
      }
    break;

    case DOWN:
      origin = function(top, left) {
        return {top: top - 130, left: left};
      }
    break;
  }

  // var block = Template.tile({row: coords.i, col: coords.j, tile: next_tile});
  var block = Blaze.toHTMLWithData(Template.tile, {row: coords.i, col: coords.j, tile: next_tile});
  block = $(block).addClass(document.THREE.util.tile_class(next_tile));

  var top = 22 + (coords.i * 130);
  var left = 22 + (coords.j * 92);
  var origins = origin(top, left);

  if (next_tile >= 1536 && next_tile < 12288) {
    block = $(block).css({
      left: origins.left,
      top: origins.top,
      'font-size': 32
    });
  } else if ( next_tile >= 12288) {
    block = $(block).css({
      left: origins.left,
      top: origins.top,
      'font-size': 25
    });
  } else {
    block = $(block).css({
      left: origins.left,
      top: origins.top
    });
  }

  // block.css({
  //   left: origins.left,
  //   top: origins.top
  // });
  $(".board").append(block);

  block.animate({
    top: top,
    left: left
  }, 150, "easeOutQuart");
}

document.THREE.display = {
  render_board: render_board,
  render_next: render_next,
  render_lost: render_lost,
  render_score:render_score,
  animate_move: animate_move,
  animate_new_tile: animate_new_tile
};
