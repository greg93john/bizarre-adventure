//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import _ from "lodash";
import {Episode, Character, Chapter, Role} from "./bizzareDB.js";
import path from "path";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

var episodeAmount = 0, chapterAmount = 0;

countHowManyEpisodes();

countHowManyChapters();

app.route("/")
.get(function(req,res) {
    res.render("TheGate/home.ejs");
});

app.route("/take-a-stand")
.get(function(req, res) {
  res.render("take-a-stand/home.ejs",{
    pageSubtitle: "",
    episodeAmount: episodeAmount
  });
});

app.route("/stand-against")
.get(function(req, res) {
  res.render("stand-against/home.ejs",{
    pageSubtitle: "",
    chapterAmount: chapterAmount
  });
});


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Take A Stand routes ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


/************************************************************************************************************************/
/*************************************** Methods for all episodes in the database ***************************************/
/************************************************************************************************************************/
app.route("/take-a-stand/episodes")
  // GET all episodes in database
  .get(function(req, res) {
    Episode.find({}, function(err, foundEpisodes) {
      if (!err) {
        res.render("take-a-stand/episode-list.ejs", {
          episodeList: foundEpisodes,
          pageSubtitle: "| Episodes",
          episodeAmount: episodeAmount
        });
      } else {
        res.send(err);
      }
    }).sort({episodeNumber:1})
  })
  // POST (create) a new episode in database
  .post(function(req, res) {
    Episode.findOne({
        episodeNumber: req.body.episodeNumber
      },
      function(err, foundEpisode) {
        if (!foundEpisode) {
          const newEpisode = new Episode({
            episodeNumber: req.body.episodeNumber,
            realLifeDate: req.body.realLifeDate,
            inGameDate: req.body.inGameDate,
            players: req.body.players,
            episodeQuestion: req.body.episodeQuestion,
            episodeAnswers: req.body.episodeAnswers,
            advancements: req.body.advancements,
            episodeDescription: req.body.episodeDescription,
            standOutMoments: req.body.standOutMoments,
            storyArc: req.body.storyArc
          });

          newEpisode.save(function(err) {
            if (!err) {
              countHowManyEpisodes();
              res.send("Successfully added new episode!");
            } else {
              res.send(err);
            }
          });
        } else {
          res.send("Episode Already Exists!");
        }
      })
  })
// DELETE all episodes (be careful when using this)
/*.delete(function(req, res) {
  Episode.deleteMany(function(err) {
    if (!err) {
      countHowManyEpisodes();
      res.send("All episodes successfully deleted...")
    } else {
      res.send(err);
    }
  })
});*/

/*******************************************************************************************************************************/
/*************************************** Methods for individual episodes in the database ***************************************/
/*******************************************************************************************************************************/
app.route("/take-a-stand/episodes/:episodeNumber")
  // reads the specified episode in the database
  .get(function(req, res) {
    Episode.findOne({
      episodeNumber: req.params.episodeNumber
    }, function(err, foundEpisode) {
      if (!err) {
        if (foundEpisode) {
          res.render("take-a-stand/episode-display.ejs", {
            episodeDoc: foundEpisode,
            episodeAmount: episodeAmount,
            pageSubtitle: "| Episode " + req.params.episodeNumber
          });
        } else {
          res.send("Episode not recorded yet.");
        }
      } else {
        res.send(err);
      }
    })
  })
  // updates (through 'patch' method) the specified episode in the database
  .patch(function(req, res) {
    Episode.updateOne({
        episodeNumber: req.params.episodeNumber
      }, {
        $set: req.body
      },
      function(err) {
        if (!err) {
          res.send("Successfully updated episode.");
        } else {
          res.send(err);
        }
      }
    );
  })
  // deletes the specified episode
  .delete(function(req, res) {
    Episode.delete({
        episodeNumber: req.params.episodeNumber
      },
      function(err) {
        if (!err) {
          countHowManyEpisodes();
          res.send("Successfully deleted episode.");
        } else {
          res.send(err);
        }
      }
    )
  });

/**********************************************************************************************************************/
/*************************************** Methods for all characters in database ***************************************/
/**********************************************************************************************************************/
app.route("/take-a-stand/characters")
  //GET all character bios in database
  .get(function(req, res) {
    Character.find({}, function(err, foundCharacters) {
      if (!err){
        res.render("take-a-stand/character-list.ejs", {
          characterList: foundCharacters,
          pageSubtitle: "| Characters",
          episodeAmount: episodeAmount
        });
      } else {
        res.send(err);
      }
    }).sort({name:1});
  })
  // POST (create) a new character bio in database
  .post(function(req, res) {
    const creationName = _.startCase(_.capitalize(req.body.name));;

    Character.findOne({
        name: creationName
      },
      function(err, foundCharacter) {
        if (!foundCharacter) {
          const newCharacter = new Character({
            abilities: req.body.abilities,
            alias: req.body.alias,
            episodeDebut: req.body.episodeDebut,
            favorites: req.body.favorites,
            finalEpisodeAppearance: req.body.finalEpisodeAppearance,
            imageUrl: req.body.imageUrl,
            name: creationName,
            pageDescription: req.body.pageDescription,
            player: req.body.player,
            profile: req.body.profile
          });

          newCharacter.save(function(err) {
            res.send(err ? err : "Character Bio Successfully Saved!");
          });
        } else {
          res.send("Character Already Exists!");
        }
      }
    );
  });

/*****************************************************************************************************************************/
/*************************************** Methods for individual characters in database ***************************************/
/*****************************************************************************************************************************/
app.route("/take-a-stand/characters/:characterName")
  // Reads the specified character bio in the database
  .get(function(req, res) {
    const characterName = _.startCase(_.capitalize(req.params.characterName));
    Character.findOne({name: characterName}, function(err, foundCharacter) {
      if (!err) {
        if(foundCharacter) {
          res.render("take-a-stand/character-bio-display.ejs", {
            characterDoc: foundCharacter,
            episodeAmount: episodeAmount,
            pageSubtitle: "| " + req.params.characterName
          });
        } else {
          res.send("Cannot find character bio");
        }
      } else {
        res.send(err);
      }
    });
  })
// updates (through 'patch' method) the specified character bio in the database
.patch(function(req, res) {
    var updateBody = req.body;
    updateBody.name = _.startCase(_.capitalize(req.params.characterName));

    Character.updateOne({
        name: updateBody.name
      }, {
        $set: updateBody
      },
      function(err) {
        res.send(err ? err : "Successfully Updated Character Bio!");
      }
    );
  })
  // deletes the specified character bio
  .delete(function(req, res) {
    const characterName = _.startCase(_.capitalize(req.params.characterName));
    Character.delete({
        name: characterName
      },
      function(err) {
        res.send(err ? err : "Successfully Deleted Character Bio!")
      }
    );
  });



/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Stand Against routes ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


/************************************************************************************************************************/
/*************************************** Methods for all chapters in the database ***************************************/
/************************************************************************************************************************/
app.route("/stand-against/chapters")
// GET all chapters in database
.get(function(req, res) {
  Chapter.find({}, function(err, foundChapters) {
    if (!err) {
      res.render("stand-against/chapter-list.ejs", {
        chapterList: foundChapters,
        pageSubtitle: "| Chapters",
        chapterAmount: chapterAmount
      });
    } else {
      res.send(err);
    }
  }).sort({chapterNumber:1})
})
// POST (create) a new chapter in database
.post(function(req, res) {
  Chapter.findOne({
      chapterNumber: req.body.chapterNumber
    },
    function(err, foundChapter) {
      if (!foundChapter && !err) {
        const newChapter = new Chapter({
          chapterNumber: req.body.chapterNumber,
          realLifeDate: req.body.realLifeDate,
          inGameDate: req.body.inGameDate,
          players: req.body.players,
          chapterQuestion: req.body.chapterQuestion,
          chapterAnswers: req.body.chapterAnswers,
          advancements: req.body.advancements,
          chapterDescription: req.body.chapterDescription,
          standOutMoments: req.body.standOutMoments,
          storyArc: req.body.storyArc
        });

        newChapter.save(function(err) {
          if (!err) {
            countHowManyChapters();
            res.send("Successfully added new chapter!");
          } else {
            res.send(err);
          }
        });
      } else if (err) {
        res.send(err);
      } else {
        res.send("Chapter Already Exists!");
      }
    })
})

/*******************************************************************************************************************************/
/*************************************** Methods for individual chapters in the database ***************************************/
/*******************************************************************************************************************************/
app.route("/stand-against/chapters/:chapterNumber")
  // reads the specified chapter in the database
  .get(function(req, res) {
    Chapter.findOne({
      chapterNumber: req.params.chapterNumber
    }, function(err, foundChapter) {
      if (!err) {
        if (foundChapter) {
          res.render("stand-against/chapter-display.ejs", {
            chapterDoc: foundChapter,
            chapterAmount: chapterAmount,
            pageSubtitle: "| Chapter " + req.params.chapterNumber
          });
        } else {
          res.send("Chapter not recorded yet.");
        }
      } else {
        res.send(err);
      }
    })
  })
  // updates (through 'patch' method) the specified chapter in the database
  .patch(function(req, res) {
    Chapter.updateOne({
        chapterNumber: req.params.chapterNumber
      }, {
        $set: req.body
      },
      function(err) {
        if (!err) {
          res.send("Successfully updated chapter.");
        } else {
          res.send(err);
        }
      }
    );
  })
  // deletes the specified chapter
  .delete(function(req, res) {
    Chapter.delete({
        chapterNumber: req.params.chapterNumber
      },
      function(err) {
        if (!err) {
          countHowManyChapters();
          res.send("Successfully deleted chapter.");
        } else {
          res.send(err);
        }
      }
    )
  });

  /************************************************************************************************************************/
  /*************************************** Methods for all roles in the database ***************************************/
  /************************************************************************************************************************/
  app.route("/stand-against/characters")
  //GET all character bios in database
  .get(function(req, res) {
    Role.find({}, function(err, foundRoles) {
      if (!err){
        res.render("stand-against/role-list.ejs", {
          roleList: foundRoles,
          pageSubtitle: "| Roles",
          chapterAmount: chapterAmount
        });
      } else {
        res.send(err);
      }
    }).sort({name:1});
  })
  // POST (create) a new role in database
  .post(function(req, res) {
    const creationName = _.startCase(_.capitalize(req.body.name));;

    Role.findOne({
        name: creationName
      },
      function(err, foundRole) {
        if (!foundRole) {
          const newRole = new Role({
            abilities: req.body.abilities,
            alias: req.body.alias,
            chapterDebut: req.body.chapterDebut,
            favorites: req.body.favorites,
            finalEpisodeAppearance: req.body.finalEpisodeAppearance,
            imageUrl: req.body.imageUrl,
            name: creationName,
            pageDescription: req.body.pageDescription,
            player: req.body.player,
            profile: req.body.profile
          });

          newRole.save(function(err) {
            res.send(err ? err : "Role Successfully Saved!");
          });
        } else {
          res.send("Role Already Exists!");
        }
      }
    );
  });

    /*****************************************************************************************************************************/
    /*************************************** Methods for individual roles in database ***************************************/
    /*****************************************************************************************************************************/
    app.route("/stand-against/characters/:roleName")
      // Reads the specified role bio in the database
      .get(function(req, res) {
        const roleName = _.startCase(_.capitalize(req.params.roleName));
        Role.findOne({name: roleName}, function(err, foundRole) {
          if (!err) {
            if(foundRole) {
              res.render("stand-against/role-detail-display.ejs", {
                roleDoc: foundRole,
                chapterAmount: chapterAmount,
                pageSubtitle: "| " + req.params.roleName
              });
            } else {
              res.send("Cannot find role");
            }
          } else {
            res.send(err);
          }
        });
      })
    // updates (through 'patch' method) the specified role bio in the database
    .patch(function(req, res) {
        var updateBody = req.body;
        updateBody.name = _.startCase(_.capitalize(req.params.roleName));

        Role.updateOne({
            name: updateBody.name
          }, {
            $set: updateBody
          },
          function(err) {
            res.send(err ? err : "Successfully Updated Role!");
          }
        );
      })
      // deletes the specified role bio
      .delete(function(req, res) {
        const roleName = _.startCase(_.capitalize(req.params.roleName));
        Role.delete({
            name: roleName
          },
          function(err) {
            res.send(err ? err : "Successfully Deleted Role!")
          }
        );
      });

  function countHowManyEpisodes() {
    Episode.countDocuments({}, function(err, count) {
      episodeAmount = count;
    });
  }

  function countHowManyChapters() {
    Chapter.countDocuments({}, function(err, count) {
      chapterAmount = count;
    })
  }

app.listen(process.env.PORT || 3000, function() {
  console.log("Bizzare Adventure server has started");
});
