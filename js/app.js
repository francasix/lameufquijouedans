import React from 'react';
import { render } from 'react-dom';
import Actor from './Actor';
import Movie from './Movie';

class App extends React.Component {

  constructor(props) {
    super(props)
    this.apiKey = '?api_key=148d9341acd58f310f70e4660a4a9add'
    this.apiUrl = 'https://api.themoviedb.org/3/'
    this.array = []
    this.arrayActors = []
    this.obj = {}

    this.state = {
      actorList: [],
      movieList: [],
      search: ""
    }

    this.searchMovies = this.searchMovies.bind(this)
  }
  searchMovies(e) {
    e.preventDefault()

    let search = (e.type === 'submit') ? this.state.search : e.target.value
    this.setState({ search: search })

    if (search.length > 1) {

      let query = this.transformValueToQuery(search)

      this.getMovies(this.apiUrl + 'search/movie' + this.apiKey + '&query=' + query)
        .then((movies) => {
          this.setState({ movieList: movies })
        })
    }
  }
  transformValueToQuery(value) {
    let c = ''
    let a = []
    for (let i = 0; i < value.length; i++) {
      c = (value[i] === ' ') ? '%20' : value[i]
      a.push(c)
    }
    return a.join('')
  }
  searchCast(movieId) {
    this.setState({ movieList: [] })
    this.getCast(movieId).then((casting) => {
      return this.updateArrayActors(casting)
    }).then((actorList) => {
      // need empty the list
      document.querySelector('.actor-list').innerHTML = null
      this.setState({ actorList: actorList })
    })
  }
  updateArrayActors(casting) {

    return new Promise((resolve, reject) => {
      let arrayActors = []
      let obj = {}

      for (let i = 0; i < casting.length; i++) {
        obj = {
          "name": casting[i].name,
          "img": casting[i].profile_path
        }
        arrayActors.push(obj)

        if (casting.length === arrayActors.length) {
          resolve(arrayActors)
          return
        }
      }
    })
  }
  getCast(movieId) {

    let self = this
    return new Promise((resolve, reject) => {

      if (!movieId) {
        reject(new Error("no movie id"))
      }

      let url = ""
      let req = new XMLHttpRequest()

      url = self.apiUrl + 'movie/' + movieId + '/credits' + self.apiKey
      req.open('GET', url, true)

      req.onreadystatechange = function () {

        if (this.readyState === 4) {

          if (this.status === 200 && (JSON.parse(this.response).cast).length > 0) {

            for (let x = 0; x < (JSON.parse(this.response).cast).length; x++) {
              self.array.push(JSON.parse(this.response).cast[x])

              // need to wait the end of loop to resolve the promise
              setTimeout(() => {
                resolve(self.array)
              }, 0)

            }
          }
        }
      }
      req.send()
    })
  }
  getMovieId(movies) {

    return new Promise((resolve, reject) => {
      var arrayIds = []

      if (movies.length === 0) {
        reject(new Error("aucun résulat"))
      } else {
        //create array of all id movies
        for (let index = 0; index < movies.length; index++) {
          arrayIds.push(movies[index].id)
        }
        resolve(arrayIds)
      }
    })
  }
  getMovies(url) {
    var self = this
    return new Promise((resolve, reject) => {
      //request from value movie
      var httpRequest = new XMLHttpRequest()
      httpRequest.open('GET', url)

      httpRequest.onreadystatechange = function () {
        if (this.readyState === 4) {

          if (this.status === 200) {
            resolve(JSON.parse(this.responseText).results)
          } else {
            reject(new Error("status response : " + this.status))
          }
        }
      }
      httpRequest.send()
    })
  }
  render() {
    return (
      <div>
        <form onSubmit={this.searchMovies}>
          <input type="text" autoComplete="off" placeholder='value' id="value" value={this.state.value} onChange={this.searchMovies} />
          <input type="submit" value="search" id="send" />
        </form>
        <ul className='movie-list'>
          {this.state.movieList.map((movie, id) => {
            return <li onClick={this.searchCast.bind(this, movie.id)} key={id}><Movie poster={movie.poster_path} movie={movie.original_title} /></li>;
          })}
        </ul>
        <ul className='actor-list'>
          {this.state.actorList.map((actor, id) => {
            return <li key={id}><Actor img={actor.img} name={actor.name} /></li>;
          })}
        </ul>
      </div>)
  }
}
export default App;