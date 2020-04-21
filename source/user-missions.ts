import {JsonFileStore} from './file-store'
import {Mission} from './mission'

export const userMissions = new JsonFileStore<Mission[]>('users/missions/')
