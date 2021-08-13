const axios = require('axios')

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
  GraphQLID
} = require("graphql");

// Launch Type
const LaunchType = new GraphQLObjectType({
  name: "Launch",
  fields: () => ({
    flight_number: { type: GraphQLInt },
    mission_name: { type: GraphQLString },
    launch_date_utc: { type: GraphQLString },
    launch_success: { type: GraphQLBoolean },
    cost_per_launch: { type: GraphQLInt },
    // rocket: { type: GraphQLString},
    rocket: { type: RocketType }
    // rocket: {
    //   // type: RocketType,
    //   // resolve(parent, args){
    //   //   console.log('RocketType parent ' + parent)
    //   //   return axios.get('https://api.spacexdata.com/v4/rockets')
    //   //   .then(res => res.data);
    //   type: new GraphQLList(RocketType),
    //   resolve: rocket => rocket.map('https://api.spacexdata.com/v4/rockets')
    // },
  })
});

// Rocket Type
const RocketType = new GraphQLObjectType({
    name: "Rocket",
    fields: () => ({
      rocket_id: { type: GraphQLString },
      rocket_name: { type: GraphQLString },
      rocket_type: { type: GraphQLString },
      cost_per_launch: {type: GraphQLInt},
      boosters: { type: GraphQLInt }
    }),
  });

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        launches: {
            type: new GraphQLList(LaunchType),
            resolve(parent, args){
                return axios
                .get('https://api.spacexdata.com/v3/launches')
                .then(res => res.data);
            }
        },
        launch: {
            type: LaunchType,
            args: {
                flight_number: { type: GraphQLInt }
            },
            resolve(parent, args) {
              
                return axios
                .get(`https://api.spacexdata.com/v3/launches/${args.flight_number}`)
                .then(res => res.data);
            }
        },
        rockets: {
          type: new GraphQLList(RocketType),
          resolve(parent, args){
              return axios.get('https://api.spacexdata.com/v3/rockets')
              .then(res => res.data);
          }
      },
        rocket: {
          type: RocketType,
          args: {
            id: { type: GraphQLString }
          },
          resolve(parent, args) {
            return axios
            .get(`https://api.spacexdata.com/v3/rockets/${args.id}`)
            .then(res => res.data)
          }
        }
     

    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})