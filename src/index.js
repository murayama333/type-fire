import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css'
import php from "highlight.js/lib/languages/php";

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { AppBar, Card, CardContent, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Toolbar, Typography } from '@material-ui/core';
import axios from 'axios';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { createMuiTheme } from '@material-ui/core/styles';
import { LibraryBooks } from '@material-ui/icons';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1b5e20",
    },
    secondary: {
      main: '#f44336',
    },
  },
})

hljs.registerLanguage("php", php);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  containerStyle: {
    marginTop: 6 + "rem",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
  table: {
    minWidth: 650,
  },
  analyticsKeyboard: {
    marginBottom: 1 + "rem",
    textAlign: "center"
  }
}));

function InputField(props) {
  return (
    <TextField onChange={(e) => props.onChange(e)} value={props.textVal} size="medium" autoFocus />
  )
}

function KeywordCards(props) {
  const currentNo = props.currentNo
  let questions = props.questions.slice(currentNo + 1).map((q, i) => {
    return (<Grid container key={i} style={{ "marginBottom": "1rem" }}>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={4}>
        <Card style={{ "textAlign": "center" }}>
          <CardContent style={{ "paddingBottom": "1rem" }}>
            {q.content}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}></Grid>
    </Grid>)
  })

  return (<Grid container spacing={1}>
    {questions}
  </Grid>)
}

class Screen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      questions: [],
      currentNo: 0,
      charIndex: 0,
      textVal: "",
      answers: [],
      showHint: false,
      startTimes: [],
      endTimes: []
    }
  }

  componentDidMount() {
    const { startTimes } = this.state
    let { tag, count } = this.props.match.params
    if (count == null || isNaN(count)) {
      count = 5
    }
    axios.get("/" + tag + ".json", { params: {} }).then((response) => {
      const randomQuestions = response.data.sort(() => Math.random() - .5)
      const lastIndex = randomQuestions.length > count ? count : randomQuestions.length
      this.setState({
        questions: randomQuestions.slice(0, lastIndex)
      })
    }).catch((error) => {
      console.log(error)
    })

    startTimes.push(Date.now())
    this.setState({
      startTimes: startTimes
    })
  }

  input(e) {
    const questions = this.state.questions.slice()
    const currentNo = this.state.currentNo
    const content = questions[currentNo].content
    const charIndex = this.state.charIndex
    const textVal = this.state.textVal
    const char = content[charIndex]
    const answers = this.state.answers.slice()
    const startTimes = this.state.startTimes
    const endTimes = this.state.endTimes

    const inputKey = e.target.value[e.target.value.length - 1]

    if (answers.length === currentNo) {
      answers.push({
        content: "",
        times: []
      })
    }
    answers[currentNo].content = answers[currentNo].content + inputKey
    answers[currentNo].times.push(Date.now())
    this.setState({
      answers: answers
    })

    if (char === inputKey) {
      // change question
      if (content.length - 1 === charIndex) {
        // first
        if (currentNo === questions.length - 1) {
          const now = Date.now()
          endTimes.push(now)
          this.setState({
            endTimes: endTimes
          })
          this.props.history.push({
            pathname: "/score",
            state: {
              questions: questions,
              answers: answers,
              startTimes: startTimes,
              endTimes: endTimes,
            }
          })
        } else {
          // next
          const now = Date.now()
          startTimes.push(now)
          endTimes.push(now)
          this.setState({
            currentNo: currentNo + 1,
            charIndex: 0,
            textVal: "",
            startTimes: startTimes,
            endTimes: endTimes,
          })
        }
      } else {
        // next char
        this.setState({
          charIndex: charIndex + 1,
          textVal: textVal + inputKey,
        })
      }
    }
  }

  switchHint() {
    const showHint = this.state.showHint
    this.setState({
      showHint: !showHint
    })
  }

  renderContent(content) {
    const charIndex = this.state.charIndex
    let x = content.split("").map((c, i) => {
      if (i === charIndex) {
        return (
          <span key={i} className="active">{c}</span>
        )
      }
      return (
        <span key={i}>{c}</span>
      )
    })
    return x
  }

  render() {
    // const classes = useStyles();
    const { questions, currentNo, charIndex } = this.state
    if (questions.length === 0) {
      return (<div></div>)
    }
    const question = questions[this.state.currentNo]

    const containerStyle = {
      "marginTop": "6rem"
    }
    const textFieldCard = {
      "textAlign": "center",
      "marginTop": "1rem",
      "marginBottom": "1rem"
    }


    // const ch = questions[currentNo].content.split("")[charIndex]
    // const keyboard_keys = { [ch]: 1 }

    const chars = questions[currentNo].content.substr(charIndex).split("")
    const keyboard_keys = {}
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      keyboard_keys[ch] = keyboard_keys[ch] ? keyboard_keys[ch] + 1 : 1
    }

    return (
      <div>
        <Container style={containerStyle}>
          <Keyboard miss_type_count={keyboard_keys} mode="finger" />
          <Grid container spacing={1}>
            <Grid item xs={12} md={12}>
              <Card style={textFieldCard}>
                <CardContent>
                  <h1>
                    {this.renderContent(question.content)}
                  </h1>
                  <p>{question.desc}</p>
                  <InputField onChange={(e) => this.input(e)} textVal={this.state.textVal} />
                </CardContent>
              </Card>
            </Grid>
            <KeywordCards questions={questions} currentNo={currentNo} />
          </Grid>

        </Container>
      </div>
    );
  }
}

function Top(props) {
  const classes = useStyles();
  return (
    <div>
      <Container className={classes.containerStyle}>
        <Grid container>
          <Grid item xs={12} md={12}>

            <Keyboard show_fire={false} miss_type_count={{ "3": 1, "4": 1, "5": 1, "r": 1, "f": 1, "v": 1, "8": 1, "9": 1, "0": 1, "i": 1, "k": 1, ",": 1, "l": 1, ";": 1 }} />
            <Card style={{ "textAlign": "center", "marginTop": "1rem", "marginBottom": "1rem" }}>
              <CardContent>
                <h1>Type-Fire</h1>
                <p>Type-Fireはプログラミング初学者のためのタイピングアプリです。<br />
                プログラミング用語 x タイピング というどこかにありそうなコンセプトのもと開発しています。<br />
                リンクをクリックするとタイピングの練習が始まります。<br />
                </p>
              </CardContent>
            </Card>
            <Grid container spacing={1}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-basic/10">#php-basic(10)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-string/5">#php-string(5)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-array/5">#php-array(5)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-filesystem/5">#php-filesystem(5)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-all/10">#php-all(10)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-all/10">#php-all(20)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <Link to="/t/php-all/30">#php-all(30)</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent style={{ "paddingBottom": "16px", "textAlign": "center" }}>
                    <a href="https://twitter.com/murayama333" target="_blank" rel="noopener noreferrer">Twitter: murayama333</a>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

function Keyboard(props) {
  let { miss_type_count, mode } = props
  if (props.location != null) {
    miss_type_count = props.location.state.miss_type_count
  }

  const keys_list = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "["],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]"],
    ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "_"],
  ]

  const finger = (k) => {
    const f = keys_list.map(keys => keys.findIndex(key => key === k)).find(key => key !== -1)
    if (f === 0) {
      return "左小"
    }
    if (f === 1) {
      return "左薬"
    }
    if (f === 2) {
      return "左中"
    }
    if (f === 3) {
      return "左人"
    }
    if (f === 4) {
      return "左人"
    }
    if (f === 5) {
      return "右人"
    }
    if (f === 6) {
      return "右人"
    }
    if (f === 7) {
      return "右中"
    }
    if (f === 8) {
      return "右薬"
    }
    return "右小"
  }

  let miss_index = 0
  const miss_type_analytics = keys_list.map((keys) => {
    return keys.map(k => {
      miss_index++
      let message = "　"
      let cardClassName = "miss-card"
      if (miss_type_count != null && miss_type_count[k.toLowerCase()] != null) {
        if (mode === "count") {
          message = miss_type_count[k.toLowerCase()] + "F"
        } else if (mode === "finger") {
          message = finger(k.toUpperCase())
        } 
        if (miss_type_count[k.toLowerCase()] >= 3) {
          cardClassName += " active3"
        } else if (miss_type_count[k.toLowerCase()] === 2) {
          cardClassName += " active2"
        } else {
          cardClassName += " active"
        }
      }

      return (
        <Grid item xs={2} md={1} key={miss_index} className="miss-grid">
          <Card className={cardClassName}>
            <CardContent>
              <Typography color="textSecondary">
                {message}
              </Typography>
              <h1 className={message !== "　" ? "active" : ""}>{k}</h1>
            </CardContent>
          </Card>
        </Grid>
      )
    })
  })

  return (
    <Grid container spacing={1}>
      {miss_type_analytics}
    </Grid>
  )

}

function Score(props) {
  const { questions, answers, startTimes, endTimes } = props.location.state

  const miss_type_count = {}
  let totalTime = 0
  let question_content_length = 0
  let answer_content_length = 0
  const rows = questions.map((question, i) => {
    const answer = answers[i]
    const startTime = startTimes[i]
    const endTime = endTimes[i]

    const errors = []
    let offset = 0
    question.content.split("").forEach((q, i) => {
      const answer_content = answer.content.split("")
      while (q !== answer_content[i + offset]) {
        if (!errors.map(e => e.question_index).includes(i)) {
          errors.push({
            question_index: i,
            answer_indexes: [],
            type: {
              correct: q,
              incorrect: []
            }
          })
        }
        errors[errors.length - 1].answer_indexes.push(i + offset)
        const a = answer_content[i + offset]
        errors[errors.length - 1].type.incorrect.push(a)
        offset++
      }
    })

    const marked_question_contents = question.content.split("").map((q, i) => {
      const question_error = errors.map(e => e.question_index).some(e => e === i)
      if (question_error) {
        return (
          <span key={i} className="active">{q}</span>
        )
      }
      return (
        <span key={i}>{q}</span>
      )
    })

    const marked_answer_contents = answer.content.substr(0, 30).split("").map((a, i) => {
      const answer_error = errors.map(e => e.answer_indexes).flat().some(e => e === i)
      if (answer_error) {
        return (
          <span key={i} className="active">{a}</span>
        )
      }
      return (
        <span key={i}>{a}</span>
      )
    })

    // const type_errors = errors.map(e => {
    //   const {correct, incorrect} = e.type
    //   const incorrect_cases = incorrect.join(" ")
    //   return (
    //     <span key={i}>
    //       {correct} : {incorrect_cases}<br/>
    //     </span>
    //   )
    // })

    errors.forEach(e => {
      if (miss_type_count[e.type.correct] == null) {
        miss_type_count[e.type.correct] = e.type.incorrect.length
      } else {
        miss_type_count[e.type.correct] = miss_type_count[e.type.correct] + e.type.incorrect.length
      }
    })

    const accuracy = Math.floor((question.content.length / answer.content.length) * 100)
    question_content_length += question.content.length
    answer_content_length += answer.content.length

    // <TableCell align="center">{type_errors}</TableCell>
    const time = Math.floor((endTime - startTime) / 1000 * 100) / 100
    totalTime += time
    return (<TableRow key={i}>
      <TableCell align="center">{marked_question_contents}</TableCell>
      <TableCell align="center">
        {question.content === answer.content ?
          ("◯")
          :
          (<>{marked_answer_contents}</>)}
      </TableCell>
      <TableCell align="center">{accuracy}%</TableCell>
      <TableCell align="center">{time}s</TableCell>
      <TableCell align="center">
        <a href={question.url} target="_blank" rel="noopener noreferrer">
          <LibraryBooks color="primary" />
        </a>
      </TableCell>
    </TableRow>)
  })


  // const keys_list = [
  //   ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^"],
  //   ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "["],
  //   ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]"],
  //   ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "_"],
  // ]

  // let miss_index = 0
  // const miss_type_analytics = keys_list.map((keys) => {
  //   return keys.map(k => {
  //     miss_index++
  //     let message = "　"
  //     if (miss_type_count[k.toLowerCase()] != null) {
  //       message = miss_type_count[k.toLowerCase()] + "F"
  //     }
  //     const cardClassName = "miss-card" + (message !== "　" ? " active" : "")
  //     return (
  //       <Grid item xs={2} md={1} key={miss_index} className="miss-grid">
  //         <Card className={cardClassName}>
  //           <CardContent>
  //             <Typography color="textSecondary">
  //               {message}
  //             </Typography>
  //             <h1 className={message !== "　" ? "active" : ""}>{k}</h1>
  //           </CardContent>
  //         </Card>
  //       </Grid>
  //     )
  //   })
  // })

  const fire = answer_content_length - question_content_length
  let status
  let statusClassName
  if (fire > 0) {
    status = fire + " Fire!"
    statusClassName = "active"
  } else {
    status = "No Fire!"
    statusClassName = "excellent"
  }
  totalTime = Math.floor((totalTime) * 100) / 100

  const accuracy = Math.floor((question_content_length / answer_content_length) * 100)
  const typePerSecond = Math.floor(question_content_length / totalTime * 100) / 100
  const firePerSecond = Math.floor(fire / totalTime * 100) / 100
  const classes = useStyles();
  return (
    <div>
      <Container className={classes.containerStyle}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={12}>

            <Keyboard miss_type_count={miss_type_count} mode="count" />

            <Grid container spacing={2} style={{ "marginTop": "1rem" }}>
              <Grid item xs={12} md={9}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">キーワード</TableCell>
                        <TableCell align="center">タイピング</TableCell>
                        <TableCell align="center">ヒット率</TableCell>
                        <TableCell align="center">タイム</TableCell>
                        <TableCell align="center">解説ページ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card className="analyticsCard">
                  <CardContent>
                    <Typography color="textSecondary">
                      ステータス
                    </Typography>
                    <h1 className={statusClassName}>{status}</h1>
                  </CardContent>
                </Card>
                <Card className="analyticsCard">
                  <CardContent>
                    <Typography color="textSecondary">
                      ヒット率（{question_content_length} / {answer_content_length}）
                    </Typography>
                    <h1>{accuracy}%</h1>
                    <Typography color="textPrimary">

                    </Typography>
                  </CardContent>
                </Card>
                <Card className="analyticsCard">
                  <CardContent>
                    <Typography color="textSecondary">
                      タイム
                    </Typography>
                    <h1>{totalTime}s</h1>
                  </CardContent>
                </Card>
                <Card className="analyticsCard">
                  <CardContent>
                    <Typography color="textSecondary">
                      スピード（1秒あたりのタイプ数）
                    </Typography>
                    <h1>{typePerSecond} t/s</h1>
                  </CardContent>
                </Card>
                <Card className="analyticsCard">
                  <CardContent>
                    <Typography color="textSecondary">
                      Fireスピード（1秒あたりのFire数）
                    </Typography>
                    <h1>{firePerSecond} f/s</h1>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

function App(props) {
  const classes = useStyles();
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <AppBar>
            <Container style={{ "paddingLeft": "0" }}>
              <Toolbar>
                <Typography variant="h6">
                  <Link className={classes.link} to="/">Type-Fire v0.31</Link>
                </Typography>
              </Toolbar>
            </Container>
          </AppBar>

          <Route exact path="/" component={Top}></Route>
          <Route path="/t/:tag/:count" component={Screen}></Route>
          <Route path="/score" component={Score}></Route>
        </Router>
      </ThemeProvider>
    </>
  );
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
