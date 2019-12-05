var current_stress = 0;

var set_stress = function(stress) {
  if (stress >= 0 && current_stress >= 0) {
    $( ".high_stress" ).animate({
      "margin-top": "" + (300 - 30 * stress) + "px",
      "height": "" + (30 * stress) + "px"
    }, 500, function() {
      current_stress = stress;
    })
  }
  else if (stress < 0 && current_stress <= 0) {
    $( ".low_stress" ).animate({
      "height": "" + (30 * -stress) + "px"
    }, 500, function() {
      current_stress = stress;
    })
  }
  else if (current_stress > 0 && stress < 0) {
    $( ".high_stress" ).animate({
      "margin-top": "300px",
      "height": "0px"
    }, 250, function() {
      $( ".low_stress" ).animate({
        "height": "" + (30 * -stress) + "px"
      }, 250, function() {
        current_stress = stress;
      })
    });
  }
  else if (current_stress < 0 && stress > 0) {
    $( ".low_stress" ).animate({
      "height": "0px"
    }, 250, function() {
      $( ".high_stress" ).animate({
        "margin-top": "" + (300 - 30 * stress) + "px",
        "height": "" + (30 * stress) + "px"
      }, 250, function() {
        current_stress = stress;
      })
    });
  }
  // current_stress = stress;
}

var update_the_circles = function(data, playback_time, hr, br, temp) {
  // HR Update
  let percent = parseInt((data.hr[playback_time] - data.min_hr) / (data.max_hr - data.min_hr) * 100)
  hr.set(percent, false);
  $(".hr .ldBar-label")[0].innerHTML = data.hr[playback_time];
  if (percent < 33) {
    $(".hr path").css("stroke", "green")
  } else if (percent < 66) {
    $(".hr path").css("stroke", "orange")
  } else {
    $(".hr path").css("stroke", "red")
  }

  // BR Update
  percent = parseInt((data.br[playback_time] - data.min_br) / (data.max_br - data.min_br) * 100)
  br.set(percent, false);
  $(".br .ldBar-label")[0].innerHTML = data.br[playback_time];
  if (percent < 33) {
    $(".br path").css("stroke", "green")
  } else if (percent < 66) {
    $(".br path").css("stroke", "orange")
  } else {
    $(".br path").css("stroke", "red")
  }

  // Temp Update
  percent = parseInt((data.temp[playback_time] - data.min_temp) / (data.max_temp - data.min_temp) * 100)
  temp.set(percent, false);
  $(".temp .ldBar-label")[0].innerHTML = data.temp[playback_time];
  if (percent < 33) {
    $(".temp path").css("stroke", "green")
  } else if (percent < 66) {
    $(".temp path").css("stroke", "orange")
  } else {
    $(".temp path").css("stroke", "red")
  }
}

$( document ).ready(function() {
  let data
  let playback_time = 0
  let hr
  let br
  let temp

  // Init video player
  var video = videojs('video')
  video.ready(function(){
    this.on('timeupdate', function() {
      let current_time = parseInt(this.currentTime());
      if (current_time !== playback_time) {
        playback_time = current_time

        // Updating HR, BR, Temp
        update_the_circles(data, playback_time, hr, br, temp)

        // Set the stress level
        set_stress(data.stress[playback_time])

        // Set the face
        $(".fa-smile").hide()
        $(".fa-meh").hide()
        $(".fa-frown").hide()
        if (data.valence[playback_time] === "0") {
          $(".fa-meh").show()
        } else if (data.valence[playback_time] === "1") {
          $(".fa-smile").show()
        } else {
          $(".fa-frown").show()
        }
      }
    });
  });

  $.get("/data", function (data_from_backend) {
    data = data_from_backend;

    //Setting HR
    hr = new ldBar(".hr", {
     "stroke": '#f00',
     "stroke-width": 10,
     "preset": "fan",
     "stroke-lincap": "round",
     "value": parseInt((data.hr[0] - data.min_hr) / (data.max_hr - data.min_hr) * 100)
    });
    $(".hr .ldBar-label")[0].innerHTML = data.hr[0];

    //Setting BR
    br = new ldBar(".br", {
     "stroke": 'green',
     "stroke-width": 10,
     "preset": "fan",
     "stroke-lincap": "round",
     "value": parseInt((data.br[0] - data.min_br) / (data.max_br - data.min_br) * 100)
    });
    $(".br .ldBar-label")[0].innerHTML = data.br[0];

    //Setting Temp
    temp = new ldBar(".temp", {
     "stroke": 'orange',
     "stroke-width": 10,
     "preset": "fan",
     "stroke-lincap": "round",
     "value": parseInt((data.temp[0] - data.min_temp) / (data.max_temp - data.min_temp) * 100)
    });
    $(".br .ldBar-label")[0].innerHTML = data.temp[0];

    //Setting stress
    set_stress(data.stress[0])

    //Setting face
    if (data.valence[0] === "0") {
      $(".fa-meh").show()
    }
    else if (data.valence[0] === "1") {
      $(".fa-smile").show()
    } else {
      $(".fa-frown").show()
    }

    //Setting the incident markers
    let markers_data = data.incident.map((v, i) => {if( v === "1" ) {return i}})
    markers_data = markers_data.filter(v => v !== undefined)
    markers = []
    markers_data.forEach((m, i) => {markers.push({time: m, text: `Incident ${i + 1}`})})
    video.markers({markerTip:{text: function(marker) {return marker.text;}},markers: markers});

    //Hiding footer
    $('#disclaimer-button').click(function() {
      if ($('#disclaimer-container').css('display') === "grid") {
        $('#disclaimer-container').hide()
        $('#disclaimer-button').css("bottom", "0px")
      } else {
        $('#disclaimer-container').show()
        $('#disclaimer-button').css("bottom", "120px")
      }
    })
  })
});
