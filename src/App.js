import './App.css';
import React from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resultsReturned: false,
      results:{},
      statistics:{},
      extraInfo:"",
      showExtraInfo:false,
      numericalView:false,
      graphicalView:false,
      startDate: 0,
      endDate: 0
    };
  };
  
   getResults (){
    var self = this
    var posts = {}
    var formatPosts =[]
    // get values from the input fields in the form
    const term = document.getElementById('searchTerm').value;
    const startDateValue = document.getElementById("startDate").value;
    const endDateValue = document.getElementById("endDate").value;
    // convert the start dates and end dates into epoch values 
    const dateCheck = this.formatDates(startDateValue, endDateValue);
    //if the fields in the form are filled, search the database
    if (dateCheck && term !== ""){
    axios.get(`http://localhost:3001/data/${term}`)
    .then(function(response){
      if (response.data != ""){
      response.data.map((item, key) => {
        // check if dates of creation for the posts are within start and end dates
        if (parseInt(item.timeCreated) >= (dateCheck[0]/1000) && parseInt(item.timeCreated) < ((dateCheck[1]/1000) + 86400)){
          formatPosts.push(item);
        }
      })

      //store the results of the search
      if (formatPosts.length > 0){
      posts = JSON.stringify(formatPosts);
      self.setState({ 
        results: posts,
        resultsReturned: true,
       })
      }
      } else{
        // if fields in the form are not filled end search
        self.setState({ 
          results: {},
          resultsReturned: false,
         })

      };
    })
    .catch(function(error){
      console.log(error.message);
    })
  } else {
    alert('Incomplete Fields: Please fill out all fields');
  }
  
  }

  componentDidMount(){
    //makes call to Reddit API to store and analyse more posts
    axios.get(`http://localhost:3001/storePosts`).catch(function(error){
      console.log(error.message);
    })
    return this.renderForm()

  }
  async getExtraInfo(index){
    //stores more information about an individual post
    //hides graphical and numerical view elements and shows extra info element
    var self = this;
    const results = JSON.parse(this.state.results)
    var extraInfoItem ={}
    extraInfoItem = JSON.stringify(results[index]);
    await self.setState({ extraInfo: JSON.parse(extraInfoItem) });
    this.setState({ 
      showExtraInfo: true,
      numericalView: false,
      graphicalView: false
    });
  }

  displayExtraInfo(){
    // renders extra info element
    if (this.state.showExtraInfo == true){
      return(
        <div className="extraInfo">
          <p> Text: {this.state.extraInfo.text}</p>
          <p> Sentiment: {this.state.extraInfo.category}</p>
          <p> Time Created: {String(new Date(parseInt(this.state.extraInfo.timeCreated)))}</p>
          <p> Twitter/Reddit?: {(this.state.extraInfo.text == true) ? "Twitter":"Reddit" }</p>
          <input type="Button" value="Close" onClick={this.toggleView.bind(this)}/>
        </div>
      )
    }
  }

  formatDates(startDate, endDate){
    // turns dates into epoch values
    if (startDate !== "" && endDate !== ""){
      const dates = [Date.parse(startDate), Date.parse(endDate)];
      return dates
    } else {
      return false
    }

  }

  formatResults(array){
    //formats results from json object into a dynamic list that is interactive
    var messages = []
    for (var i=0;i<array.length;i++){
      messages.push(array[i].text);
    }

    return (
      <ul className = "resultsList">
        {messages.map((post,key) =>(
          <li id={key} className="individualPost" onClick={this.getExtraInfo.bind(this, key)}>{post}</li>
        ))}
      </ul>
    )
  }

  toggleView(){
    // based on value selected in 'View' input field, certain elements are hidden and displayed
    if (this.state.resultsReturned == true){
      const mode = document.getElementById('viewSelector').value
      if (mode == "Numerical"){
        this.setState({numericalView: true, graphicalView:false, showExtraInfo:false});
      } else  if (mode == "Graphical"){
        this.setState({graphicalView: true, numericalView:false, showExtraInfo:false});
      } else if (mode == "Both"){
        this.setState({numericalView: true, graphicalView: true, showExtraInfo:false});
      } else {
        this.setState({numericalView: false, graphicalView: false, showExtraInfo:false});
      }
  }
  }

  formatStatistics(array){
    // collects the categories of all the posts
    var statistics = { categories:{positive:0, neutral:0, negative:0, unknown:0}};
    for (var i=0;i<array.length;i++){
      if (array[i].category == 'positive'){
        statistics.categories.positive++;
      }
      if (array[i].category == 'neutral'){
        statistics.categories.neutral++;
      }
      if (array[i].category == 'negative'){
        statistics.categories.negative++;
      }
      if (array[i].category =='unknown'){
        statistics.categories.unknown++;
      }
    }

    return statistics;
  }

  displayNumericalView(array){
    // renders element that will display the statstical breakdown of the posts
    const numbers = this.formatStatistics(array);
    if (this.state.numericalView == true){
      return(
        <div className='numerical'>
          <p>Positive {numbers.categories.positive}</p>
          <p>Negative {numbers.categories.negative}</p>
          <p>Neutral {numbers.categories.neutral}</p>
          <p>Unkown {numbers.categories.unknown}</p>
          </div>
      )
    }
  }

  displayGraphicalView(array){
    // creates a pie chart to display a graphical breakdown of the posts
    const numbers = this.formatStatistics(array);
    const pieChartData = {
      labels: ['Positive', 'Negative', 'Neutral', 'Unkown'],
      datasets: [
        {
          label: 'Sentiments',
          backgroundColor: [
            '#B21F00',
            '#C9DE00',
            '#2FDE00',
            '#00A6B4'
          ],
          hoverBackgroundColor: [
            '#501800',
            '#4B5000',
            '#17500',
            '#003350'
          ],
          data: [numbers.categories.positive,numbers.categories.negative,numbers.categories.neutral,numbers.categories.unknown ]

        }
      ]
    };
    if (this.state.graphicalView == true){
      return(
        <div className='graphical'>
       <Pie
        data = {pieChartData}
        options ={{
          title:{
            display: true,
            text:'Sentiments Classification',
            fontSize: 15
          },
          legend: {
            display: true,
            position: 'right'
          }
        }}
        />
        </div>
      )
    }
  }

   visibilityChecker(){
    // this function renders the results when a successful search is returned
    if (this.state.resultsReturned == false){
      return (
        <div className='App-NoResult'><h2>No Results Found</h2></div>
      )
    } else {
      var postsArray = [this.state.results];
      return(
        <div className='App-result'>
          <div className='posts'>
            <div>{this.formatResults(JSON.parse(postsArray))}</div>
          </div>
          {this.displayNumericalView(JSON.parse(postsArray))}
          {this.displayGraphicalView(JSON.parse(postsArray))}
          {this.displayExtraInfo()}
        </div>
      )
    } 
    
  };

  renderForm(){
    // renders form that user will user to search for posts as well as the results
    var self = this;
    return(
      <div>
      <form className='App-form'   >
          Search:<input id="searchTerm" type='text'></input>
          From:<input id ="startDate" type='date'></input>
          To:<input id="endDate" type='date'></input>
          View <select id="viewSelector" onChange={this.toggleView.bind(this)}>
          <option key="1" value="None">None</option>
          <option key="2" value="Numerical">Numerical</option>
          <option key="3" value="Graphical">Graphical</option>
          <option key="4" value="Both">Both</option>
          </select>
          <input type='Button' defaultValue='Submit' onClick ={this.getResults.bind(this)}/>
      </form>
      {self.visibilityChecker()}
      </div>
  )
  }
  
  render (){
    return(
    <div className="App">
      <header className="App-header">
        <h1>
        COVIDOnline - the Covid-19 social media tracker
        </h1>
      </header>
      <div className="App-body">
      {this.componentDidMount()}
      </div>
    </div>
    )
  }
};

export default App;
