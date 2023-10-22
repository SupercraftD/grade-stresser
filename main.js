import './style.css'
import StudentVue  from 'studentvue'

const d = (id) =>{return document.getElementById(id)}
const dq = (id) =>{return document.querySelector(id)}

let selectedCourse;

let districtUrl = 'https://md-mcps-psv.edupoint.com'
let username = '176851'
let password = '1passant'
let client;

d('loginsubmit').onclick = async function(e){
  try{
    client = await StudentVue.login(districtUrl, {username: d('username').value, password: d('password').value})
  }catch(e){
    alert('error signing in')
    return
  }

  d('login').style.display = 'none'
  d('app').style.display = 'block'

  d('period').innerHTML = 'Loading...'


  let info = await client.studentInfo()
  dq('#profile > img').src = 'data:image/png;base64,'+info.photo
  dq('#profile > h3').innerHTML = info.student.name
  
  
  let gb = await client.gradebook()
  let rp = gb.reportingPeriod.current
  d('period').innerHTML = rp.name

  for (let course of gb.courses){
    let cc = d('course').cloneNode(true)
    cc.id = course.title
    cc.childNodes[1].innerHTML = course.title
    cc.childNodes[3].innerHTML = 'PD: '+course.period.toString() + '<br>' + 'RM: '+course.room + '<br>' + 'Staff: ' + course.staff.name
    cc.classList.add('course')
    
    cc.onclick = function(e){
      selectedCourse = course
      loadView()
    }

    d('app').appendChild(cc)
  }
}

window.onload = async function(e){
  
}

let weights = {
  'Practice / Preparation':0.1,
  'All Tasks / Assessments':0.9,
}

async function loadView(){
  window.scrollTo(0,0)
  d('app').style.display = 'none'
  d('view').style.display = 'block'
  
  d('viewtitle').innerHTML = selectedCourse.title
  d('viewinfo').innerHTML = 'Period: '+selectedCourse.period.toString() + '<br>'
    + 'Room: '+selectedCourse.room + '<br>' + 'Teacher: ' + selectedCourse.staff.name;
  let marks = selectedCourse.marks

  d('grade').innerHTML = (evalScore()*100).toString()+'%'
}

d('add').onclick = function(e){
  let name = prompt('name')
  let maxscore = parseFloat(prompt('Max Score'))
  if (isNaN(maxscore)){
    while (isNaN(maxscore)){
      maxscore = parseFloat(prompt('Max Score'))
    }
  }
  let score = parseFloat(prompt('Score'))
  if (isNaN(score)){
    while (isNaN(score)){
      score = parseFloat(prompt('Max Score'))
    }
  }
  let weight = parseFloat(prompt('weight (0.9 or 0.1)'))
  if (weight != 0.9 && weight != 0.1){
    while (weight != 0.9 && weight != 0.1){
      weight = parseFloat(prompt('weight (0.9 or 0.1)'))
    }
  }

  selectedCourse.marks[0].assignments.push({
    name:name,
    score:{value:`${score} out of ${maxscore}`},
    type:weight==0.9 ? 'All Tasks / Assessments' : 'Practice / Preparation',
    gradebookId: Math.floor(Math.random() * (500000 - 0 + 1) + 0)
  })
  d('grade').innerHTML = (evalScore()*100).toString()+'%'

}



function evalScore(){
  d('assignmentslist').innerHTML = ''
  let data = []
  for (let a of selectedCourse.marks[0].assignments){
    let an = d('assignment').cloneNode(true)
    an.childNodes[1].id = a.gradebookId
    an.id = a.name
    an.childNodes[3].innerHTML = a.name
    an.childNodes[5].innerHTML = 'Score: ' + a.score.value + '<br>' + 'Category: ' + a.type
    an.childNodes[1].onclick = function(e){
      let score = parseFloat(prompt('Score:'))
      if (isNaN(score)){
        while(isNaN(score)){
          score = parseFloat(prompt('Score: '))
        }
      }
      for (let assignment of selectedCourse.marks[0].assignments){
        if (assignment.gradebookId == this.id){
          assignment.score.value = `${score} out of ${assignment.score.value.split(' out of ')[1]}`  
        }
      }
      d('grade').innerHTML = (evalScore()*100).toString()+'%'
    }

    an.classList.add('assignment')
    d('assignmentslist').appendChild(an)

    data.push({
      score:parseFloat(a.score.value.split(' out of ')[0]),
      max:parseFloat(a.score.value.split(' out of ')[1]),
      weight:weights[a.type]
    })
  }


  let score = 0
  let maxscore = 0

  let at=0
  let atmax=0
  let pp=0
  let ppmax=0

  for (let d of data){
    if (!isNaN(d.score) && !isNaN(d.max)){
      if (d.weight){
        if (d.weight == 0.9){
          at += d.score
          atmax += d.max
        }else{
          pp+=d.score
          ppmax += d.max
        }
        score += d.score*d.weight
        maxscore += d.max*d.weight  
      }
    }
  }
  let rscore = ((at/atmax)*0.9) + ((pp/ppmax)*0.1)
  return Math.round((rscore) * 10000)/10000
}
d('back').onclick = function(e){
  window.scrollTo(0,0)
  d('assignmentslist').innerHTML = ''

  d('view').style.display = 'none'
  d('app').style.display = 'block'
}
