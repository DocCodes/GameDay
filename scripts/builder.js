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
/**
 * Gets a string's title
 * @return {string} The titled string
 */
String.prototype.toTitleCase = function () {
  return this.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase())+(word.slice(1))
  }).join(' ')
}

/**
 * Sorts a table based on column content
 * @param  {element} tbl The table to sort
 * @param  {integer} n   The number column to sort by
 */
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
/**
 * Constructs the header
 * @param  {object} inst The header instance
 */
function buildHeader (inst) {
  if (site.name !== 'home') {
    $('.flex-header #site-links').append('<a href="javascript:changeSite(\'home\')" data-edit="false">GameDay Home</a>')
  }
  for (a of inst.links) {
    $('.flex-header #site-links').append(`<a href="${a.link}">${a.display}</a>`)
  }
}

/**
 * Constructs the main content of the site
 * @param  {object} div The div to render
 */
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
███████ ██████  ██ ████████     ██████   █████   ██████  ███████
██      ██   ██ ██    ██        ██   ██ ██   ██ ██       ██
█████   ██   ██ ██    ██        ██████  ███████ ██   ███ █████
██      ██   ██ ██    ██        ██      ██   ██ ██    ██ ██
███████ ██████  ██    ██        ██      ██   ██  ██████  ███████
*/
// <region> Edit Page
/**
 * Sets the site's viewing mode
 * @param {string} md The viewing mode
 */
function setSiteMode (md) {
  let disp, func

  if (site.editable) {
    site.mode = md
    disp = md === 'view' ? 'edit' : 'pageview'
    func = function () {setSiteMode(md === 'view' ? 'edit' : 'view')}
  } else {
    site.mode = 'view'
    disp = 'add'
    func = newSite
  }

  $('#site-mode').html(disp)
  $('#site-mode').each(function () {this.onclick = func})
}

/**
 * Hides the overlay
 */
function hideOverlay () {
  $('#edit-overlay').addClass('hidden')
  setTimeout(function () {
    $('#edit-overlay').addClass('gone')
    $('#edit-form').html('')
  }, 550)
}

/**
 * Shows the overlay
 */
function showOverlay () {
  $('#edit-overlay.hidden').removeClass('gone')
  $('#edit-overlay').removeClass('hidden')
}

/**
 * Creates a new site
 * @param  {boolean} success Whether or not the user cancelled
 */
function crtSite (success) {
  if (success) {
    let tsite = {}
    let dsite = {
      editable: 'true',
      header: {links: []},
      contents: ''
    }
    $('#edit-form .input-group').each(function () {
      let k = this.children[1].innerText.toLowerCase()
      let v = this.children[0].value
      tsite[k] = v
    })
    dsite.title = tsite.title
    try {
      fs.writeFileSync(path.join(userData, 'sites', `${tsite.codename}.json`), JSON.stringify(dsite))
    } catch (e) {
      throw e
    }
  }

  fs.readdir(path.join(userData, 'sites'), function (e, f) {
    if (e) {throw e}
    window.subsites = f
    changeSite(window.site.name)
    hideOverlay()
  })
}

/**
 * Generates a new site form
 */
function newSite () {
  let ns = {codename: '', title: ''}
  for (var prop in ns) {
    if (ns.hasOwnProperty(prop)) {
      $('#edit-form').append(`
        <div class="input-group">
          <input id="submit-${prop}" name="${prop}" type="text" value="${ns[prop]}" required>
          <label for="submit-${prop}">${prop.toTitleCase()}</label>
          <div class="input-bar"></div>
        </div>
      `)
    }
  }
  $('#edit-form').append(`
    <input type="button" class="edit-button" value="Submit" onclick="crtSite(true)">
    <input type="button" class="edit-button" value="Cancel" onclick="crtSite(false)">
  `)
  showOverlay()
}

/**
 * Quits editing and save
 * @param  {boolean} success Whether or not the user cancelled
 */
function stopEdit (success) {
  let tsite = {}
  if (success && window.edit !== undefined && window.site.editable) {
    $('#edit-form .input-group').each(function () {
      let k = this.children[1].innerText.toLowerCase()
      let v = this.children[0].value
      window.edit[k] = v
    })

    for (var prop in window.site) {
      if (window.site.hasOwnProperty(prop)) {
        tsite[prop] = window.site[prop]
      }
    }
    delete tsite.name
    delete tsite.src
    delete tsite.mode
    fs.writeFile(window.site.src, JSON.stringify(tsite), function (e) {if (e) {throw e}})
    console.log('<FileEdit> File has been updated, now refreshing')
  } else if (window.site.editable === false) {
    console.log('<FileEdit> User attempted to edit a non-editable file!')
  } else if (success === false) {
    console.log('<FileEdit> User began to edit a node, buton cancelled.')
  } else {
    console.log('<FileEdit> Edit confirmed but no selected node.')
  }

  siteEmpty(false)
  siteLoad()
  hideOverlay()
}

/**
 * Generates a node edit form
 * @param  {object} loc The node to edit
 */
function editNode (loc) {
  window.edit = loc
  for (var prop in loc) {
    if (loc.hasOwnProperty(prop)) {
      $('#edit-form').append(`
        <div class="input-group">
          <input id="submit-${prop}" name="${prop}" type="text" value="${loc[prop]}" required>
          <label for="submit-${prop}">${prop.toTitleCase()}</label>
          <div class="input-bar"></div>
        </div>
      `)
    }
  }
  $('#edit-form').append(`
    <input type="button" class="edit-button" value="Submit" onclick="stopEdit(true)">
    <input type="button" class="edit-button" value="Cancel" onclick="stopEdit(false)">
  `)

  showOverlay()
  console.log(edit)
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
  window.userData = remote.app.getPath('userData')
  fs.readdir(path.join(userData, 'sites'), function (e, f) {
    if (e) {throw e}
    window.subsites = f
  })

  changeSite(window.site.name)
})

/**
 * Changes the active site
 * @param  {string} name The new site's name
 */
function changeSite (name) {
  window.site.src = path.join(userData, 'sites', `${name}.json`)
  if (name === 'home') {window.site.src = path.join(__dirname, 'scripts', 'home.json')}

  $.getJSON(window.site.src, (d) => {
    window.site.name = name
    delete window.site.script
    window.raw = {}
    Object.keys(d).forEach(function (k) {
      window.site[k] = d[k]
    })

    if (window.site.script) {
      eval(window.site.script.join("\n"))
    }
    siteEmpty()
    siteLoad()
  })
}

/**
 * Empties the current site's contents
 */
function siteEmpty (res = true) {
  if (res) {setSiteMode('view')}
  $('#site-links').html('')
  $('#site-title').html('')

  $('#main-content').html('')
}

/**
 * Renders the new site
 */
function siteLoad () {
  document.title = `GameDay - ${window.site.title}`
  $('#site-title').html(window.site.title)

  buildHeader(window.site.header)
  for (div of window.site.contents) {
    buildContents(div)
  }
  protonsLoad()
}

/**
 * Handles the different protons
 */
function protonsLoad () {
  $('.proton-list span.sortable').click(function () {
    console.log($(this).parents('table').get(0), $(this).parent().index())
    sortTable($(this).parents('table').get(0), $(this).parent().index())
    this.innerHTML = this.innerHTML === '▼' ? '▲' : '▼'
  })

  $('a').click(function (e) {
    if (site.mode === 'edit') {
      if (!this.dataset.edit) {
        editNode(window.site.header.links[$(this).index()-1])
      }
      e.preventDefault()
    } else {
      if (this.href.startsWith('http')) {
        remote.shell.openExternal(this.href)
        e.preventDefault()
      }
    }
 })
}
// </region>
