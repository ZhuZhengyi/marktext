import { getMenuItemById } from '../../menu'

const typewriterModeMenuItemId = 'typewriterModeMenuItem'
const focusModeMenuItemId = 'focusModeMenuItem'
const sourceCodeModeMenuItemId = 'sourceCodeModeMenuItem'
const markMapModeMenuItemId = 'markMapModeMenuItem'

export const showCommandPalette = win => {
  win.webContents.send('mt::show-command-palette')
}

export const typeMode = (win, type, item) => {
  if (!win) {
    return
  }
  const { checked } = item
  win.webContents.send('mt::editor-change-view', { type, checked })

  if (type === 'sourceCode') {
    const markMapModeMenuItem = getMenuItemById(markMapModeMenuItemId)
    const typewriterModeMenuItem = getMenuItemById(typewriterModeMenuItemId)
    const focusModeMenuItem = getMenuItemById(focusModeMenuItemId)
    typewriterModeMenuItem.enabled = !checked
    focusModeMenuItem.enabled = !checked
    markMapModeMenuItem.enabled = !checked
  }
  if (type === 'markMap') {
    const sourceCodeModeMenuItem = getMenuItemById(sourceCodeModeMenuItemId)
    const typewriterModeMenuItem = getMenuItemById(typewriterModeMenuItemId)
    const focusModeMenuItem = getMenuItemById(focusModeMenuItemId)
    typewriterModeMenuItem.enabled = !checked
    focusModeMenuItem.enabled = !checked
    sourceCodeModeMenuItem.enabled = !checked
  }
}

export const layout = (item, win, type) => {
  if (win && win.webContents) {
    win.webContents.send('mt::set-view-layout', { [type]: item.checked })
  }
}

export const showTabBar = win => {
  const tabBarMenuItem = getMenuItemById('tabBarMenuItem')
  if (tabBarMenuItem && !tabBarMenuItem.checked && tabBarMenuItem.click) {
    tabBarMenuItem.click(tabBarMenuItem, win)
  }
}

// --- IPC events -------------------------------------------------------------

// NOTE: Don't use static `getMenuItemById` here, instead request the menu by
//       window id from `AppMenu` manager.

/**
 *
 * @param {*} applicationMenu The application menu instance.
 * @param {*} changes Array of changed view settings (e.g. [ {showSideBar: true} ]).
 */
export const viewLayoutChanged = (applicationMenu, changes) => {
  const changeMenuByName = (id, value) => {
    const menuItem = applicationMenu.getMenuItemById(id)
    menuItem.checked = value
  }

  for (const key in changes) {
    const value = changes[key]
    switch (key) {
      case 'showSideBar':
        changeMenuByName('sideBarMenuItem', value)
        break
      case 'showTabBar':
        changeMenuByName('tabBarMenuItem', value)
        break
      case 'sourceCode':
        changeMenuByName('sourceCodeModeMenuItem', value)
        break
      case 'markMap':
        changeMenuByName('markMapModeMenuItem', value)
        break
      case 'typewriter':
        changeMenuByName(typewriterModeMenuItemId, value)
        break
      case 'focus':
        changeMenuByName(focusModeMenuItemId, value)
        break
    }
  }
}
