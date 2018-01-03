const remote = require('electron').remote
const fs = require('fs')
const path = require('path')
const url = require('url')
/*
██████  ██████   ██████  ████████  ██████  ████████ ██    ██ ██████  ███████
██   ██ ██   ██ ██    ██    ██    ██    ██    ██     ██  ██  ██   ██ ██
██████  ██████  ██    ██    ██    ██    ██    ██      ████   ██████  █████
██      ██   ██ ██    ██    ██    ██    ██    ██       ██    ██      ██
██      ██   ██  ██████     ██     ██████     ██       ██    ██      ███████
*/
// <region> Prototype
Location.prototype.query = (() => {
  let qs = document.location.search.split('+').join(' ')
  let re = /[?&]?([^=]+)=([^&]*)/g
  let params = {}
  let tokens
  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
  }
  return params
})()

function sortTable(tbl, n) {
  var rows, i, x, y, shouldSwitch
  var switchCount = 0
  var switching = true
  var dir = "asc"

  while (switching) {
    switching = false
    rows = tbl.getElementsByTagName("tr")
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false
      x = rows[i].getElementsByTagName("td")[n].innerHTML
      x = isNaN(x) ? x.toLowerCase() : parseFloat(x)
      y = rows[i + 1].getElementsByTagName("td")[n].innerHTML
      y = isNaN(y) ? y.toLowerCase() : parseFloat(y)

      if (dir === "asc") {
        if (x > y) {
          shouldSwitch= true
          break
        }
      } else if (dir === "desc") {
        if (x < y) {
          shouldSwitch= true
          break
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
      switchCount ++
    } else {
      if (switchCount === 0 && dir === "asc") {
        dir = "desc"
        switching = true
      }
    }
  }
}
// </region>

/*
██████  ██    ██ ██ ██      ██████  ███████ ██████  ███████
██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ ██
██████  ██    ██ ██ ██      ██   ██ █████   ██████  ███████
██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██      ██
██████   ██████  ██ ███████ ██████  ███████ ██   ██ ███████
*/
// <region> Builders
function buildHeader (inst) {
  for (a of inst.links) {
    $('.flex-header #site-links').append(`<a href="${a.link}">${a.display}</a>`)
  }
}

function buildContents (div) {
  $('#main-content').get(0).innerHTML += '<div></div>'
  let par = $('#main-content div').get(-1)

  for (prt of div) {
    let add = ''

    switch (prt.proton) {
      case 'textbox':
        add = `<p>${prt.text.join('</p><p>')}</p></div>`
        break
      case 'list':
        if (prt.group !== undefined) {
          let groups = {}
          add = `<table>`

          for (li of prt.items) {
            if (groups[li[prt.group]] === undefined) {
              groups[li[prt.group]] = []
            }
            groups[li[prt.group]].push(li)
          }

          for (var g in groups) {
            if (groups.hasOwnProperty(g)) {
              add += `<tr><td colspan="${Object.keys(prt.header).length - 1}"><h3>${g}</h3></td></tr>`
              add += `<tr><th>${prt.header.slice(prt.group + 1).join('</th><th>')}</th></tr>`

              for (li of groups[g]) {
                add += `<tr><td>${li.slice(prt.group + 1).join('</td><td>')}</td></tr>`
              }
            }
          }
          add += `</table>`

        } else {
          add = `<table><thead><tr><th>${prt.header.join('</th><th>')}</th></tr></thead><tbody>`
          for (li of prt.items) {
            add += `<tr><td>${li.join('</td><td>')}</td></tr>`
          }
          add += `</tbody></table>`
        }

        break
    }
    par.innerHTML += `
      <div class="proton-${prt.proton}">
        <h2 class="text-title">${prt.title}</h2>
        <hr>
        ${add}
      </div>
    `
  }
}
// </region>

/*
███    ██ ███████ ██     ██     ██████   █████   ██████  ███████
████   ██ ██      ██     ██     ██   ██ ██   ██ ██       ██
██ ██  ██ █████   ██  █  ██     ██████  ███████ ██   ███ █████
██  ██ ██ ██      ██ ███ ██     ██      ██   ██ ██    ██ ██
██   ████ ███████  ███ ███      ██      ██   ██  ██████  ███████
*/
// <region> New Page
function setSiteMode (md) {
  site.mode = md
  // $('#site-mode').html(other)
  // $('#site-mode').click(function () {
  //   setSiteMode(other)
  // })
}
// </region>

/*
██       ██████   █████  ██████
██      ██    ██ ██   ██ ██   ██
██      ██    ██ ███████ ██   ██
██      ██    ██ ██   ██ ██   ██
███████  ██████  ██   ██ ██████
*/
// <region> Load
$(function () {
  window.settings = remote.getGlobal('settings')
  window.subsites = remote.getGlobal('subsites')
  window.site = remote.getGlobal('site')
  changeSite(window.site.name)
})

function changeSite (name) {
  window.site.src = path.join(remote.app.getPath('userData'), 'sites', `${name}.json`)
  if (name === 'home') {window.site.src = path.join(__dirname, 'scripts', 'home.json')}

  $.getJSON(window.site.src, (d) => {
    window.site.name = name
    Object.keys(d).forEach(function (k) {
      window.site[k] = d[k]
    })

    if (window.site.script) {
      eval(window.site.script.join("\n"))
      delete window.site.script
    }
    siteEmpty()
    siteLoad()
  })
}
function siteEmpty () {
  setSiteMode('view')
  $('#site-links').html('')
  $('#site-title').html('')

  $('#main-content').html('')
}
function siteLoad () {
  document.title = `GameDay - ${window.site.title}`
  $('#site-title').html(window.site.title)

  buildHeader(window.site.header)
  for (div of window.site.contents) {
    buildContents(div)
  }
  protonsLoad()
}

function protonsLoad () {
  $('.proton-list span.sortable').click(function () {
    console.log($(this).parents('table').get(0), $(this).parent().index())
    sortTable($(this).parents('table').get(0), $(this).parent().index())
    this.innerHTML = this.innerHTML === '▼' ? '▲' : '▼'
  })

  $('a[href^="http"]').click(function (e) {
    remote.shell.openExternal(this.href)
    e.preventDefault()
 })
}
// </region>
