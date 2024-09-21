export interface IFullFamilyGroup {
  id: string
  familyGroup: string
  eventId: string
}

export type IFamilyGroup = Omit<IFullFamilyGroup, 'id'>
export type IPartialFamilyGroup = Omit<IFullFamilyGroup, 'eventId'>