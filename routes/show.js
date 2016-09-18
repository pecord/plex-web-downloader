var express = require('express');
var router = express.Router();

function formatDuree(time) {
  if(typeof time !== 'undefined' && time != "" && time > 0){
    var d = new Date(time); // time milisecondes
    return addZero(d.getHours()-1) + "h "+ addZero(d.getMinutes()) + "m "+ addZero(d.getSeconds()) + "s ";
  }
  else {
    return "";
  }
}

function addZero(v) {
  return v.toString().replace(/^(\d)$/,'0$1');
};

/* GET home page. */
router.get('/:id/:incoming_chan', function(req, res, next) {
  var config = res.locals.config;
  var db = config.init_db();
  var data = [];

  //on fais any basic operation later
  db.serialize(function() {

    db.each("SELECT episode.id as id, episode.title as titre, episode.[index] as episode, episode.duration as second, season.[index] as saison, show.title as serie "+
    "FROM metadata_items episode,metadata_items season,metadata_items show "+
    "WHERE episode.parent_id=season.id AND season.parent_id = show.id AND show.id = ? ",req.params.id, function(err, row) {

        /*// hints
        var params = {};
        var tab = row.hints.split('&');
        tab.forEach(function(val,index,table){
          var tab2 = val.split('=');
          params[tab2[0]] = decodeURIComponent(tab2[1]);
        });
        row.info_meta = params;
        */

        if(typeof row.episode !== '' &&  row.saison !== '' ){
          row.season_episode = "S"+addZero(row.saison)+"E"+addZero(row.episode );
        }

        row.duree = formatDuree(row.second);

        data.push(row);
    },
    function() {
      // at the end of foreach
    });

    db.close(function(){
        // after All the basic operation
        var titre = "nonexistent series";
        if(data.length > 0){
          titre = 'Episode of '+data[0].serie;
        }
        res.render('show',{
          title: titre,
          videos: data,
          channel_id: req.params.incoming_chan,
          show_id: req.params.id
        });
    });


  });


});

module.exports = router;
