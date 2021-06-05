if (window.location.pathname === '/') {

  class Clock extends React.Component {
    render() {
      return (
        <div className="box_clock">
            <div className="clock">
                <div className="hr"></div>
                <div className="mn"></div>
            </div>
            <a className="clock_btn btn btn-light" role="button" href={this.props.url}>{this.props.name}</a>            
        </div>
      );
    }
  }

  class RClocks extends React.Component {
    render() {
      return (
        <div className="container justify-content-center" id="index_body2">
          <Clock url="/methods/pom" name="Pomodoro" />
          <Clock url="/methods/per" name="Personalized Session" />
          <Clock url="/methods/gtd" name="Get Things Done" />
          <Clock url="/methods/dit" name="Do It Tomorrow" />
        </div>
      );
    }
  }
  
  ReactDOM.render(<RClocks />, document.querySelector("#clocks_content"));

}
else if (window.location.pathname.includes("/method")) {
  class Method extends React.Component {
    render() {
      return (
        <div>
          <h1 id="method_title">{this.props.name}</h1>
          <p id="method_text">{this.props.text}</p>            
        </div>
      );
    }
  }

  class RMethods extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        display: 'block'
      };
      this.goToList = this.goToList.bind(this);
      this.goToProgram = this.goToProgram.bind(this);
    }

    goToList() {
      this.setState({
        display: 'none'
      });
      MakeFormList();
    }

    goToProgram() {
      this.setState({
        display: 'none'
      });
      Program();
    }

    render() {
      let method;
      let button;
      if (window.location.pathname.includes("/pom")) {
        method = <Method name="Pomodoro" text="The Pomodoro Technique is centred on the idea that work should be broken down and completed in intervals separated by short breaks. That is, you work for 25 minutes, then take a five minutes break.
        Each of these 25-minute periods is called a “Pomodoro”. After 4 Pomodoros, you take a longer break of 15–20 minutes. Of course, nothing should interrupt an ongoing Pomodoro." />;
        button =  <a className="method_btn btn btn-light" role="button" id="method_btn" href="/counter" onClick={() => SetCounter('00', '25', '00', 'pom')}>Start Now!</a>;
      }
      if (window.location.pathname.includes("/per")) {
        method = <Method name="Personalized Session" text="With the personalized sessions you can study at your own pace! program the session time as needed." />;
        button = <button onClick={this.goToProgram} className="method_btn btn btn-light" id="method_btn">Go!</button>;
      }
      if (window.location.pathname.includes("/gtd")) {
        method = <Method name="Get Things Done" text="The Getting Things Done (GTD) method, starts by getting the user to write down all the things he wants or needs to do, and then assigning them specific time periods.
        The smaller tasks should be finished immediately, and the bigger tasks should be divided into smaller ones to start completing now." />;
        button = <button onClick={this.goToList} className="method_btn btn btn-light" id="method_btn">Go!</button>;
      }
      if (window.location.pathname.includes("/dit")) {
        method = <Method name="Do It Tomorrow" text="Here you can do a “will do” list, to schedule and organize your tasks for the next day in advance." />;
        button = <button onClick={this.goToList} className="method_btn btn btn-light" id="method_btn">Go!</button>;
      }
      return (
        <div className="container-sm" id="method_box" style={{display:`${this.state.display}`}}>
          {method}
          {button}
        </div>
      );      
    }
  }

  ReactDOM.render(<RMethods />, document.querySelector("#method"));
}
else if (window.location.pathname === '/mylist') {
  class RLists extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        method: 'Get Things Done',
        todayList : [],
        otherList: [],
        gtdactive: 'active',
        ditactive: ''
      };
      this.showList = this.showList.bind(this);
      this.fetchtasks = this.fetchtasks.bind(this);
      this.mylist = this.mylist.bind(this);
      this.seeContent = this.seeContent.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }

    handleDelete(event, id, method) {
      fetch(`list/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            delete: true
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
        this.handleClose();
        this.showList(event, method);
      });     
    }

    handleClose() {
      ReactDOM.unmountComponentAtNode(document.getElementById('popup'));
    }

    seeContent(event, task) {
      event.preventDefault();
      const Popup = (
        <div id="opacity">
          <div id="pop_main_div">
            <div id="close_btn_div">
              <button id="close_btn" onClick={() => this.handleClose()}>X</button>
            </div>
            <div className="row" id="pop_inner_div1">
              <div className="col-sm-12 col-lg-4">
                <h5>Title:</h5>
                <p>{task.task}</p>
              </div>
              <hr/>
              <div className="col-sm-12 col-lg-4">
                <h5>Time:</h5>
                <p>{task.time}</p>
              </div>
              <div className="col-sm-12 col-lg-4">
                <h5>Status:</h5>
                <p>{task.status}</p>
              </div>
            </div>
            <div className="row" id="pop_inner_div2">
              <div className="col-sm-12 col-lg-7">
                <h5>Description:</h5>
                <p>{task.descrip}</p>
              </div>
              <div className="col-sm-12 col-lg-5">
                <h5>Date of creation:</h5>
                <p>{task.dt_hr}</p>
              </div>
            </div>
            <div id="delete_pop_btn">
              <button className="btn btn-danger" onClick={event => this.handleDelete(event, task.id, task.method)}>Delete</button>
            </div>
          </div>
        </div>
      );

      ReactDOM.render(Popup, document.querySelector('#popup'))
    }
      
    fetchtasks(method) {
      fetch(`/list/${method}`)
      .then(response => response.json())
      .then(tasks => {
          tasks.today.forEach(task => this.mylist(task, "today"));
          tasks.other.forEach(task => this.mylist(task, "other"));
      });
    }

    showList(event, method) {
      event.preventDefault();
      let title;
      if(method === 'dit') {
        title = 'Do It Tomorrow';
        this.setState({
          ditactive: 'active',
          gtdactive: ''
        });
      }
      else {
        title = 'Get Things Done';
        this.setState({
          gtdactive: 'active',
          ditactive: ''
        });
      }
      this.setState({
        method: title,
        todayList: [],
        otherList: []
      });
      this.fetchtasks(method);
    }

    mylist(task, subsec) {
      let start_btn;
      let status;
      if(task.status === 'Undone') {
        status = <p style={{color: 'red'}}>{task.status}</p>;
        start_btn = <div><a className="btn btn-success" role="button" href="/counter" onClick={() => SetCounter(task.hr, task.mn, task.sc, `${task.id}`)}>Start Now!</a>;</div>;
      }
      else {
        status = <p style={{color: 'green'}}>{task.status}</p>;
      }
      const RTask = (
        <div key={task.id} className="task_input">
          <div>
            <a href="" onClick={event => this.seeContent(event, task)}>{task.task}</a>
          </div>
          <div>
            {task.time}
          </div>
          <div>
            {status}
          </div>
          {start_btn}
        </div>
      );
      if(subsec === 'today') {
        this.setState({
          todayList: this.state.todayList.concat(RTask),
        });
      }
      else {
        this.setState({
          otherList: this.state.otherList.concat(RTask),
        });
      }
    }

    componentDidMount() {
      this.fetchtasks("gtd");
    }

    render() {
      let other_title;
      if(this.state.method === 'Get Things Done') {
        other_title = <h3>Previous Tasks</h3>;
      }
      else {
        other_title = <h3>Tomorrow Tasks</h3>;
      }
      const Arrtoday = this.state.todayList;
      const Arrother = this.state.otherList;
      let today;
      let other;
      if(Arrtoday.length == 0) {
        today = <p>No tasks to show</p>        
      }
      else {
        today = Arrtoday.map((element) => element);
      }
      if(Arrother.length == 0) {
        other = <p>No tasks to show</p>
      }
      else {
        other = Arrother.map((element) => element);
      }
      return (
        <div className="card text-center">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <a className={`nav-link ${this.state.gtdactive}`} href="" onClick={event => this.showList(event, "gtd")}>Get Things Done</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${this.state.ditactive}`} href="" onClick={event => this.showList(event, "dit")}>Do It Tomorrow</a>
              </li>
            </ul>
          </div>
          <div className="card-body">
            <h1 className="card-title">{this.state.method}</h1>
            <div id="mylist_tasks_div">
              <h3>Today Tasks</h3>
              <div id="tasks_container_today">{today}</div>
              {other_title}
              <div id="tasks_container_other">{other}</div>
            </div>
          </div>
        </div>
      );
    }
  }
  ReactDOM.render(<RLists />, document.querySelector("#mylist"));
}
else if (window.location.pathname === '/counter') {

  const hour = parseInt(sessionStorage.getItem('hour'));
  const min = parseInt(sessionStorage.getItem('min'));
  const sec = parseInt(sessionStorage.getItem('sec'));
  const method = sessionStorage.getItem('method');

  console.log(hour, min, sec, method);

  class Cronometer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hour: hour,
        min: min,
        sec: sec,
      };
      this.updateHour = this.updateHour.bind(this);
      this.updateMin = this.updateMin.bind(this);
      this.updateSec = this.updateSec.bind(this);
      this.TheFinalCountDown = this.TheFinalCountDown.bind(this);
      this.totalTime = this.totalTime.bind(this);
    }

    totalTime() {
      const h = hour * 60;
      const totalmins = parseInt(min) + parseInt(h);
      const totalmill = totalmins * 60000;

      return totalmill;
    }

    updateHour() {
      let hr = this.state.hour;
      let mn = this.state.min;
      let timer;
      if(mn > 0) {
        timer = mn * 60000;
      }
      else {
        this.setState({
          hour: hr - 1
        });
        timer = 3600000;
      }
      const interval = setInterval(() => {
        let h = this.state.hour;
        if(h > 0) {
          this.setState({
            hour: h - 1
          });
        }
        else {
          clearInterval(interval);
        }
      }, timer);
    }

    updateMin() {
      let totalmill = this.totalTime() - 60000;
      let mn = this.state.min;
      if(mn == 0) {
        this.setState({
          min: 59
        });
      }
      else {
        this.setState({
          min: mn - 1
        });
      }
      const interval = setInterval(() => {
        let m = this.state.min;
        if(m > 0) {
          this.setState({
            min: m - 1
          });
        }
        if(m == 0) {
          this.setState({
            min: 59
          });
        }   
      }, 60000);
      setTimeout(() => {
        clearInterval(interval);           
      }, totalmill);
    }

    updateSec() {
      const totalmill = this.totalTime() - 1000;
      if(this.state.sec == 0) {
        this.setState({
          sec: 59
        });
      }
      const interval = setInterval(() => {
        let s = this.state.sec;
        if(s > 0) {
          this.setState({
            sec: s - 1
          });
        }
        if(s == 0) {
          this.setState({
            sec: 59
          });
        }
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);       
      }, totalmill);
    }

    TheFinalCountDown() {
      const totalmill = this.totalTime() + 500;
      setTimeout(() => {
        if(method === 'pom') {
          let c = confirm("Excelent, your Pomodoro session is done!\nDo you want to do another one?");
          if (c == true) {
            window.location = '/methods/pom';
          }
          else {
            window.location = '/';
          }
        }
        else if (method === 'per') {
          let c = confirm("Excelent, your personalized session is done!\nDo you want to program a new one?");
          if (c == true) {
            window.location = '/methods/per';
          }
          else {
            window.location = '/';
          }
        }
        else {
          fetch(`list/${method}`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'Done'
            })
          })
          let c = confirm("Excelent, your task is done!\nDo you want to continue with the next task?");
          if (c == true) {
            window.location = '/mylist';
          }
          else {
            window.location = '/';
          }
        }        
      }, totalmill);       
    }

    componentDidMount() {
      this.TheFinalCountDown();
      this.updateHour();
      this.updateMin();
      this.updateSec();
    }
  
    render() {
      return (
        <div id="cronometer">
          <div id="hr">
            {this.state.hour}:
          </div>
          <div id="mn">
            {this.state.min}:
          </div>
          <div id="sc">
            {this.state.sec}
          </div>
        </div>
      );
    }
  }

  ReactDOM.render(<Cronometer />, document.querySelector("#nums"));
}

function SetCounter(hr, mn, sc, method) {
  const hour = parseInt(hr);
  const min = parseInt(mn);
  const sec = parseInt(sc);

  sessionStorage.setItem('hour', hour);
  sessionStorage.setItem('min', min);
  sessionStorage.setItem('sec', sec);
  sessionStorage.setItem('method', method);  
}

function Program() {
  class Rprog extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        hours_value: 0,
        mins_value: 0,
        hrvalidation: '',
        mnvalidation: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.startProgram = this.startProgram.bind(this);
    }

    handleChange(event) {
      if(event.target.id === 'hrvl') {
        this.setState({
          hours_value: event.target.value
        });
      }
      else {
        this.setState({
          mins_value: event.target.value
        });
      }      
    } 

    startProgram(event) {
      const hours = this.state.hours_value;
      const mins = this.state.mins_value;
      if(hours == 0 && mins == 0) {
        event.preventDefault();
        this.setState({
          hrvalidation: 'is-invalid',
          mnvalidation: 'is-invalid'
        });
      }
      if(hours === '' || hours < 0 || hours > 24) {
        event.preventDefault();
        this.setState({
          hrvalidation: 'is-invalid'
        });
      }
      if(mins === '' || mins < 0 || mins > 59) {
        event.preventDefault();
        this.setState({
          mnvalidation: 'is-invalid'
        });
      }
      else {
        let h = hours;
        let m = mins;
        let s = '0';
        let method = 'per';

        SetCounter(h, m, s, method);
      }
    }

    render() {
      return (
        <div className="container-sm" id="program_box">
          <h1 id="form_title">Program your session</h1>
          <div id="inner_program_box">
            <div className="task_input">
              <div className="col-form-label" id="time-input-box-label">Define session's time :</div>
              <div className="time-input-box">
                <div>
                  <p>hours:</p>
                  <input id="hrvl" type="number" name="hours" min="0" max="24" className={`form-control inp_time ${this.state.hrvalidation}`} onChange={event => this.handleChange(event)} />
                </div>
                <div>
                  <p>minutes:</p>
                  <input id="mnvl" type="number" name="minutes" min="0" max="59" className={`form-control inp_time ${this.state.mnvalidation}`} onChange={event => this.handleChange(event)} />
                </div>
              </div>
            </div>
            <a href="/counter" className="btn btn-success" role="button" id="program_task_btn" onClick={this.startProgram}>Start Now!</a>
          </div>
        </div>
      );
    }
  }

  ReactDOM.render(<Rprog />, document.querySelector("#method"));
}

function MakeFormList() {
  class RForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        numTasks: 0,
        tasks_inputs: [],
      };
      this.NewTask = this.NewTask.bind(this);
      this.DeleteTask = this.DeleteTask.bind(this);
      this.validate = this.validate.bind(this);
    }

    validate(event) {
      const node = ReactDOM.findDOMNode(this);
      const task_inputs = node.querySelectorAll(".inp_task");
      task_inputs.forEach(task => {
        if(task.value === '' || task.value < 0 || task.value > 59) {
          event.preventDefault();
          task.className = 'form-control is-invalid inp_task';
        }
      });
    }

    DeleteTask() {
      if(this.state.tasks_inputs.length > 1) {
        let tempArray = this.state.tasks_inputs;
        tempArray.pop();
        this.setState({
          tasks_inputs: tempArray,
          numTasks: this.state.numTasks - 1,
        });
        console.log(this.state.tasks_inputs);
      }
      else {
        return false;
      }      
    }
    
    NewTask() {
      let i = this.state.numTasks;
      const RInput = (
        <div className="task_input">
          <div>
            <label htmlFor="inp_task" className="col-form-label">Title (max. 20 char)</label>
            <input className="form-control inp_task" type="text" maxLength="25" name={`task${i}`} />
          </div>
          <div>
            <p>Time</p>
            <div className="grid-time-div">              
              <p>hr:</p>
              <input type="number" name={`timehr${i}`} min="0" max="59" className="form-control inp_task" />             
              <p>mn:</p>
              <input type="number" name={`timemn${i}`} min="0" max="59" className="form-control inp_task" />
            </div>
          </div>
          <div>
            <label htmlFor="inp_time" className="col-form-label">Task Description (max. 280 char)</label>
            <textarea className="form-control inp_task" rows="2" maxLength="280" name={`desc${i}`}></textarea> 
          </div>
        </div>
      );
      console.log(this.state.tasks_inputs.length);
      this.setState({
        tasks_inputs: this.state.tasks_inputs.concat(RInput),
        numTasks: i + 1,
      });
      console.log(this.state.tasks_inputs);      
    }

    componentDidMount() {
      this.NewTask();
    }

    render() {
      let url;
      if(window.location.pathname.includes("/dit")) {
        url = '/list/dit';
      }
      else {
        url = '/list/gtd';
      }
      const input = this.state.tasks_inputs;
      return (
        <div className="container-sm" id="form_box">
          <h1 id="form_title">Create your to-do list</h1>
          <form id="task_form" action={url} method="post">
            {input.map((element) => element)}
            <input id="submit_tasks_btn" className="btn btn-success" type="submit" value="Save" onClick={this.validate}/>
          </form>
          <button className="btn btn-light" id="delete_task_btn" onClick={this.DeleteTask}>Delete Task -</button>
          <button className="btn btn-light" id="add_task_btn" onClick={this.NewTask}>Add Task +</button>
        </div>
      );
    }
  }

  ReactDOM.render(<RForm />, document.querySelector("#method"));
}