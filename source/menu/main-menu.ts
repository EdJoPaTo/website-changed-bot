import {MenuTemplate} from 'grammy-inline-menu'

import {Context} from '../context.js'

import {backButtons} from './lib/generics.js'

import {menu as addMenu} from './add.js'
import {menu as gitMenu} from './git.js'
import {menu as listMenu} from './list.js'

export const mainMenu = new MenuTemplate<Context>('Hello World!')

mainMenu.submenu('List', 'list', listMenu)
mainMenu.submenu('Add', 'add', addMenu)
mainMenu.submenu('Changes as Git', 'git', gitMenu)

mainMenu.manualRow(backButtons)
