const {remote, ipcRenderer} = require('electron')
const fs = require('fs')
const path = require('path')
const $ = window.$

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
    return `${(word.charAt(0).toUpperCase())}${(word.slice(1))}`
  }).join(' ')
}

/**
 * Sorts a table based on column content
 * @param {element} tbl The table to sort
 * @param {integer} n   The number column to sort by
 */
function sortTable (tbl, n) {
  var rows, i, x, y, shouldSwitch
  var switchCount = 0
  var switching = true
  var dir = 'asc'

  while (switching) {
    switching = false
    rows = tbl.getElementsByTagName('tr')
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false
      x = rows[i].getElementsByTagName('td')[n].innerHTML
      x = isNaN(x) ? x.toLowerCase() : parseFloat(x)
      y = rows[i + 1].getElementsByTagName('td')[n].innerHTML
      y = isNaN(y) ? y.toLowerCase() : parseFloat(y)

      if (dir === 'asc') {
        if (x > y) {
          shouldSwitch = true
          break
        }
      } else if (dir === 'desc') {
        if (x < y) {
          shouldSwitch = true
          break
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
      switchCount++
    } else {
      if (switchCount === 0 && dir === 'asc') {
        dir = 'desc'
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
 * Constructs the main content of the site
 * @param {object} div The div to render
 */
function buildContents (div) {
  $('#main-content').get(0).innerHTML += '<div></div>'
  let par = $('#main-content div').get(-1)

  for (let prt of div) {
    let add = ''

    switch (prt.proton) {
      case 'textbox':
        add = `<p>${prt.text.join('</p><p>')}</p></div>`
        break
      case 'list':
        if (prt.group !== undefined) {
          let groups = {}
          add = `<table>`

          for (let li of prt.items) {
            if (groups[li[prt.group]] === undefined) {
              groups[li[prt.group]] = []
            }
            groups[li[prt.group]].push(li)
          }

          for (var g in groups) {
            if (groups.hasOwnProperty(g)) {
              add += `<tr><td colspan="${Object.keys(prt.header).length - 1}"><h3>${g}</h3></td></tr>`
              add += `<tr><th>${prt.header.slice(prt.group + 1).join('</th><th>')}</th></tr>`

              for (let li of groups[g]) {
                add += `<tr><td>${li.slice(prt.group + 1).join('</td><td>')}</td></tr>`
              }
            }
          }
          add += `</table>`
        } else {
          add = `<table><thead><tr><th>${prt.header.join('</th><th>')}</th></tr></thead><tbody>`
          for (let li of prt.items) {
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
  let disp, func, elms

  window.site.mode = 'view'
  disp = 'add'
  func = newSite

  // XXX: Editing it too much for me to do
  // if (site.editable) {
  //   site.mode = md
  //   disp = md === 'view' ? 'edit' : 'pageview'
  //   func = function () {setSiteMode(md === 'view' ? 'edit' : 'view')}
  // } else {
  //   site.mode = 'view'
  //   disp = 'add'
  //   func = newSite
  // }

  if (window.site.mode === 'edit') {
    engageEditMode()
  } else {
    disengageEditMode()
  }
  $('#site-mode').html(disp)
  $('#site-mode').each(function () { this.onclick = func} )
}

function engageEditMode () {
  $('#site-title').css('cursor', 'pointer')
  $('#site-title').click(function () {
    window.edit = {
      ref: window.site,
      path: 'window.site'
    }
    $('#edit-form').append(`
      <div class="input-group">
        <input id="submit-title" name="title" type="text" value="${window.site.title}" required>
        <label for="submit-title">Title</label>
        <div class="input-bar"></div>
      </div>
      <input type="button" class="edit-button" value="Submit" onclick="stopEdit(0)">
      <input type="button" class="edit-button" value="Cancel" onclick="stopEdit(1)">
    `)
    showOverlay()
  })

  $('#site-links').append(`<a href="javascript:newNodeLink()" style="font-family:'Material Icons'">add</a>`)
}

function disengageEditMode () {
  $('#site-title').css('cursor', '')
  $('#site-title').click(function () {})

  $('#site-links a:last-child').remove()
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
 * Quits editing and save
 * @param {boolean} success Whether or not the user cancelled
 */
function stopEdit (code) {
  let tsite = {}
  for (var prop in window.site) {
    if (window.site.hasOwnProperty(prop)) {
      tsite[prop] = window.site[prop]
    }
  }
  delete tsite.name
  delete tsite.src
  delete tsite.mode

  if (code === 0) {
    if (window.edit !== undefined && window.site.editable) {
      $('#edit-form .input-group').each(function () {
        let k = this.children[1].innerText.toLowerCase()
        let v = this.children[0].value
        window.edit.ref[k] = v
      })
    } else if (window.site.editable === false) {
      console.log('<FileEdit> User attempted to edit a non-editable file!')
    } else {
      console.log('<FileEdit> Edit confirmed but no selected node.')
    }
  } else if (code === 1) {
    console.log('<FileEdit> User began to edit a node, but cancelled.')
  } else if (code === 2) {
    // HACK: The deletion code uses an exact copy of the data structure (can be duplicants)
    tsite = JSON.parse(JSON.stringify(tsite).replace(JSON.stringify(window.edit.ref), ''))
  }
  if (code !== 1) {
    fs.writeFile(window.site.src, JSON.stringify(tsite), function (e) { if (e) { throw e } })
    console.log('<FileEdit> File has been updated, now refreshing')
  }

  siteEmpty(false); siteLoad()
  hideOverlay()
}

/**
 * Generates a node edit form
 * @param {object}  path The node's path
 * @param {boolean} del Whether or not the node is deleteable
 */
function editNode (path, del = true) {
  window.edit = {
    ref: eval(path),
    path: path
  }
  for (var prop in window.edit.ref) {
    if (window.edit.ref.hasOwnProperty(prop)) {
      $('#edit-form').append(`
        <div class="input-group">
          <input id="submit-${prop}" name="${prop}" type="text" value="${window.edit.ref[prop]}" required>
          <label for="submit-${prop}">${prop.toTitleCase()}</label>
          <div class="input-bar"></div>
        </div>
      `)
    }
  }
  $('#edit-form').append(`
    <input type="button" class="edit-button" value="Submit" onclick="stopEdit(0)">
    <input type="button" class="edit-button" value="Cancel" onclick="stopEdit(1)">
    ${del ? '<input type="button" class="edit-button" value="Delete" onclick="stopEdit(2)">' : ''}
  `)

  showOverlay()
}
// </region>

/*
███    ██ ███████ ██     ██      ██████  ██████  ███    ██ ████████ ███████ ███    ██ ████████
████   ██ ██      ██     ██     ██      ██    ██ ████   ██    ██    ██      ████   ██    ██
██ ██  ██ █████   ██  █  ██     ██      ██    ██ ██ ██  ██    ██    █████   ██ ██  ██    ██
██  ██ ██ ██      ██ ███ ██     ██      ██    ██ ██  ██ ██    ██    ██      ██  ██ ██    ██
██   ████ ███████  ███ ███       ██████  ██████  ██   ████    ██    ███████ ██   ████    ██
*/
// <region> New Content
/**
 * Creates a new site
 * @param {boolean} success Whether or not the user cancelled
 */
function crtSite (success) {
  if (success) {
    let tsite = {}
    let dsite = {
      editable: 'true',
      links: [],
      contents: [[
        {
          proton: 'textbox',
          title: 'Fresh Site',
          text: [
            'This is a brand-new site. Please enter edit mode using the pencil at the top of the screen.'
          ]
        }
      ]]
    }
    $('#edit-form .input-group').each(function () {
      let k = this.children[1].innerText.toLowerCase()
      let v = this.children[0].value
      tsite[k] = v
    })
    dsite.title = tsite.title
    try {
      fs.writeFileSync(path.join(window.userData, 'sites', `${tsite.codename}.json`), JSON.stringify(dsite))
    } catch (e) {
      throw e
    }
  }

  fs.readdir(path.join(window.userData, 'sites'), function (e, f) {
    if (e) { throw e }
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
 * Create a new link
 */
function newNodeLink () {
  window.site.links.push(
    {
      display: 'New Link',
      link: 'http://example.com/'
    }
  )
  editNode(`window.site.links[${eval(window.site.links.length - 1)}]`, true)
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
  window.settings = Object.assign({}, remote.getGlobal('settings'))
  window.subsites = Object.assign({}, remote.getGlobal('subsites'))
  window.site = Object.assign({}, remote.getGlobal('site'))
  window.userData = remote.app.getPath('userData')
  fs.readdir(path.join(window.userData, 'sites'), function (e, f) {
    if (e) { throw e }
    window.subsites = f
  })

  setupIpc()
  changeSite(window.site.name)
})

/**
 * Configures IPC for renderer
 */
function setupIpc () {
  ipcRenderer.send('ipcReady')
}

/**
 * Changes the active site
 * @param {string} name The new site's name
 */
function changeSite (name) {
  window.site.src = path.join(window.userData, 'sites', `${name}.json`)
  if (name === 'home') { window.site.src = path.join(__dirname, 'home.json') }

  $.getJSON(window.site.src, (d) => {
    window.site = Object.assign({src: window.site.src}, d)
    window.site.name = name

    if (window.site.script) {
      eval(window.site.script.join('\n'))
    }
    siteEmpty(); siteLoad()
    ipcRenderer.send('siteChange', window.site)
  })
}

/**
 * Empties the current site's contents
 */
function siteEmpty (res = true) {
  if (res) { setSiteMode('view') }
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
  if (window.site.name !== 'home') {
    $('.flex-header #site-links').append('<a href="javascript:changeSite(\'home\')" data-edit="false">GameDay Home</a>')
  }
  for (let a of window.site.links) {
    $('.flex-header #site-links').append(`<a href="${a.link}">${a.display}</a>`)
  }

  for (let div of window.site.contents) { buildContents(div) }
  protonsLoad()
  if (window.site.mode === 'edit') { engageEditMode() }
}

/**
 * Handles the different protons
 */
function protonsLoad () {
  $('.proton-list span.sortable').click(function () {
    sortTable($(this).parents('table').get(0), $(this).parent().index())
    this.innerHTML = this.innerHTML === '▼' ? '▲' : '▼'
  })

  $('a').click(function (e) {
    if (window.site.mode === 'edit' && !this.dataset.edit) {
      if ($(this).parent().get(0) === $('#site-links').get(0)) {
        editNode(`window.site.links[${eval($(this).index()-1)}]`)
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
