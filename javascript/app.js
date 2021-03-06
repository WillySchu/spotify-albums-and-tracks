// Self envoking function! once the document is ready, bootstrap our application.
// We do this to make sure that all the HTML is rendered before we do things
// like attach event listeners and any dom manipulation.
(function(){
  $(document).ready(function(){
    bootstrapSpotifySearch();
  })
})();

/**
  This function bootstraps the spotify request functionality.
*/
function bootstrapSpotifySearch(){

  var userInput, searchUrl, results;
  var outputArea = $("#q-results");

  $('#spotify-q-button').on("click", function(){
      var spotifyQueryRequest;
      spotifyQueryString = $('#spotify-q').val();
      searchUrl = "https://api.spotify.com/v1/search?type=artist&q=" + spotifyQueryString;

      // Generate the request object
      spotifyQueryRequest = $.ajax({
          type: "GET",
          dataType: 'json',
          url: searchUrl
      });

      // Attach the callback for success
      // (We could have used the success callback directly)
      spotifyQueryRequest.done(function (data) {
        var artists = data.artists;

        // Clear the output area
        outputArea.html('');

        // The spotify API sends back an arrat 'items'
        // Which contains the first 20 matching elements.
        // In our case they are artists.
        artists.items.forEach(function(artist){
          var artistLi = $("<li>" + artist.name + " - " + artist.id + "</li>")
          artistLi.attr('data-spotify-id', artist.id);
          outputArea.append(artistLi);

          artistLi.click(displayAlbumsAndTracks);
        })
      });

      // Attach the callback for failure
      // (Again, we could have used the error callback direcetly)
      spotifyQueryRequest.fail(function (error) {
        console.log("Something Failed During Spotify Q Request:")
        console.log(error);
      });
  });
}

/* COMPLETE THIS FUNCTION! */
function displayAlbumsAndTracks(event) {
  var appendToMe = $('#albums-and-tracks');
  var id = $(event.target).attr('data-spotify-id');
  var albums;
  var albumsVerbose = [];
  var tracks = [];
  var albumNames = [];
  var albumDates = [];
  var albumIDs = [];
  var searchURLA = "https://api.spotify.com/v1/artists/" + $(event.target).attr('data-spotify-id') + "/albums";

  albums = $.ajax({
      type: "GET",
      dataType: 'json',
      url: searchURLA
  });

  albums.done(function(data){
    for (var i = 0; i < data.items.length; i++) {
      albumsVerbose[i] = $.ajax({
        type: "GET",
        dataType: "json",
        url: data.items[i].href
      })
      albumNames.push(data.items[i].name);
      albumIDs.push(data.items[i].id);
    }
    albumsVerbose[19].done(function(data){
      for (var i = 0; i < albumsVerbose.length; i++) {
        albumDates[i] = albumsVerbose[i].responseJSON.release_date;
      }
    })
  })

  albums.done(function(data){
    for (var i = 0; i < albumIDs.length; i++) {
      tracks[i] = $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://api.spotify.com/v1/albums/" + albumIDs[i] + "/tracks"
      })
    }
    tracks[19].done(function(data){
      for (var i = 0; i < albumNames.length; i++) {
        var albumTracks = tracks[i].responseJSON.items;
        appendToMe.append('<p>' + albumNames[i] + ' - ' + albumDates[i] + '</p>');
        for (var j = 0; j < albumTracks.length; j++) {
          appendToMe.append('<li>' + albumTracks[j].name + '</li>');
        }
      }
    })
  })


  console.log("you clicked on:");
  console.log($(event.target).attr('data-spotify-id'));//.attr('data-spotify-id'));
}
