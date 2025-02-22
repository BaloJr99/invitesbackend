import { IBaseSettings } from '../global/types.js'

export interface ISettingsRepository {
  getEventSettingsById(eventId: string): Promise<IBaseSettings[]>

  createEventSettings(eventSettings: IBaseSettings): Promise<string>

  updateEventSettings(eventSettings: IBaseSettings): Promise<void>
}
