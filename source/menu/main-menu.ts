import {MenuTemplate} from 'telegraf-inline-menu'

import {Context} from '../context'

import {backButtons} from './lib/generics'

import {menu as addMenu} from './add'
import {menu as gitMenu} from './git'
import {menu as listMenu} from './list'

export const mainMenu = new MenuTemplate<Context>('Hello World!')

mainMenu.submenu('List', 'list', listMenu)
mainMenu.submenu('Add', 'add', addMenu)
mainMenu.submenu('Changes as Git', 'git', gitMenu)

mainMenu.manualRow(backButtons)
