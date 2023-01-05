import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const clusterLink = "mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@bizzarecluster.qhmqx.mongodb.net/bizzareAdventureDB?retryWrites=true&w=majority";
mongoose.connect(clusterLink, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/************************************************* Take A Stand Schemas *************************************************/
/************************************************************************************************************************/

/*************************************** Episode Route Schemas ***************************************/
const questionAnswerSchema = {
  character: String,
  answer: String
};

const episodeSchema = {
  episodeNumber: {
    type: Number,
    required: true
  },
  realLifeDate: {
    type: String,
    required: true
  },
  inGameDate: {
    type: String,
    required: true
  },
  players: [String],
  episodeQuestion: String,
  episodeAnswers: [questionAnswerSchema],
  advancements: String,
  episodeDescription: String,
  standOutMoments: [String],
  storyArc: String,
  episodeThumbnailId: String
};

const Episode = mongoose.model("Episode", episodeSchema);

/*************************************** Character Bio Route Schemas ****************************************/
const descriptionSchema = {
  abilities: String,
  appearance: String,
  personality: String,
  backStory: String,
  storySummary: String,
}

const favoritesSchema = {
  color: String,
  food: String,
  hobbies: String,
  animal: String,
  others: String
}

const profileSchema = {
  age: String,
  birthday: String,
  bloodType: String,
  eyeColor: String,
  gender: String,
  hairColor: String,
  height: String,
  nationality: String,
  occupation: String,
  weight: String
}

const characterBioSchema = {
  abilities: String,
  alias: String,
  episodeDebut: String,
  favorites: favoritesSchema,
  finalEpisodeAppearance: String,
  imageUrl: String,
  name: {
    type: String,
    required: true
  },
  pageDescription: {
    type: descriptionSchema,
    required: true
  },
  player: String,
  profile: profileSchema
};

const Character = mongoose.model("Character", characterBioSchema);

/************************************************* Stand Against Schemas *************************************************/
/*************************************************************************************************************************/

/*************************************** Chapter Route Schemas ***************************************/
const chapterSchema = {
  chapterNumber: {
    type: Number,
    required: true
  },
  realLifeDate: {
    type: String,
    required: true
  },
  inGameDate: {
    type: String,
    required: true
  },
  players: [String],
  chapterQuestion: String,
  chapterAnswers: [{
    character: String,
    answer: String
  }],
  advancements: String,
  chapterDescription: String,
  standOutMoments: [String],
  storyArc: String,
  chapterThumbnailId: String
};

const Chapter = mongoose.model("Chapter", chapterSchema);

/*************************************** Role Route Schemas ***************************************/
const roleSchema = {
  abilities: String,
  alias: String,
  chapterDebut: String,
  favorites: {
    color: String,
    food: String,
    hobbies: String,
    animal: String,
    others: String
  },
  finalChapterAppearance: String,
  imageUrl: String,
  name: {
    type: String,
    required: true
  },
  pageDescription: {
      abilities: String,
      appearance: String,
      personality: String,
      backStory: String,
      storySummary: String,
  },
  player: String,
  profile: {
    age: String,
    birthday: String,
    bloodType: String,
    eyeColor: String,
    gender: String,
    hairColor: String,
    height: String,
    nationality: String,
    occupation: String,
    weight: String
  }
};

const Role = mongoose.model("Role", roleSchema);

export { Episode, Character, Chapter, Role };
